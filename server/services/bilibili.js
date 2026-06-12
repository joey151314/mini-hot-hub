/**
 * B站热榜服务
 *
 * 使用B站公开 JSON 接口获取热门话题数据
 * 主要接口: https://api.bilibili.com/x/web-interface/search/square?limit=50
 */

// B站热榜 JSON 接口地址
const BILIBILI_HOT_API = 'https://api.bilibili.com/x/web-interface/search/square?limit=50'

// 桌面端 Chrome User-Agent
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

/**
 * 获取B站热榜数据
 * @returns {Promise<HotPlatform>} B站热榜平台数据
 */
export async function fetchBilibiliHot() {
  try {
    const items = await fetchFromApi(BILIBILI_HOT_API)
    
    if (items && items.length > 0) {
      return {
        source: 'bilibili',
        sourceName: 'B站',
        listName: '热搜榜',
        updatedAt: new Date().toISOString(),
        items,
        error: false,
        message: ''
      }
    }

    // 接口返回无数据
    throw new Error('B站 API returned no valid data')
  } catch (error) {
    console.error('[Bilibili Service] Fetch error:', error.message)
    return {
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: 'B站热搜暂时无法获取'
    }
  }
}

/**
 * 从指定 API 获取并解析热榜数据
 */
async function fetchFromApi(apiUrl) {
  const response = await globalThis.fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': DESKTOP_UA,
      'Referer': 'https://www.bilibili.com',
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const result = await response.json()

  // 检查 B站返回的 code 字段，0 表示成功
  if (result.code !== 0) {
    throw new Error(`B站 API error: code=${result.code}`)
  }

  // B站接口返回结构:
  // {
  //   code: 0,
  //   data: {
  //     trending: {
  //       list: [
  //         {
  //           show_name: "标题",   // 原始字段: show_name → title (优先)
  //           keyword: "关键词",   // 原始字段: keyword → title
  //           heat_score: 8850685, // 原始字段: heat_score → heat
  //           word_type: 1,
  //           event_type: 0,
  //           algid: 1
  //         }
  //       ]
  //     }
  //   }
  // }

  const hotList = result.data?.trending?.list

  if (!Array.isArray(hotList) || hotList.length === 0) {
    return null
  }

  // 映射热榜数据
  const items = hotList.map((item, index) => {
    const rank = index + 1

    // title: 优先用 show_name，否则用 keyword
    const title = item.show_name || item.keyword || '未知'

    // heat: 从 heat_score 提取，格式化为中文单位
    let heat = ''

    if (item.heat_score && item.heat_score > 0) {
      heat = formatHeat(item.heat_score)
    }

    if (!heat) {
      heat = '热'
    }

    // url: 使用 "#" 占位（B 站热搜接口不提供直接链接）
    const url = '#'

    return { rank, title, heat, url }
  })

  console.log(`[Bilibili Service] Successfully fetched ${items.length} items from ${apiUrl}`)
  return items
}

/**
 * 格式化热度值
 * @param {number} num 热度数字
 * @returns {string} 格式化后的热度字符串
 */
function formatHeat(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}
