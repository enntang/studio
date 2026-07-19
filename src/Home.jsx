import { useEffect, useState } from 'react'
import { BASE, WORKS, getContentImages } from './data'
import Reveal from './Reveal'
import Sidebar from './Sidebar'

/**
 * 首頁：
 * - 固定左欄為共用的 Sidebar（見 Sidebar.jsx），PROJECT / ILLUSTRATION 篩選是連到
 *   #/project、#/illustration 的連結（見 App.jsx 的 categoryFromHash），從別頁點擊
 *   也能直接回首頁套用篩選，選單不會因為換頁而消失
 * - 主區域上方另有一排標籤篩選列（Notion 的 Tags 多選欄位），兩種篩選同時套用
 * - 主區域為多欄瀑布流（CSS columns），縮圖下方固定顯示標題與標籤，點擊進入獨立頁面
 */

// 所有作品目前用到的標籤，依字母排序
const ALL_TAGS = [...new Set(WORKS.flatMap((w) => w.tags || []))].sort()

// 每個作品的內文圖片（不含 cover），給列表頁 hover 輪播用
const HOVER_IMAGES = new Map(
  WORKS.map((w) => {
    const cover = w.cover ? BASE + w.cover : null
    const images = getContentImages(w.content).filter((src) => src !== cover)
    return [w.slug, images]
  })
)

const HOVER_INTERVAL_MS = 1200

// 列表縮圖：hover 時輪播該作品的每張圖，尺寸固定吃 cover 的比例（object-cover 疊圖，不會忽大忽小）
// 每張圖各自疊成一層、用 opacity 切換，讓瀏覽器對「上一張淡出、下一張淡入」做真正的 crossfade；
// hover 時把 cover 也淡出（而不是疊在最底層），PNG 透空的地方才不會看到 cover 的底圖穿出來
function WorkCard({ item, delay }) {
  const images = HOVER_IMAGES.get(item.slug) || []
  const [hovering, setHovering] = useState(false)
  const [activated, setActivated] = useState(false) // 第一次 hover 才開始載入輪播圖，避免沒 hover 過的卡片也預先抓圖
  const [index, setIndex] = useState(0)
  const showCarousel = hovering && images.length > 0

  useEffect(() => {
    if (!hovering || images.length === 0) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, HOVER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [hovering, images.length])

  return (
    <Reveal delay={delay} className='mb-8 break-inside-avoid'>
      <figure>
        <a
          href={`#/work/${item.slug}`}
          className='block w-full group'
          aria-label={`View ${item.title}`}
          onMouseEnter={() => { setHovering(true); setActivated(true) }}
          onMouseLeave={() => { setHovering(false); setIndex(0) }}
        >
          {item.cover ? (
            <div className='relative w-full overflow-hidden bg-neutral-100'>
              <img
                src={BASE + item.cover}
                alt={item.title}
                loading='lazy'
                className='w-full h-auto block transition-opacity duration-500'
                style={{ opacity: showCarousel ? 0 : 1 }}
              />
              {activated &&
                images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=''
                    aria-hidden='true'
                    className='absolute inset-0 w-full h-full object-cover transition-opacity duration-500'
                    style={{ opacity: showCarousel && i === index ? 1 : 0 }}
                  />
                ))}
            </div>
          ) : (
            // Notion 尚未上傳 Cover 時的暫代區塊
            <div className='aspect-[4/3] bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm tracking-widest'>
              {item.title}
            </div>
          )}
        </a>
        {/* 固定顯示標題與標籤 */}
        <figcaption className='mt-3'>
          <div className='font-bold tracking-wide text-sm'>{item.title}</div>
          {item.tags?.length > 0 && (
            <div className='mt-1 text-xs tracking-wide text-neutral-400'>
              {item.tags.map((t) => `#${t}`).join(' ')}
            </div>
          )}
        </figcaption>
      </figure>
    </Reveal>
  )
}

function Home({ category = null }) {
  const [tagFilter, setTagFilter] = useState(null) // null = all

  const items = WORKS.filter(
    (w) =>
      (category === null || w.category === category) &&
      (tagFilter === null || (w.tags || []).includes(tagFilter))
  )

  return (
    <div className='min-h-screen bg-white font-serif text-neutral-800'>
      <Sidebar active={category ?? 'all'} />

      {/* 瀑布流主區域 */}
      <main className='pl-8 pr-8 md:pl-72 md:pr-24 pt-10 md:pt-14 pb-24'>
        {/* 標籤篩選列 */}
        {ALL_TAGS.length > 0 && (
          <div className='flex flex-wrap gap-x-5 gap-y-2 mb-10 text-[13px] tracking-[0.1em] text-neutral-500'>
            <button
              className={`hover:opacity-60 transition-opacity ${tagFilter === null ? 'text-neutral-900 underline underline-offset-4' : ''}`}
              onClick={() => setTagFilter(null)}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`hover:opacity-60 transition-opacity ${tagFilter === tag ? 'text-neutral-900 underline underline-offset-4' : ''}`}
                onClick={() => setTagFilter(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className='columns-1 sm:columns-2 xl:columns-3 gap-8 [column-fill:balance]'>
          {items.map((item, i) => (
            <WorkCard key={item.slug} item={item} delay={(i % 4) * 90} />
          ))}
        </div>

        <footer className='mt-20 text-xs tracking-widest text-neutral-400'>
          © {new Date().getFullYear()} Enn Tang
        </footer>
      </main>
    </div>
  )
}

export default Home
