import { Client } from '@notionhq/client'
import { writeFileSync, existsSync, rmSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { downloadImage as downloadImageShared, resetImageDir } from './lib/images.mjs'

/**
 * 從 Notion 的 Home Slider 資料庫同步首頁大圖輪播到網站。
 *
 * Notion 欄位（資料庫：Home Slider）：
 * - Name（標題）：輪播左下角顯示的標題字
 * - Status（選項，Published 才同步）
 * - Order（數字，播放順序，小的在前）
 * - Image（Files，主視覺大圖）
 * - Thumb（Files，右下角縮圖卡；留空就沿用 Image）
 * - Label（文字，縮圖卡下方小字；留空就用連結作品的標題）
 * - Work（URL，直接貼 Studio Sync 裡作品頁面的連結）
 *   同步時會從網址取出 Notion page id，回頭讀那一頁的 Slug 欄位，
 *   換算成站內的 #/work/<slug>。這樣作品改標題或改 slug 都不會斷掉。
 *
 * 執行：npm run sync（需要 .env 內的 NOTION_API_KEY、NOTION_SLIDER_DATABASE_ID）
 * 沒有設定 NOTION_SLIDER_DATABASE_ID 時會直接略過，不影響作品與桌布同步。
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const SLIDER_FILE = join(__dirname, '../../src/slider.generated.js')
const IMAGE_DIR = join(__dirname, '../../public/hero-images')
const MANIFEST_FILE = join(__dirname, '../../.synced-slider.json')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

async function main() {
  if (!process.env.NOTION_SLIDER_DATABASE_ID) {
    console.log('ℹ️  未設定 NOTION_SLIDER_DATABASE_ID，略過輪播同步')
    return
  }
  if (!process.env.NOTION_API_KEY) {
    console.error('❌ 缺少 NOTION_API_KEY，請確認專案根目錄的 .env')
    process.exit(1)
  }

  console.log('🔍 正在從 Notion 獲取首頁輪播...')

  const syncedSlides = loadManifest()

  const response = await notion.databases.query({
    database_id: process.env.NOTION_SLIDER_DATABASE_ID,
    filter: {
      property: 'Status',
      select: { equals: 'Published' }
    },
    sorts: [{ property: 'Order', direction: 'ascending' }]
  })

  console.log(`🖼️  找到 ${response.results.length} 張已發布輪播圖\n`)

  const usedSlugs = new Set()
  const slides = []

  for (const page of response.results) {
    const props = page.properties
    const title = getTitle(props.Name)
    const slug = uniqueSlug(title || page.id, usedSlugs)

    console.log(`📝 處理: ${title || '(未命名)'} (${slug})`)

    const imageUrl = getFileUrl(props.Image)
    if (!imageUrl) {
      console.log('   ⚠️ 跳過：缺少 Image')
      continue
    }

    // 理由同 index.mjs：避免換格式後留下舊檔
    resetImageDir(IMAGE_DIR, slug)

    const image = await downloadImage(imageUrl, slug, 'image')
    if (!image) {
      console.log('   ⚠️ 圖片下載失敗，跳過')
      continue
    }

    // Thumb 沒填就讓前端沿用 Image，不重複下載同一張
    const thumbUrl = getFileUrl(props.Thumb)
    const thumb = thumbUrl && thumbUrl !== imageUrl ? await downloadImage(thumbUrl, slug, 'thumb') : ''

    const { href, workTitle } = await resolveWork(getUrl(props.Work))

    slides.push({
      slug,
      title,
      label: getText(props.Label) || workTitle || '',
      image,
      thumb: thumb || '',
      href: href || ''
    })

    usedSlugs.add(slug)
    syncedSlides.add(slug)
    console.log('   ✅ 完成\n')
  }

  const fileContent = `// 此檔案由 npm run sync 從 Notion 自動產生，請勿手動編輯。
// 首頁輪播的新增與修改請到 Notion 的 Home Slider 資料庫操作。
export const HERO_SLIDES = ${JSON.stringify(slides, null, 2)}
`
  writeFileSync(SLIDER_FILE, fileContent)
  console.log(`✅ 已寫入: src/slider.generated.js（共 ${slides.length} 張輪播圖）`)

  const publishedSlugs = slides.map((s) => s.slug)
  const { deletedCount, updatedSyncedSlides } = cleanupUnpublished(publishedSlugs, syncedSlides)
  if (deletedCount > 0) {
    console.log(`🗑️  已刪除 ${deletedCount} 張取消發布輪播圖的圖片`)
  }

  saveManifest(updatedSyncedSlides)
  console.log('✨ 輪播同步完成！')
}

// ============ Work 連結解析 ============

// Notion 的分享連結長這樣：
//   https://app.notion.com/p/enntang/<32碼 page id>?v=<32碼 view id>&source=copy_link
// query string 裡的 v= 也是 32 碼，所以只從 pathname 取，避免抓到 view id
function pageIdFromUrl(url) {
  try {
    const path = new URL(url).pathname
    const matches = path.match(/[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)
    if (!matches) return ''
    return matches[matches.length - 1].replace(/-/g, '')
  } catch {
    return ''
  }
}

async function resolveWork(url) {
  if (!url) return { href: '', workTitle: '' }

  const pageId = pageIdFromUrl(url)
  if (!pageId) {
    console.log(`   ⚠️ Work 連結看不出 page id，略過連結: ${url}`)
    return { href: '', workTitle: '' }
  }

  try {
    const page = await notion.pages.retrieve({ page_id: pageId })
    const slug = getText(page.properties?.Slug)
    const workTitle = getTitle(page.properties?.Name)
    const status = page.properties?.Status?.select?.name

    if (!slug) {
      console.log('   ⚠️ 連結的作品沒有 Slug，略過連結')
      return { href: '', workTitle }
    }
    if (status !== 'Published') {
      // 作品還沒發布的話網站上沒有那一頁，連過去會是空白
      console.log(`   ⚠️ 連結的作品 Status=${status || '(空)'}，網站上還看不到，略過連結`)
      return { href: '', workTitle }
    }

    console.log(`   🔗 連結作品: ${workTitle} → #/work/${slug}`)
    return { href: `#/work/${slug}`, workTitle }
  } catch (error) {
    console.log(`   ⚠️ 讀不到連結的作品（${error.message}），略過連結`)
    return { href: '', workTitle: '' }
  }
}

// ============ Slug 產生 ============

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueSlug(title, usedSlugs) {
  const base = slugify(title) || 'slide'
  let slug = base
  let n = 2
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n}`
    n++
  }
  return slug
}

// ============ Manifest 管理 ============

function loadManifest() {
  try {
    if (existsSync(MANIFEST_FILE)) {
      const data = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'))
      return new Set(data.syncedSlides || [])
    }
  } catch {
    console.log('⚠️ 無法讀取 manifest，將建立新的')
  }
  return new Set()
}

function saveManifest(syncedSlides) {
  const data = {
    lastSync: new Date().toISOString(),
    syncedSlides: [...syncedSlides]
  }
  writeFileSync(MANIFEST_FILE, JSON.stringify(data, null, 2))
}

// ============ 清理功能 ============

function cleanupUnpublished(publishedSlugs, syncedSlides) {
  let deletedCount = 0
  const updatedSyncedSlides = new Set(syncedSlides)

  for (const slug of syncedSlides) {
    if (!publishedSlugs.includes(slug)) {
      console.log(`🗑️  刪除取消發布的輪播圖片: ${slug}`)
      const imageDir = join(IMAGE_DIR, slug)
      if (existsSync(imageDir)) {
        rmSync(imageDir, { recursive: true })
      }
      updatedSyncedSlides.delete(slug)
      deletedCount++
    }
  }

  return { deletedCount, updatedSyncedSlides }
}

// ============ 圖片處理 ============

// 實作在 lib/images.mjs，兩支同步腳本共用；這裡只補上本腳本專屬的參數
function downloadImage(url, slug, name) {
  return downloadImageShared({
    url,
    imageDir: IMAGE_DIR,
    publicPrefix: 'hero-images',
    slug,
    name,
    maxWidth: 2560,
  })
}

// ============ Helper Functions ============

function getTitle(prop) {
  return prop?.title?.[0]?.plain_text || ''
}

function getText(prop) {
  return prop?.rich_text?.[0]?.plain_text || ''
}

function getUrl(prop) {
  return prop?.url || ''
}

function getFileUrl(prop) {
  const file = prop?.files?.[0]
  if (!file) return ''

  if (file.type === 'file') {
    return file.file?.url || ''
  }
  if (file.type === 'external') {
    return file.external?.url || ''
  }
  return ''
}

main().catch((error) => {
  console.error('❌ 輪播同步失敗:', error.message)
  process.exit(1)
})
