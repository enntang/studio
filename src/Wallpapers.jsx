import { useEffect, useRef, useState } from 'react'
import { BASE, WALLPAPERS } from './data'

/**
 * 手機桌布下載頁：
 * - 左欄：mockup 縮圖格狀列表（可捲動），↑/↓ 鍵切換選取
 * - 右側：選中桌布的大圖 mockup + 下載按鈕（下載的是純圖 image，不是 mockup）
 */
function Wallpapers() {
  const [selected, setSelected] = useState(0)
  const thumbRefs = useRef([])

  const current = WALLPAPERS[selected]

  useEffect(() => {
    thumbRefs.current[selected]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected])

  useEffect(() => {
    if (WALLPAPERS.length === 0) return
    const onKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((i) => Math.min(i + 1, WALLPAPERS.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className='min-h-screen bg-white font-serif text-neutral-800 md:grid md:grid-cols-[22rem_1fr]'>
      {/* 左欄：縮圖列表 */}
      <aside className='px-8 md:px-10 pt-10 md:pt-14 pb-10 md:h-screen md:overflow-y-auto'>
        <a href='#/' className='block mb-10 hover:opacity-60 transition-opacity'>
          <div className='font-bold tracking-wider text-lg mb-1'>Enn Tang</div>
          <div className='text-xs tracking-[0.25em] text-neutral-400'>STUDIO</div>
        </a>

        <h1 className='text-sm tracking-[0.3em] text-neutral-500 mb-6'>WALLPAPERS 手機桌布</h1>

        {WALLPAPERS.length === 0 ? (
          <p className='text-sm text-neutral-400'>尚未上傳任何桌布。</p>
        ) : (
          <div className='grid grid-cols-3 gap-3'>
            {WALLPAPERS.map((w, i) => (
              <button
                key={w.slug}
                ref={(el) => (thumbRefs.current[i] = el)}
                onClick={() => setSelected(i)}
                aria-label={`View ${w.title}`}
                aria-current={i === selected}
                className={`block aspect-[9/19.5] overflow-hidden rounded-lg transition-opacity ${
                  i === selected ? 'ring-2 ring-neutral-800' : 'opacity-50 hover:opacity-90'
                }`}
              >
                <img src={BASE + w.mockup} alt={w.title} className='w-full h-full object-cover' />
              </button>
            ))}
          </div>
        )}

        <a
          href='#/'
          className='block mt-10 text-[13px] tracking-[0.15em] text-neutral-700 hover:opacity-50 transition-opacity'
        >
          ← ALL WORK
        </a>
      </aside>

      {/* 右側：大圖與下載 */}
      <main className='flex flex-col items-center justify-center px-8 py-16 md:py-0 min-h-[60vh]'>
        {current ? (
          <>
            <img
              key={current.slug}
              src={BASE + current.mockup}
              alt={current.title}
              className='max-h-[70vh] w-auto'
            />
            <div className='mt-8 text-center'>
              <div className='font-bold tracking-wider mb-4'>{current.title}</div>
              <a
                href={BASE + current.image}
                download
                className='inline-block text-[13px] tracking-[0.2em] border border-neutral-800 px-8 py-3 hover:bg-neutral-800 hover:text-white transition-colors'
              >
                DOWNLOAD
              </a>
            </div>
          </>
        ) : (
          <p className='text-sm text-neutral-400'>桌布準備中，敬請期待。</p>
        )}
      </main>
    </div>
  )
}

export default Wallpapers
