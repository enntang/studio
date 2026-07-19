/**
 * 聯絡頁（版面參照 zaoridraws.cargo.site 的 Contact 頁）：
 * - 左欄：文字標示（回首頁）、返回連結
 * - 右側：聯絡方式、洽詢時需要提供的資訊、報價說明
 *
 * 文字內容目前是預留內容，請直接改這個檔案裡的文字。
 */
function Contact() {
  return (
    <div className='min-h-screen bg-white font-serif text-neutral-800 md:grid md:grid-cols-[18rem_1fr]'>
      <aside className='px-8 md:pl-10 md:pr-6 pt-10 md:pt-14 md:sticky md:top-0 md:h-screen flex flex-col'>
        <a href='#/' className='block mb-12 hover:opacity-60 transition-opacity'>
          <div className='font-bold tracking-wider text-lg mb-1'>Enn Tang</div>
          <div className='text-xs tracking-[0.25em] text-neutral-400'>STUDIO</div>
        </a>

        <h1 className='text-sm tracking-[0.3em] text-neutral-500'>CONTACT</h1>

        <a
          href='#/'
          className='mt-12 md:mt-auto md:mb-14 text-[13px] tracking-[0.15em] text-neutral-700 hover:opacity-50 transition-opacity'
        >
          ← ALL WORK
        </a>
      </aside>

      <main className='px-8 md:pl-0 md:pr-24 pt-8 md:pt-14 pb-24 max-w-2xl text-sm leading-relaxed text-neutral-600'>
        {/* 以下為預留文字，請改成你自己的聯絡說明 */}
        <p className='mb-4'>Hello，我是 Enn Tang。</p>
        <p className='mb-2'>歡迎各式商業合作與委託洽詢，請來信至：</p>
        <p className='mb-6'>
          <a
            href='mailto:enntang.work@gmail.com'
            className='font-bold underline underline-offset-4 hover:opacity-60'
          >
            enntang.work@gmail.com
          </a>
        </p>

        <p className='mb-3'>並簡單提供以下資訊：</p>
        <ul className='list-disc list-inside space-y-1 mb-6'>
          <li>公司 / 品牌名稱</li>
          <li>專案簡介與需求概述</li>
          <li>尺寸 / 數量 / 檔案格式</li>
          <li>使用範圍</li>
          <li>工作時程</li>
          <li>預算範圍</li>
        </ul>
        <p className='mb-10'>如有尚未確認的內容，也歡迎來信一起討論。</p>

        <hr className='border-neutral-200 mb-6' />

        <p>
          ※ 報價將依委託內容與授權範圍評估，實際依需求規模與時程報價。
        </p>
      </main>
    </div>
  )
}

export default Contact
