export const BASE = import.meta.env.BASE_URL

// 作品資料來自 Notion（npm run sync 產生），見 works.generated.js
export { WORKS } from './works.generated'

// 從作品的 content（Markdown／HTML 混合）依出現順序取出所有圖片路徑，
// 給列表頁 hover 輪播用。同時支援 Markdown `![]()` 與同步腳本產出的 `<img src="">`
const CONTENT_IMG_REGEX = /!\[[^\]]*\]\(([^)\s]+)\)|<img[^>]+src="([^"]+)"/g

export function getContentImages(content) {
  if (!content) return []
  const out = []
  const seen = new Set()
  CONTENT_IMG_REGEX.lastIndex = 0
  let m
  while ((m = CONTENT_IMG_REGEX.exec(content))) {
    const raw = m[1] || m[2]
    if (!raw) continue
    const resolved = raw.startsWith('/') ? BASE + raw.slice(1) : raw
    if (!seen.has(resolved)) {
      seen.add(resolved)
      out.push(resolved)
    }
  }
  return out
}

// 桌布資料來自 Notion（npm run sync 產生），見 wallpapers.generated.js
export { WALLPAPERS } from './wallpapers.generated'

export const FILTERS = [
  { key: 'project', label: 'PROJECT' },
  { key: 'illustration', label: 'ILLUSTRATION' },
]

// 價目表資料：接案品項先放示意內容，之後直接改這個陣列即可
export const PRICING = [
  {
    name: 'UI / UX 設計',
    price: 'NT$ —— 起',
    note: '介面設計、原型製作、設計系統。依頁面數與複雜度報價。',
  },
  {
    name: '插畫委託',
    price: 'NT$ —— 起',
    note: '主視覺、書封、貼圖等。含兩次修改，商用授權另計。',
  },
  {
    name: '品牌視覺',
    price: 'NT$ —— 起',
    note: 'Logo、名片、社群模板等整套視覺識別。',
  },
]
