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

// 首頁大圖輪播資料來自 Notion（npm run sync 產生），見 slider.generated.js
export { HERO_SLIDES } from './slider.generated'

// 首頁「服務項目」區塊。image 是 public/ 底下的相對路徑，
// 換圖直接覆蓋 public/service-images/ 底下的同名檔案即可。
export const SERVICES = [
  { key: 'uiux', name: 'UI/UX', nameZh: 'UI/UX 設計', image: 'service-images/UIUX.png' },
  { key: 'illustration', name: 'ILLUSTRATION', nameZh: '插畫設計', image: 'service-images/illustration.png' },
  { key: 'graphic', name: 'GRAPHIC', nameZh: '平面設計', image: 'service-images/graphic.png' },
]

// 首頁 Hero Tour：一段捲動驅動的區塊。先是滿版標題，接著三組主題依序沿著弧線
// 從右邊進場、到中心散開、再往左離場。
//
// 文字與圖片目前全部留空，填法：
// - title：滿版大標
// - scenes[].eyebrow / title / description：該組的小標、大標、說明
// - scenes[].images：public/ 底下的相對路徑陣列，建議 3~5 張。
//   留空的話會顯示虛線佔位框，方便先看動畫節奏
export const TOUR = {
  title: 'Services',
  subtitle: '服務項目',
  scenes: [
    { eyebrow: '', title: '', description: '', images: [] },
    { eyebrow: '', title: '', description: '', images: [] },
    { eyebrow: '', title: '', description: '', images: [] },
  ],
}

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
