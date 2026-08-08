import { useCallback, useEffect, useRef, useState } from 'react'
import { BASE, HERO_SLIDES } from './data'

/**
 * 首頁最上方的大圖輪播（燈箱）：
 * - 每張圖疊成一層、用 opacity crossfade，跟 Home.jsx 縮圖 hover 輪播同一套做法，
 *   高度固定所以切換時版面不會跳動
 * - 自動輪播，滑鼠移上去或分頁切到背景時暫停（避免使用者在看圖時被換掉）
 * - 左右箭頭、右下角縮圖卡、底部進度條都吃同一個 index
 */

const AUTOPLAY_MS = 5000
const FADE_MS = 700

function ArrowButton({ label, onClick, children }) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      className='w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/75 hover:bg-white backdrop-blur flex items-center justify-center text-neutral-800 transition-colors'
    >
      {children}
    </button>
  )
}

function Hero() {
  const slides = HERO_SLIDES
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = slides.length

  const go = useCallback((delta) => setIndex((i) => (i + delta + total) % total), [total])

  // 自動輪播。index 進 deps 是故意的：手動切換後計時器重新起算，
  // 不會出現「才剛按下一張就馬上又自己跳掉」
  useEffect(() => {
    if (paused || total <= 1) return
    const id = setTimeout(() => go(1), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [index, paused, total, go])

  // 分頁切到背景時不要繼續跑
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // 左右方向鍵：只有輪播本身被 focus／hover 時才接手，不然會搶走頁面捲動
  const rootRef = useRef(null)
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
  const next = slides[(index + 1) % total]

  return (
    <section
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='精選作品'
      className='relative mb-12 md:mb-16 overflow-hidden bg-neutral-100 outline-none'
    >
      {/* 圖層：每張疊一層做 crossfade */}
      <div className='relative h-[56vw] max-h-[640px] min-h-[260px] md:h-[60vh]'>
        {slides.map((slide, i) => (
          <img
            key={slide.image}
            src={BASE + slide.image}
            alt={i === index ? slide.title : ''}
            aria-hidden={i === index ? undefined : 'true'}
            loading={i === 0 ? 'eager' : 'lazy'}
            className='absolute inset-0 w-full h-full object-cover transition-opacity'
            style={{ opacity: i === index ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          />
        ))}

        {/* 由下往上的暗角，讓左下角文字在任何圖上都讀得到 */}
        <div className='absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent pointer-events-none' />
      </div>

      {/* 底部一整條：左邊標題／進度，右邊控制項。用同一個 flex 容器排版，
          窄螢幕才不會兩塊各自絕對定位、疊在一起 */}
      <div className='absolute inset-x-0 bottom-0 px-5 md:px-8 pb-5 md:pb-7 flex items-end justify-between gap-4'>
        {/* 左下：標題 + 進度 */}
        <div className='min-w-0 text-white'>
          <div className='flex items-center gap-2 text-base md:text-xl font-bold tracking-wide'>
            <span aria-hidden='true' className='text-xs shrink-0'>
              ●
            </span>
            <span className='truncate'>{current.title}</span>
            <span className='opacity-80 shrink-0'>({total})</span>
          </div>

          <div className='mt-3 flex items-center gap-3 text-xs tracking-widest'>
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

        {/* 右下：上一張／下一張 + 下一張的縮圖卡 */}
        <div className='shrink-0 flex items-end gap-3 md:gap-4'>
          <div className='flex gap-2'>
            <ArrowButton label='上一張' onClick={() => go(-1)}>
              <svg
                viewBox='0 0 24 24'
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.6'
              >
                <path d='M19 12H5M5 12l6-6M5 12l6 6' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </ArrowButton>
            <ArrowButton label='下一張' onClick={() => go(1)}>
              <svg
                viewBox='0 0 24 24'
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.6'
              >
                <path d='M5 12h14M19 12l-6-6M19 12l-6 6' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </ArrowButton>
          </div>

          {/* 小螢幕放不下縮圖卡，只留箭頭 */}
          <div className='hidden sm:block'>
            <button
              type='button'
              onClick={() => go(1)}
              aria-label={`下一張：${next.title}`}
              className='block w-32 md:w-40 aspect-[4/3] overflow-hidden bg-neutral-200 hover:opacity-80 transition-opacity'
            >
              <img src={BASE + (next.thumb || next.image)} alt='' className='w-full h-full object-cover' />
            </button>
            <div className='mt-2 flex items-center justify-between gap-2 text-white'>
              <span className='text-[11px] tracking-widest truncate'>{next.label || next.title}</span>
              <a
                href={current.href || '#/'}
                aria-label={`前往 ${current.title}`}
                className='shrink-0 w-7 h-7 rounded-full border border-white/70 flex items-center justify-center hover:bg-white hover:text-neutral-900 transition-colors'
              >
                <svg
                  viewBox='0 0 24 24'
                  className='w-3.5 h-3.5'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M5 12h14M19 12l-6-6M19 12l-6 6' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
