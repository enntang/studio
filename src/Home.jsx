import { useEffect, useState } from 'react'
import { BASE, WORKS, getContentImages } from './data'
import Hero from './Hero'
import HeroTour from './HeroTour'
import Reveal from './Reveal'
import Navbar from './Navbar'

/**
 * 首頁：
 * - 固定左欄為共用的 Sidebar（見 Sidebar.jsx），PROJECT / ILLUSTRATION 篩選是連到
 *   #/project、#/illustration 的連結（見 App.jsx 的 categoryFromHash），從別頁點擊
 *   也能直接回首頁套用篩選，選單不會因為換頁而消失
 * - 主區域上方另有一排標籤篩選列（Notion 的 Tags 多選欄位），兩種篩選同時套用
 * - 主區域為多欄瀑布流（CSS columns），縮圖下方固定顯示標題與標籤，點擊進入獨立頁面
 */

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
      {/* group 掛在 figure 而不是 a，這樣滑到下面的標題也會一起觸發圖片效果；
          圖片與標題的 hover 狀態才不會各走各的 */}
      <figure
        className='group'
        onMouseEnter={() => { setHovering(true); setActivated(true) }}
        onMouseLeave={() => { setHovering(false); setIndex(0) }}
      >
        <a
          href={`#/work/${item.slug}`}
          className='block w-full'
          aria-label={`View ${item.title}`}
        >
          {item.cover ? (
            // 外框固定不動、只裁切；旋轉與放大都發生在裡面的 <img> 上，
            // 所以圖片轉動時不會超出原本的版位（這點跟參考站一致）。
            // translateZ(0) 是 Safari 的老問題：圓角 + overflow-hidden + 子元素 transform
            // 會讓子元素從圓角溢出，強制建立合成層可以避免
            <div className='relative w-full overflow-hidden rounded-xl bg-surface-subtle [transform:translateZ(0)]'>
              <img
                src={BASE + item.cover}
                alt={item.title}
                loading='lazy'
                // motion-safe：使用者關掉系統動態效果時就不旋轉，只留輪播的淡入淡出
                className='w-full h-auto block transition-[opacity,transform] duration-500 ease-out motion-safe:group-hover:rotate-2 motion-safe:group-hover:scale-110'
                style={{ opacity: showCarousel ? 0 : 1 }}
              />
              {activated &&
                images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=''
                    aria-hidden='true'
                    className='absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out motion-safe:group-hover:rotate-2 motion-safe:group-hover:scale-110'
                    style={{ opacity: showCarousel && i === index ? 1 : 0 }}
                  />
                ))}
            </div>
          ) : (
            // Notion 尚未上傳 Cover 時的暫代區塊
            <div className='aspect-[4/3] rounded-xl bg-surface-subtle flex items-center justify-center text-muted text-sm tracking-widest'>
              {item.title}
            </div>
          )}
        </a>
        {/* 固定顯示標題與標籤。標題 hover 變品牌藍，用 primary（brand-600）而不是
            brand-500——500 對白只有 3.75:1，這個字級不算大字，會不符 AA */}
        <figcaption className='mt-3'>
          <div className='font-bold tracking-wide text-base md:text-lg transition-colors duration-300 group-hover:text-primary'>
            {item.title}
          </div>
          {item.tags?.length > 0 && (
            <div className='mt-1 text-xs tracking-wide text-muted'>
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

  // 切換分類時重置標籤篩選，避免帶著上個分類的標籤導致清單意外變空
  useEffect(() => {
    setTagFilter(null)
  }, [category])

  // 標籤只從目前分類的作品收集，illustration 目前沒有標籤，篩選列就不會顯示
  const categoryWorks = WORKS.filter((w) => category === null || w.category === category)
  const ALL_TAGS = [...new Set(categoryWorks.flatMap((w) => w.tags || []))].sort()

  const items = categoryWorks.filter(
    (w) => tagFilter === null || (w.tags || []).includes(tagFilter)
  )

  // 未篩選的首頁才有滿版第一屏；進到 PROJECT／ILLUSTRATION 就直接看清單
  const showHero = category === null

  return (
    <div className='min-h-screen bg-surface font-serif text-ink'>
      {/* 滿版第一屏放在 <main> 外面，才不會被下面那層左右內距切掉 */}
      {showHero && <Hero />}

      <Navbar active={category ?? 'all'} overHero={showHero} />

      {/* 瀑布流主區域 */}
      <main
        className={`px-8 md:px-24 pb-24 ${showHero ? 'pt-16 md:pt-20' : 'pt-28 md:pt-40'}`}
      >
        {showHero && <HeroTour />}

        {/* 作品區標題。放在篩選列外面，這樣沒有標籤的分類（illustration）也看得到 */}
        <header className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-wide text-brand'>Projects</h1>
          <p className='mt-1 text-xs tracking-[0.2em] text-muted'>設計案例</p>
        </header>

        {/* 標籤篩選列 */}
        {ALL_TAGS.length > 0 && (
          <div className='flex flex-wrap gap-x-5 gap-y-2 mb-10 text-[13px] tracking-[0.1em] text-muted'>
            <button
              className={`hover:opacity-60 transition-opacity ${tagFilter === null ? 'text-ink underline underline-offset-4' : ''}`}
              onClick={() => setTagFilter(null)}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`hover:opacity-60 transition-opacity ${tagFilter === tag ? 'text-ink underline underline-offset-4' : ''}`}
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

        <footer className='mt-20 text-xs tracking-widest text-muted'>
          © {new Date().getFullYear()} Enn Tang
        </footer>
      </main>
    </div>
  )
}

export default Home
