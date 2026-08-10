import { useCallback, useEffect, useState } from 'react'
import { BASE, HERO_SLIDES } from './data'

/**
 * 首頁的滿版第一屏大圖輪播：
 * - 佔滿整個視窗高度（用 svh 讓手機網址列伸縮時不會跳動），在 Home.jsx 裡是排在
 *   <main> 外面的，才不會被側欄的左內距切掉
 * - 每張圖有三個階段：enter（由大縮到原尺寸、中央文字浮現）→ hold（停留）→
 *   exit（文字先消失、圖再淡出放大），跑完才換下一張。不是單純的 crossfade，
 *   前一張要完整退場才輪到下一張進場
 * - 滑鼠移入不暫停：第一屏是滿版的，游標幾乎一定在上面，會變成永遠不換圖。
 *   只有分頁切到背景時才停，切回來自己接著跑
 * - 沒有切換按鈕（設計上刻意拿掉），手動切換只剩鍵盤左右鍵
 */

// 一張圖的完整週期 = ENTER + HOLD + EXIT
const CURSOR_OFFSET = 16 // 小標離游標的距離，避免壓在游標下面
const CURSOR_LABEL_W = 96 // 小標的概略寬度，用來判斷靠近右邊緣時要不要翻邊

const ENTER_MS = 1000
const HOLD_MS = 2200
const EXIT_MS = 600

/**
 * 決定每一張圖該套哪組動畫。非目前這張一律 opacity-0 在背景待命。
 * 關掉系統動態效果時 motion-safe 的動畫不會生效，改由 transition-opacity 做單純淡入淡出。
 */
function imageClass(i, index, phase) {
  if (i !== index) return 'opacity-0'
  if (phase === 'exit') return 'opacity-0 motion-safe:animate-hero-image-out'
  return 'opacity-100 motion-safe:animate-hero-image-in'
}

/**
 * 有 href 就整塊變成連結，沒有就退回普通容器。
 * 這樣 Notion 的 Work 欄位留白時，不會產生一個點了沒反應的假連結。
 */
function LinkOrDiv({ href, title, className, children }) {
  if (!href) return <div className={className}>{children}</div>
  return (
    <a href={href} aria-label={`前往 ${title}`} className={className}>
      {children}
    </a>
  )
}

