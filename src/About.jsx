import { BASE } from './data'

/**
 * 個人簡介頁（版面參照 zaoridraws.cargo.site 的 Profile 頁）：
 * - 左欄：文字標示（回首頁）、返回連結
 * - 右側：大頭照、簡介文字、學歷
 *
 * 簡介文字目前是預留內容，請直接改這個檔案裡的文字。
 */
function About() {
  return (
    <div className='min-h-screen bg-white font-serif text-neutral-800 md:grid md:grid-cols-[18rem_1fr]'>
      <aside className='px-8 md:pl-10 md:pr-6 pt-10 md:pt-14 md:sticky md:top-0 md:h-screen flex flex-col'>
        <a href='#/' className='flex justify-center md:block mb-12 hover:opacity-60 transition-opacity'>
          <img src={BASE + 'logo.svg'} alt='一元復始' className='h-[60px] md:h-[80px] w-auto' />
        </a>

        <h1 className='text-sm tracking-[0.3em] text-neutral-500'>PROFILE</h1>

        <a
          href='#/'
          className='mt-12 md:mt-auto md:mb-14 text-[13px] tracking-[0.15em] text-neutral-700 hover:opacity-50 transition-opacity'
        >
          ← ALL WORK
        </a>
      </aside>

      <main className='px-8 md:pl-0 md:pr-24 pt-8 md:pt-14 pb-24 max-w-2xl'>
        <img
          src={BASE + 'avatar.png'}
          alt='Enn Tang'
          className='w-40 h-40 object-cover rounded-full mb-10'
        />

        <h2 className='text-xl font-bold tracking-wide mb-4'>Enn Tang</h2>

        {/* 以下為預留文字，請改成你自己的簡介 */}
        <p className='text-sm leading-relaxed text-neutral-600 mb-4'>
          台灣接案設計師與插畫家。作品橫跨 UI / UX 設計、插畫、品牌視覺等領域。
        </p>
        <p className='text-sm leading-relaxed text-neutral-600 mb-10'>
          （這裡放更多關於你的介紹文字，例如創作理念、擅長領域、合作經驗等。）
        </p>

        <h3 className='text-xs tracking-[0.2em] text-neutral-400 mb-3'>學歷</h3>
        <p className='text-sm leading-relaxed text-neutral-600 mb-10'>
          國立臺灣科技大學 設計系 碩士
        </p>

        <div className='text-sm text-neutral-600 space-y-2'>
          <div>
            近期動態 →{' '}
            <a
              href='https://www.instagram.com/enn.illust/'
              target='_blank'
              rel='noreferrer'
              className='font-bold underline underline-offset-4 hover:opacity-60'
            >
              Instagram
            </a>
          </div>
          <div>
            工作邀約 →{' '}
            <a href='#/contact' className='font-bold underline underline-offset-4 hover:opacity-60'>
              Contact
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About
