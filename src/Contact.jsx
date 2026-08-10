import Navbar from './Navbar'

/**
 * 聯絡頁（版面參照 zaoridraws.cargo.site 的 Contact 頁）：
 * - 左欄：跟首頁共用的 Sidebar（見 Sidebar.jsx），選單維持完整、CONTACT 為 active 狀態
 * - 右側：聯絡方式、洽詢時需要提供的資訊、報價說明
 *
 * 文字內容目前是預留內容，請直接改這個檔案裡的文字。
 */
function Contact() {
  return (
    <div className='min-h-screen bg-surface font-serif text-ink'>
      <Navbar active='contact' />

      <main className='px-8 md:px-24 pt-28 md:pt-40 pb-24 max-w-2xl mx-auto text-sm leading-relaxed text-body'>
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

        <hr className='border-line mb-6' />

        <p>
          ※ 報價將依委託內容與授權範圍評估，實際依需求規模與時程報價。
        </p>
      </main>
    </div>
  )
}

export default Contact
