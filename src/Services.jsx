import { BASE, SERVICES } from './data'
import Reveal from './Reveal'

/**
 * 首頁「服務項目」區塊（放在輪播與作品列表之間）：
 * 每一項是「插圖 + 英文名 + 中文名」的直式卡片，三欄並排，窄螢幕改單欄。
 * 標題樣式與 Home.jsx 的 Projects 標題共用同一組（英文大字 + 中文小字）。
 */
function Services() {
  if (SERVICES.length === 0) return null

  return (
    <section className='mb-14 md:mb-20'>
      <header className='mb-8'>
        <h2 className='text-2xl md:text-3xl font-bold tracking-wide text-brand'>Services</h2>
        <p className='mt-1 text-xs tracking-[0.2em] text-muted'>服務項目</p>
      </header>

      <ul className='grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6'>
        {SERVICES.map((service, i) => (
          <li key={service.key}>
            <Reveal delay={i * 90}>
              <figure className='text-center'>
                {/* 插圖本身是裝飾，資訊都在下面的文字裡，所以 alt 留空 */}
                <img
                  src={BASE + service.image}
                  alt=''
                  loading='lazy'
                  className='w-full max-w-[220px] mx-auto aspect-square object-contain'
                />
                <figcaption className='mt-3'>
                  <div className='text-sm md:text-base font-bold tracking-[0.12em]'>{service.name}</div>
                  <div className='mt-1 text-xs tracking-[0.15em] text-muted'>{service.nameZh}</div>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Services
