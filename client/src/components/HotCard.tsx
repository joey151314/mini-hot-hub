import { HotPlatform } from '../types/hot'

interface HotCardProps {
  platform: HotPlatform | null
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}

function HotCard({ platform, loading = false, error = false, onRetry }: HotCardProps) {
  const keywords = ['教育', '人工智能']
  
  const containsKeyword = (title: string) => {
    return keywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  const getItemClass = (title: string) => {
    const baseClass = 'hot-item'
    return containsKeyword(title) ? `${baseClass} highlight` : baseClass
  }

  const getTitleClass = (title: string) => {
    const baseClass = 'hot-title'
    return containsKeyword(title) ? `${baseClass} highlight` : baseClass
  }

  const getTimeAgo = (updatedAt: string) => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const minutes = Math.floor((now.getTime() - updated.getTime()) / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小时前`
    return `${Math.floor(hours / 24)} 天前`
  }

  // Loading 状态
  if (loading) {
    return (
      <div className="hot-card loading-card">
        <div className="card-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-badge"></div>
        </div>
        <div className="skeleton-list">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-item">
              <div className="skeleton-rank"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error 状态
  if (error || !platform) {
    return (
      <div className="hot-card error-card">
        <div className="card-header">
          <div className="skeleton-title error-title"></div>
          <div className="skeleton-badge"></div>
        </div>
        <div className="error-content">
          <p>{platform?.message || '加载失败'}</p>
          {onRetry && (
            <button className="retry-btn" onClick={onRetry}>
              点击重试
            </button>
          )}
        </div>
      </div>
    )
  }

  // 空数据状态
  if (platform.items.length === 0) {
    return (
      <div className="hot-card">
        <div className="card-header">
          <h2>{platform.sourceName}</h2>
          <span className="list-name">{platform.listName}</span>
        </div>
        <div className="empty-content">
          <p>暂无数据</p>
        </div>
        <div className="card-footer">
          <span>更新于 {getTimeAgo(platform.updatedAt)}</span>
        </div>
      </div>
    )
  }

  // Success 状态
  return (
    <div className="hot-card">
      <div className="card-header">
        <h2>{platform.sourceName}</h2>
        <span className="list-name">{platform.listName}</span>
      </div>
      <ul className="hot-list">
        {platform.items.map((item) => (
          <li key={item.rank} className={getItemClass(item.title)}>
            <span className="rank">{item.rank}</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={getTitleClass(item.title)}
            >
              {item.title}
            </a>
            {item.heat && <span className="hot-heat">{item.heat}</span>}
          </li>
        ))}
      </ul>
      <div className="card-footer">
        <span>更新于 {getTimeAgo(platform.updatedAt)}</span>
      </div>
    </div>
  )
}

export default HotCard
