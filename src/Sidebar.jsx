import { useState } from 'react'
import { BASE, FILTERS } from './data'

/**
 * 首頁、Profile、Contact 共用的左側導覽，確保切頁時選單維持完整、只有 active 狀態不同。
 * ALL WORK / PROJECT / ILLUSTRATION 都是連到對應 hash 路由的連結（見 App.jsx 的
 * categoryFromHash），所以從任何頁面點擊都能回首頁並套用篩選，不只是首頁內部切換。
 */
const CATEGORY_ITEMS = [
  { key: 'all', href: '#/', label: 'ALL WORK' },
  ...FILTERS.map((f) => ({ key: f.key, href: `#/${f.key}`, label: f.label })),
]

const PAGE_ITEMS = [
  { key: 'profile', href: '#/about', label: 'PROFILE' },
  { key: 'contact', href: '#/contact', label: 'CONTACT' },
]

function NavLinks({ active, onNavigate }) {
  return (
    <>
      {[...CATEGORY_ITEMS, ...PAGE_ITEMS].map((item) => (
        <a
          key={item.key}
          href={item.href}
          onClick={onNavigate}
          className={`text-left hover:opacity-50 transition-opacity ${active === item.key ? 'underline underline-offset-4' : ''}`}
        >
          {item.label}
        </a>
      ))}
    </>
  )
}

function Sidebar({ active }) {
  const [menuOpen, setMenuOpen] = useState(false) // 行動版漢堡選單

  return (
    <>
      {/* 固定左欄（桌面版） */}
      <aside className='fixed left-6 md:left-10 top-0 z-20 pt-10 md:pt-14 w-56 hidden md:flex flex-col h-full'>
        <a href='#/' className='block mb-10 hover:opacity-60 transition-opacity'>
          <img src={BASE + 'logo.svg'} alt='一元復始' className='h-[80px] w-auto' />
        </a>

        <nav className='flex flex-col gap-4 text-[13px] tracking-[0.15em] text-neutral-700'>
          <NavLinks active={active} />
        </nav>

        <div className='mt-14 text-sm italic text-neutral-600'>
          <div className='flex flex-col gap-2 items-start'>
            <a
              href='https://www.instagram.com/enn.illust/'
              target='_blank'
              rel='noreferrer'
              aria-label='Instagram'
              className='block hover:opacity-50 transition-opacity'
            >
              <img src={BASE + 'ins.svg'} alt='Instagram' className='w-5 h-5' />
            </a>
            <a href='mailto:enntang.work@gmail.com' className='not-italic hover:opacity-50 transition-opacity'>enntang.work@gmail.com</a>
          </div>
        </div>
      </aside>

      {/* 行動版頂部列 */}
      <header className='md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur'>
        <div className='px-8 py-4 flex items-center justify-between'>
          <a href='#/' className='block shrink-0'>
            <img src={BASE + 'logo.svg'} alt='一元復始' className='h-[60px] w-auto' />
          </a>
          <button
            aria-label={menuOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className='text-2xl leading-none px-1'
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <nav className='px-8 pb-6 flex flex-col gap-4 text-sm tracking-[0.15em] text-neutral-700 border-t border-neutral-100 pt-5'>
            <NavLinks active={active} onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>
    </>
  )
}

export default Sidebar
