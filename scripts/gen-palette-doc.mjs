import { writeFileSync } from 'node:fs'

const OUT = '/Users/programming/enn-studio/public/color-palette-preview.html'

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (h) => {
  const x = h.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const con = (a, b) => {
  const [p, q] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (p + 0.05) / (q + 0.05)
}
const r2 = (n) => n.toFixed(2)

const BRAND = {
  50: '#F1F6FF', 100: '#E0EBFF', 200: '#C2D8FF', 300: '#9DC0FF', 400: '#70A2FE',
  500: '#5182DE', 600: '#406EC7', 700: '#2C57AA', 800: '#1B428E', 900: '#092C70',
}
const INK = {
  50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5', 300: '#D4D4D4', 400: '#A3A3A3',
  500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0A0A0A',
}

const SEMANTIC = [
  ['primary', '#406EC7', 'brand-600', '可當內文的品牌藍。需要藍色小字時用這個，不要用 brand-500'],
  ['brand (DEFAULT)', '#5182DE', 'brand-500', 'logo 原色。只能用在大字標題與圖形，對比不足以當內文'],
  ['ink (DEFAULT)', '#262626', 'ink-800', '主文字。各頁 wrapper 的預設文字色'],
  ['body', '#525252', 'ink-600', '內文段落'],
  ['muted', '#737373', 'ink-500', '次要文字。這是仍能通過 AA 的最淡灰'],
  ['faint', '#A3A3A3', 'ink-400', '僅裝飾。未達 AA，不可用於需要閱讀的文字'],
  ['line', '#E5E5E5', 'ink-200', '分隔線、外框'],
  ['surface', '#FFFFFF', '—', '頁面底色'],
  ['surface-subtle', '#F5F5F5', 'ink-100', '圖片載入前的底色、區塊底色'],
]

// 全站用色稽核（數量來自 src/*.jsx 的類別統計，已完成 token 遷移）
const AUDIT = [
  ['text-muted', 14, '#737373', 'ok', '標籤、副標、年份、footer、進度百分比。原本是 neutral-400（2.52:1 未達 AA），已改用 muted'],
  ['text-body', 8, '#525252', 'ok', '內文段落'],
  ['text-ink', 6, '#262626', 'ok', '各頁預設文字色。原 neutral-800 與 neutral-900 已合併至此'],
  ['bg-surface', 5, '#FFFFFF', 'ok', '頁面底色'],
  ['bg-surface-subtle', 4, '#F5F5F5', 'ok', '圖片載入前的底色'],
  ['bg-ink-800', 4, '#262626', 'ok', '進度條、漢堡選單橫槓'],
  ['text-ink-700', 3, '#404040', 'ok', '側欄選單連結'],
  ['text-brand', 2, '#5182DE', 'ok', 'Services / Projects 標題。大字（≥24px 粗體）所以通過'],
  ['border-line', 2, '#E5E5E5', 'ok', '分隔線。原 neutral-100 與 neutral-200 已統一'],
  ['bg-line', 1, '#E5E5E5', 'ok', '進度條底槽'],
  ['text-white / bg-white', 2, '—', 'ok', 'Hero 疊在大圖上的文字與進度條。刻意保留字面白，這是「疊圖內容」不是頁面底色'],
  ['from-black/45', 1, '—', 'out', 'Hero 底部暗角，半透明，未納入系統'],
  ['bg-white/40', 1, '—', 'out', 'Hero 進度條底槽，半透明'],
  ['bg-white/90', 1, '—', 'out', '手機頂欄毛玻璃底'],
  ['ring-black/10', 1, '—', 'out', 'ZoomImage 放大鏡外框'],
]

// 站上實際出現的文字／底色組合
const PAIRS = [
  ['主文字', '#262626', '#FFFFFF'],
  ['內文', '#525252', '#FFFFFF'],
  ['次要文字 muted', '#737373', '#FFFFFF'],
  ['說明文字 faint（現況）', '#A3A3A3', '#FFFFFF'],
  ['選單連結', '#404040', '#FFFFFF'],
  ['標題品牌藍（大字）', '#5182DE', '#FFFFFF'],
  ['品牌藍小字（primary）', '#406EC7', '#FFFFFF'],
  ['白字於 ink-800 底', '#FFFFFF', '#262626'],
]

const swatchRow = (name, map) =>
  Object.entries(map)
    .map(([k, hex]) => {
      const c = con(hex, '#FFFFFF')
      const label = c >= 4.5 ? 'AA' : c >= 3 ? '大字' : '裝飾'
      const cls = c >= 4.5 ? 'ok' : c >= 3 ? 'warn' : 'no'
      return `<div class="sw">
        <div class="chip" style="background:${hex}"></div>
        <div class="meta"><b>${name}-${k}</b><code>${hex}</code>
        <span class="tag ${cls}">${r2(c)}:1 ${label}</span></div>
      </div>`
    })
    .join('')

const VERDICT = { ok: ['在系統內', 'ok'], warn: ['對比不足', 'warn'], merge: ['建議合併', 'warn'], out: ['系統外', 'no'] }

const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>色彩系統 — 一元復始 Return to One</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
<style>
  :root { --ink:#262626; --body:#525252; --muted:#737373; --line:#E5E5E5; --brand:#5182DE; }
  * { box-sizing: border-box; }
  body { margin:0; padding:48px 32px 96px; background:#fff; color:var(--ink);
    font-family:"Courier Prime", Georgia, "Noto Serif TC", serif; line-height:1.7; }
  .wrap { max-width: 1080px; margin: 0 auto; }
  h1 { font-size:32px; margin:0 0 4px; color:var(--brand); letter-spacing:.04em; }
  .sub { color:var(--muted); font-size:13px; letter-spacing:.2em; margin-bottom:8px; }
  .note { color:var(--body); font-size:13px; background:#F5F5F5; padding:12px 16px; border-radius:4px; }
  h2 { font-size:20px; margin:56px 0 6px; letter-spacing:.04em; }
  h2 + p { margin:0 0 20px; color:var(--muted); font-size:13px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
  .sw { border:1px solid var(--line); border-radius:6px; overflow:hidden; }
  .chip { height:64px; }
  .meta { padding:8px 10px; font-size:12px; display:flex; flex-direction:column; gap:2px; }
  .meta b { font-size:12px; letter-spacing:.05em; }
  .meta code { color:var(--muted); font-size:11px; }
  .tag { font-size:10px; padding:1px 6px; border-radius:99px; width:fit-content; letter-spacing:.05em; }
  .tag.ok { background:#E8F5E9; color:#1B5E20; }
  .tag.warn { background:#FFF4E5; color:#8A5300; }
  .tag.no { background:#FDECEC; color:#9B1C1C; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th, td { text-align:left; padding:9px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-size:11px; letter-spacing:.12em; color:var(--muted); font-weight:400; }
  td code { font-size:12px; background:#F5F5F5; padding:1px 5px; border-radius:3px; }
  .dot { display:inline-block; width:12px; height:12px; border-radius:3px; border:1px solid var(--line);
    vertical-align:-2px; margin-right:6px; }
  .pending { border:1px dashed var(--line); border-radius:6px; padding:20px; color:var(--muted); font-size:13px; }
  .logo-colors { display:flex; gap:12px; flex-wrap:wrap; }
</style>
</head>
<body>
<div class="wrap">

  <h1>色彩系統</h1>
  <div class="sub">一元復始 RETURN TO ONE</div>
  <p class="note">
    定義來源是 <code>tailwind.config.js</code>，這份文件是它的說明與檢查表，兩邊要保持一致。<br />
    使用原則：<b>元件請用語意層</b>（primary / body / muted…），需要精細調整時才改用字面色階（brand-600 / ink-500）。<br />
    所有對比度依 WCAG 2.1 計算，AA 標準為內文 4.5:1、大字（≥24px 粗體或 ≥18.66px 粗體）3:1。
  </p>

  <h2>語意層</h2>
  <p>日常開發只需要看這一張表。</p>
  <table>
    <tr><th>Token</th><th>色值</th><th>對應色階</th><th>對白對比</th><th>用途</th></tr>
    ${SEMANTIC.map(([t, hex, step, use]) => {
      const c = hex === '#FFFFFF' ? null : con(hex, '#FFFFFF')
      return `<tr>
        <td><span class="dot" style="background:${hex}"></span><code>${t}</code></td>
        <td><code>${hex}</code></td>
        <td>${step}</td>
        <td>${c ? r2(c) + ':1' : '—'}</td>
        <td>${use}</td>
      </tr>`
    }).join('')}
  </table>

  <h2>Brand — 品牌藍</h2>
  <p>500 是 logo 原色。注意 500 的對比只有 3.75:1，藍色小字必須用 600 以上。</p>
  <div class="grid">${swatchRow('brand', BRAND)}</div>

  <h2>Ink — 中性灰</h2>
  <p>色值沿用 Tailwind neutral，所以現有畫面完全不變。輔色定案後若需要調色溫，整組換掉即可。</p>
  <div class="grid">${swatchRow('ink', INK)}</div>

  <h2>Secondary — 輔色</h2>
  <p>尚未決定。</p>
  <div class="pending">
    輔色待補。決定之後同樣展開 50–900 十階、標註對比度，並在語意層加上 <code>secondary</code> 與相關別名。<br />
    候選方向：logo 小字的暖棕 <code>#413030</code>、三張服務插圖裡的黃／珊瑚紅／墨綠、或由品牌藍推導的補色。
  </div>

  <h2>Logo 用色</h2>
  <p>logo.svg 內含兩色。深棕目前只存在於檔案內部，尚未進入系統。</p>
  <div class="logo-colors">
    <div class="sw" style="width:220px">
      <div class="chip" style="background:#5182DE"></div>
      <div class="meta"><b>#5182DE</b><code>圖標 + RETURN TO ONE</code><span class="tag ok">= brand-500</span></div>
    </div>
    <div class="sw" style="width:220px">
      <div class="chip" style="background:#413030"></div>
      <div class="meta"><b>#413030</b><code>小字「一元復始」</code><span class="tag warn">未納入系統</span></div>
    </div>
  </div>

  <h2>全站用色稽核</h2>
  <p>掃描 src/*.jsx 得到的實際用色。全站已完成遷移，<b>不再有任何 Tailwind 預設的 neutral-* 類別</b>。</p>
  <table>
    <tr><th>現用 token</th><th>次數</th><th>色值</th><th>狀態</th><th>備註</th></tr>
    ${AUDIT.map(([cls, n, token, v, note]) => {
      const [label, cn] = VERDICT[v]
      return `<tr>
        <td><code>${cls}</code></td>
        <td>${n}</td>
        <td>${token === '—' ? '—' : `<code>${token}</code>`}</td>
        <td><span class="tag ${cn}">${label}</span></td>
        <td>${note}</td>
      </tr>`
    }).join('')}
  </table>

  <h2>對比度檢查</h2>
  <p>站上實際出現的文字／底色組合。</p>
  <table>
    <tr><th>組合</th><th>前景</th><th>背景</th><th>對比</th><th>AA 內文</th><th>AA 大字</th></tr>
    ${PAIRS.map(([name, fg, bg]) => {
      const c = con(fg, bg)
      return `<tr>
        <td>${name}</td>
        <td><span class="dot" style="background:${fg}"></span><code>${fg}</code></td>
        <td><span class="dot" style="background:${bg}"></span><code>${bg}</code></td>
        <td><b>${r2(c)}:1</b></td>
        <td><span class="tag ${c >= 4.5 ? 'ok' : 'no'}">${c >= 4.5 ? '通過' : '未達'}</span></td>
        <td><span class="tag ${c >= 3 ? 'ok' : 'no'}">${c >= 3 ? '通過' : '未達'}</span></td>
      </tr>`
    }).join('')}
  </table>

  <h2>Known Issues</h2>
  <table>
    <tr><th>項目</th><th>說明</th></tr>
    <tr>
      <td><b>已修</b>：淡灰文字未達 AA</td>
      <td>原 <code>text-neutral-400</code>（2.52:1）用在 11 處需要閱讀的文字上。這個問題在換新 logo
          之前就存在，舊版文件已記錄但一直未修。現已全數改為 <code>muted</code>（#737373，4.74:1 通過 AA）。</td>
    </tr>
    <tr>
      <td><code>faint</code> 目前無使用者</td>
      <td>這是刻意的。<code>faint</code>（#A3A3A3）未達 AA，只保留給真正的裝飾性元素。
          <b>不要拿它來寫需要讀的文字。</b></td>
    </tr>
    <tr>
      <td>半透明色未納管</td>
      <td><code>from-black/45</code>、<code>bg-white/40</code>、<code>bg-white/90</code>、<code>ring-black/10</code>
          四處直接寫在元件裡，沒有對應 token。數量少，待輔色定案後一併整理。</td>
    </tr>
    <tr>
      <td>疊圖白色刻意保留字面值</td>
      <td>Hero 疊在大圖上的文字與進度條用 <code>text-white</code> / <code>bg-white</code>，
          沒有換成 <code>surface</code>。因為那是「疊在影像上的內容」而非頁面底色，
          兩者語意不同，混用會讓日後換底色時出錯。</td>
    </tr>
    <tr>
      <td>輔色未定</td>
      <td>系統目前只有單一主色，缺少強調／狀態用色。</td>
    </tr>
  </table>

</div>
</body>
</html>
`

writeFileSync(OUT, html)
console.log('已寫入 ' + OUT + `（${html.length} bytes）`)