function Hero() {
  const slides = HERO_SLIDES
  const total = slides.length

  // index 與 phase 綁在同一個 state。分成兩個 useState 的話，「換下一張」會先送出
  // setIndex、下一個 render 才由 effect 補上 setPhase('enter')，中間夾的那一格會讓
  // 新的圖套到退場動畫（起始值 opacity 1）而閃一下全亮。合併成一次更新就沒有中間態
  const [slide, setSlide] = useState({ index: 0, phase: 'enter' }) // enter → hold → exit
  const { index, phase } = slide
  // 初始值直接讀 document.hidden：visibilitychange 只在「切換」時觸發，
  // 頁面本來就在背景分頁載入的話不會有事件，寫死 false 會讓它照樣空轉
  const [hidden, setHidden] = useState(() => document.hidden)
  const [cursor, setCursor] = useState(null) // 游標小標的位置，null 代表滑鼠不在上面

  const go = useCallback(
    (delta) => setSlide((s) => ({ index: (s.index + delta + total) % total, phase: 'enter' })),
    [total]
  )

  // enter → hold
  useEffect(() => {
    if (phase !== 'enter') return
    const id = setTimeout(() => setSlide((s) => ({ ...s, phase: 'hold' })), ENTER_MS)
    return () => clearTimeout(id)
  }, [phase, index])

  // hold → exit。分頁不可見時停住，切回來會自己接著跑
  useEffect(() => {
    if (phase !== 'hold' || hidden || total <= 1) return
    const id = setTimeout(() => setSlide((s) => ({ ...s, phase: 'exit' })), HOLD_MS)
    return () => clearTimeout(id)
  }, [phase, index, hidden, total])

  // exit 播完換下一張。index 與 phase 一起換，不會有中間態
  useEffect(() => {
    if (phase !== 'exit') return
    const id = setTimeout(
      () => setSlide((s) => ({ index: (s.index + 1) % total, phase: 'enter' })),
      EXIT_MS
    )
    return () => clearTimeout(id)
  }, [phase, index, total])

  // 分頁切到背景時不用白跑動畫（滑鼠移入不再暫停，因為第一屏是滿版的，
  // 游標幾乎一定在上面，會變成永遠不換圖）
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // 左右方向鍵：輪播被 focus 時才接手，不然會搶走頁面捲動
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    }
  }

  if (total === 0) return null

  const current = slides[index]

  // 游標旁的小標。滑鼠移入才有值，移出設回 null；觸控裝置不會觸發 mousemove，
  // 所以自然不會出現。座標是相對 section 的，不是頁面絕對座標
  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
  }

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={current.href ? onMouseMove : undefined}
      onMouseLeave={() => setCursor(null)}
      aria-roledescription='carousel'
      aria-label='精選作品'
      className={`relative h-screen [@supports(height:100svh)]:h-[100svh] overflow-hidden bg-surface-subtle outline-none ${
        current.href ? 'cursor-pointer' : ''
      }`}
    >
      {/* 整張大圖是連到該作品的連結。href 來自 Notion 的 Work 欄位（同步時已換算成
          站內網址），沒填的話就不包 <a>，避免出現點了沒反應的死連結 */}
      <LinkOrDiv href={current.href} title={current.title} className='block h-full'>
        {/* 圖層。只有目前這張會播動畫，其餘保持 opacity-0 在背景待命（順便預載）。
            動畫類別名稱一換，瀏覽器就會重播，所以不需要靠 key 強制重新掛載 */}
        <div className='relative h-full'>
          {slides.map((slide, i) => (
            <img
              key={slide.image}
              src={BASE + slide.image}
              alt={i === index ? slide.title : ''}
              aria-hidden={i === index ? undefined : 'true'}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageClass(i, index, phase)}`}
            />
          ))}

          {/* 中央文字用的整片遮罩。你的輪播圖偏亮（實測平均亮度 138 與 211），
              沒有這層的話白字會看不見。它跟著文字一起進退場 */}
          <div
            className={`absolute inset-0 bg-black/30 pointer-events-none ${
              phase === 'exit' ? 'motion-safe:animate-hero-scrim-out' : 'motion-safe:animate-hero-scrim-in'
            }`}
          />

          {/* 由下往上的暗角，讓左下角的進度在任何圖上都讀得到 */}
          <div className='absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent pointer-events-none' />
        </div>

        {/* 正中央：標題 + 說明文字 */}
        <div className='absolute inset-0 flex items-center justify-center px-8 pointer-events-none'>
          <div
            className={`max-w-2xl text-center text-white ${
              phase === 'exit' ? 'motion-safe:animate-hero-text-out' : 'motion-safe:animate-hero-text-in'
            }`}
          >
            <h2 className='text-2xl md:text-4xl font-bold tracking-wide'>{current.title}</h2>
            {current.label && (
              <p className='mt-3 text-xs md:text-sm tracking-[0.2em] opacity-85'>{current.label}</p>
            )}
          </div>
        </div>

        {/* 左下：進度 */}
        <div className='absolute inset-x-0 bottom-0 px-5 md:px-8 pb-5 md:pb-7'>
          <div className='min-w-0 text-white'>
            <div className='flex items-center gap-3 text-xs tracking-widest'>
              <span>{index + 1}</span>
              <span className='relative block w-20 md:w-28 h-px bg-white/40'>
                <span
                  className='absolute left-0 top-0 h-px bg-white transition-all duration-500'
                  style={{ width: `${((index + 1) / total) * 100}%` }}
                />
              </span>
              <span className='opacity-70'>{total}</span>
            </div>
          </div>
        </div>
      </LinkOrDiv>

      {/* 跟隨游標的小標。放在 LinkOrDiv 外面，才不會被連結的內容蓋住；
          pointer-events-none 讓它不擋點擊。靠近右／下邊緣時翻到游標另一側，
          否則會被 section 的 overflow-hidden 裁掉 */}
      {cursor && (
        <div
          className='absolute z-10 px-3 py-1.5 rounded-full bg-white/90 text-ink text-xs tracking-wide shadow-md pointer-events-none'
          style={{
            left: cursor.x + (cursor.x > cursor.w - CURSOR_LABEL_W ? -CURSOR_LABEL_W : CURSOR_OFFSET),
            top: cursor.y + (cursor.y > cursor.h - 60 ? -40 : CURSOR_OFFSET),
          }}
        >
          查看作品
        </div>
      )}
    </section>
  )
}

export default Hero
