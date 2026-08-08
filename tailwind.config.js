/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 全站字體。英數字走 Courier Prime（index.html 從 Google Fonts 引入），
        // 中文字 Courier Prime 沒有字型，會自動往後掉到 Noto Serif TC。
        serif: ['"Courier Prime"', 'Georgia', 'Times', '"Noto Serif TC"', 'serif'],
      },
    },
  },
  plugins: [],
}
