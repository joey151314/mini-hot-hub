import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <p>学习项目 · 非商用</p>
        <p>数据来源于各平台公开信息</p>
        <p>更新频率约 10 分钟</p>
        <p>如有侵权或违规请联系：example@example.com</p>
      </footer>
    </div>
  )
}

export default Layout
