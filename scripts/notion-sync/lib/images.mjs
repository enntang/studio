import { createWriteStream, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { extname, join } from 'path'
import https from 'https'
import http from 'http'
import heicConvert from 'heic-convert'
import sharp from 'sharp'

/**
 * Notion 圖片的下載與最佳化，index.mjs 與 slider.mjs 共用。
 *
 * 原本兩支腳本各自有一份幾乎相同的 downloadImage／downloadFile／downloadBuffer，
 * 抽到這裡之後只需要維護一份，優化邏輯也不會兩邊改不同步。
 *
 * 下載後一律轉成 WebP 並縮到該用途需要的最大寬度（見各腳本傳入的 maxWidth）。
 * Notion 上的原圖動輒數 MB，直接放進 repo 會讓網站又肥又慢。
 * SVG 是向量、放大不失真，直接原樣存檔不轉。
 */

const QUALITY = 82 // 插畫與照片在 82 幾乎看不出與原圖的差異
const RASTER = /^\.(jpg|jpeg|png|gif|webp|heic|heif)$/i

/** 每次同步前清掉這個 slug 的舊圖，避免格式換掉後留下沒人引用的舊檔 */
export function resetImageDir(imageDir, slug) {
  const dir = join(imageDir, slug)
  if (existsSync(dir)) rmSync(dir, { recursive: true })
  mkdirSync(dir, { recursive: true })
}

/**
 * 下載一張圖並存成 WebP。
 * 回傳前端可用的相對路徑（不帶開頭斜線，由前端以 BASE + path 組合），失敗時回傳 null。
 */
export async function downloadImage({ url, imageDir, publicPrefix, slug, name, maxWidth }) {
  try {
    const dir = join(imageDir, slug)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const sourceExt = extname(new URL(url).pathname).split('?')[0].toLowerCase()

    // SVG 不轉：向量檔轉點陣只會變大又失真
    if (sourceExt === '.svg') {
      const filepath = join(dir, `${name}.svg`)
      await downloadFile(url, filepath)
      return `${publicPrefix}/${slug}/${name}.svg`
    }

    let buffer = await downloadBuffer(url)

    // 瀏覽器不吃 HEIC，sharp 也沒有 libheif，先用 heic-convert 轉成 PNG 再交給 sharp
    if (sourceExt === '.heic' || sourceExt === '.heif') {
      buffer = Buffer.from(await heicConvert({ buffer, format: 'PNG' }))
    } else if (!RASTER.test(sourceExt) && sourceExt !== '') {
      // 認不得的副檔名就原樣存檔，總比轉壞好
      const filepath = join(dir, `${name}${sourceExt}`)
      writeFileSync(filepath, buffer)
      return `${publicPrefix}/${slug}/${name}${sourceExt}`
    }

    const image = sharp(buffer, { animated: sourceExt === '.gif' })
    const meta = await image.metadata()
    if (meta.width > maxWidth) image.resize({ width: maxWidth, withoutEnlargement: true })

    const out = await image.webp({ quality: QUALITY, effort: 5 }).toBuffer()
    const filepath = join(dir, `${name}.webp`)
    writeFileSync(filepath, out)

    const saved = Math.round((1 - out.length / buffer.length) * 100)
    console.log(
      `      ${name}.webp  ${fmt(buffer.length)} → ${fmt(out.length)} (-${saved}%)  ${meta.width}→${Math.min(meta.width, maxWidth)}px`
    )
    return `${publicPrefix}/${slug}/${name}.webp`
  } catch (error) {
    console.error(`   ⚠️ 圖片處理失敗: ${url}`, error.message)
    return null
  }
}

const fmt = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`)

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const request = protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`))
      const file = createWriteStream(filepath)
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
      file.on('error', reject)
    })
    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const request = protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadBuffer(response.headers.location).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`))
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })
    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}
