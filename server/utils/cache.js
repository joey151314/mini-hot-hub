// 内存缓存模块

const cache = new Map()

// 默认 TTL：600 秒（10 分钟），可通过环境变量 CACHE_TTL 覆盖
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '600', 10) * 1000

/**
 * 获取缓存数据
 * @param {string} key - 缓存键
 * @returns {*} 缓存数据，如果不存在或已过期返回 null
 */
export function getCache(key) {
  const item = cache.get(key)
  
  if (!item) {
    return null
  }
  
  const now = Date.now()
  
  // 检查是否过期
  if (now > item.expiresAt) {
    cache.delete(key)
    return null
  }
  
  return item.data
}

/**
 * 设置缓存数据
 * @param {string} key - 缓存键
 * @param {*} data - 缓存数据
 * @param {number} ttlSec - 过期时间（秒），可选，默认使用环境变量 CACHE_TTL 或 600
 */
export function setCache(key, data, ttlSec) {
  const ttl = ttlSec ? ttlSec * 1000 : DEFAULT_TTL
  const expiresAt = Date.now() + ttl
  
  cache.set(key, {
    data,
    expiresAt
  })
}
