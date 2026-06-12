/**
 * 知乎热榜服务
 *
 * 尝试从多个公开渠道获取真实的知乎热榜数据
 * 如果全部失败，返回错误状态（不使用硬编码假数据）
 */

// 备用接口列表（按顺序尝试）
const ZHIHU_APIS = [
  {
    url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&reverse_order=0',
    name: 'v3-feed',
    description: '知乎 v3 feed 接口'
  },
  {
    url: 'https://www.zhihu.com/api/v4/topstory/hot-lists/total?limit=50',
    name: 'v4-topstory',
    description: '知乎 v4 topstory 接口'
  },
  {
    url: 'https://api.zhihu.com/topstory/hot-lists/total?limit=50',
    name: 'api-subdomain',
    description: '知乎 api 子域名接口'
  }
]

// 随机 User-Agent 列表
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
]

// Referer 列表（依次尝试）
const REFERERS = [
  'https://www.zhihu.com/hot',
  'https://www.zhihu.com'
]

/**
 * 随机选择一个元素
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 构建请求头
 */
function buildHeaders(referer) {
  return {
    'User-Agent': randomPick(USER_AGENTS),
    'Referer': referer,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'x-requested-with': 'XMLHttpRequest',
    'Cache-Control': 'no-cache'
  }
}

/**
 * 解析热榜数据
 * 根据实际返回的 JSON 结构解析出热榜列表
 */
function parseHotList(data) {
  // 常见返回结构:
  // {
  //   data: [
  //     {
  //       target: {
  //         id: 123,
  //         title: "问题标题",
  //         url: "https://www.zhihu.com/question/123",
  //         excerpt: "摘要",
  //         follower_count: 1234,  // 关注人数，可作为热度参考
  //         author: { name: "作者" }
  //       },
  //       detail_text: "1234 万热度",  // 热度文本
  //       type: "feed_advert" 或其他
  //     }
  //   ]
  // }

  if (!data || !Array.isArray(data.data)) {
    return null
  }

  // 过滤掉广告类型，只保留真实热榜数据
  const hotList = data.data.filter(item => {
    // 必须有 target 且有 title
    if (!item.target || !item.target.title) return false
    // 过滤掉广告类型
    if (item.type === 'feed_advert') return false
    return true
  })

  if (hotList.length === 0) {
    return null
  }

  // 映射热榜数据
  const items = hotList.map((item, index) => {
    const rank = index + 1
    const title = item.target.title || '未知'

    // 尝试多种方式提取热度
    let heat = ''

    // 方式1: 从 detail_text 解析（格式如 "1234 万热度"）
    if (item.detail_text) {
      heat = parseHeatFromDetail(item.detail_text)
    }

    // 方式2: 使用 follower_count（关注人数）
    if (!heat && item.target.follower_count) {
      heat = formatNumber(item.target.follower_count)
    }

    // 方式3: 使用 children 数量（回答数）
    if (!heat && item.children && item.children.length > 0) {
      heat = `${item.children.length} 回答`
    }

    // 如果都提取不到，使用默认值
    if (!heat) {
      heat = '热'
    }

    // 处理 URL
    let url = item.target.url || '#'
    
    // URL 转换逻辑：
    // 知乎 API 返回的 url 可能是以下格式：
    // 1. https://api.zhihu.com/questions/2046261330911482494  (API 格式)
    // 2. https://www.zhihu.com/question/123               (网页格式)
    // 3. /question/123                                  (相对路径)
    // 需要统一转换为可访问的网页格式 https://www.zhihu.com/question/{id}
    url = convertZhihuUrl(url)

    return { rank, title, heat, url }
  })

  return items
}

/**
 * 从 detail_text 中解析热度值
 * @param {string} detailText 热度文本，如 "1234 万热度"
 * @returns {string} 格式化后的热度字符串
 */
function parseHeatFromDetail(detailText) {
  if (!detailText) return ''

  // 尝试匹配 "1234 万热度" 或 "123 热度" 格式
  const match = detailText.match(/(\d+(?:\.\d+)?)\s*(万?)热度/)
  if (match) {
    const num = match[1]
    const unit = match[2] || ''
    return num + unit
  }

  // 尝试匹配纯数字
  const numMatch = detailText.match(/(\d+)/)
  if (numMatch) {
    return numMatch[1]
  }

  return ''
}

/**
 * 格式化数字（如 1234 -> "1234"，12345 -> "1.2万"）
 */
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

/**
 * 转换知乎 API URL 为可访问的网页 URL
 * 
 * 转换逻辑：
 * - 如果 url 中包含 "api.zhihu.com/questions/"，提取后面的数字 ID
 * - 转换为 "https://www.zhihu.com/question/{id}" 格式
 * - 如果是相对路径 "/question/123"，补全为 "https://www.zhihu.com/question/123"
 * - 如果是网页格式 "https://www.zhihu.com/question/123"，保持不变
 * - 其他情况保持原 url 不变
 * 
 * @param {string} url 原始 URL
 * @returns {string} 转换后的网页 URL
 */
function convertZhihuUrl(url) {
  if (!url || url === '#') {
    return '#'
  }

  // 情况1: API 格式 https://api.zhihu.com/questions/2046261330911482494
  // 提取 questions/ 后面的数字 ID
  const apiMatch = url.match(/api\.zhihu\.com\/questions\/(\d+)/)
  if (apiMatch) {
    const questionId = apiMatch[1]
    return `https://www.zhihu.com/question/${questionId}`
  }

  // 情况2: 相对路径 /question/123
  const relativeMatch = url.match(/\/question\/(\d+)/)
  if (relativeMatch) {
    return `https://www.zhihu.com/question/${relativeMatch[1]}`
  }

  // 情况3: 已经是网页格式 https://www.zhihu.com/question/123
  if (url.includes('www.zhihu.com/question/')) {
    return url
  }

  // 其他情况，保持原 url
  return url
}

/**
 * 尝试从单个接口获取数据
 */
async function tryFetchFromApi(apiInfo, referer) {
  const headers = buildHeaders(referer)
  
  console.log(`[Zhihu Service] Trying ${apiInfo.name} with Referer: ${referer}`)
  
  const response = await globalThis.fetch(apiInfo.url, {
    method: 'GET',
    headers
  })

  if (!response.ok) {
    console.warn(`[Zhihu Service] ${apiInfo.name} HTTP error: ${response.status}`)
    return null
  }

  const data = await response.json()

  // 检查是否返回认证错误
  if (data.error || data.message === 'AuthenticationError' || data.type === 'error') {
    console.warn(`[Zhihu Service] ${apiInfo.name} returned auth/error response`)
    return null
  }

  // 解析热榜数据
  const items = parseHotList(data)
  
  if (!items || items.length === 0) {
    console.warn(`[Zhihu Service] ${apiInfo.name} returned no valid items`)
    return null
  }

  console.log(`[Zhihu Service] Successfully fetched ${items.length} items from ${apiInfo.name}`)
  return items
}

/**
 * 获取知乎热榜数据
 * @returns {Promise<HotPlatform>} 知乎热榜平台数据
 */
export async function fetchZhihuHot() {
  // 按顺序尝试所有接口和 Referer 组合
  for (const apiInfo of ZHIHU_APIS) {
    for (const referer of REFERERS) {
      try {
        const items = await tryFetchFromApi(apiInfo, referer)
        
        if (items && items.length > 0) {
          return {
            source: 'zhihu',
            sourceName: '知乎',
            listName: '热榜',
            updatedAt: new Date().toISOString(),
            items,
            error: false,
            message: ''
          }
        }
      } catch (error) {
        console.warn(`[Zhihu Service] ${apiInfo.name} fetch error: ${error.message}`)
        // 继续尝试下一个组合
      }
    }
  }

  // 所有接口都失败，返回错误状态
  console.error('[Zhihu Service] All APIs failed, returning error')
  return {
    source: 'zhihu',
    sourceName: '知乎',
    listName: '热榜',
    updatedAt: new Date().toISOString(),
    items: [],
    error: true,
    message: '知乎热榜暂时无法获取，请稍后重试'
  }
}
