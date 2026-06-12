/**
 * 微博热搜服务
 *
 * 使用微博公开 JSON 接口获取热搜数据
 * 主要接口: https://weibo.com/ajax/side/hotSearch
 */

// 微博热搜 JSON 接口地址
const WEIBO_HOT_API = 'https://weibo.com/ajax/side/hotSearch'

/**
 * 获取微博热搜数据
 * @returns {Promise<HotPlatform>} 微博热搜平台数据
 */
export async function fetchWeiboHot() {
  try {
    const response = await globalThis.fetch(WEIBO_HOT_API, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://weibo.com',
        'Accept': 'application/json, text/plain, */*'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    // 检查接口返回状态，ok 必须为 1 才表示成功
    if (data.ok !== 1) {
      throw new Error(`Weibo API error: ok=${data.ok}`)
    }

    // 微博接口实际返回结构:
    // {
    //   ok: 1,
    //   data: {
    //     realtime: [
    //       {
    //         rank: 0,              // 原始字段: rank（位置索引，非标准排名，不使用）
    //         word: "热搜标题",      // 原始字段: word → title
    //         num: 1137057,         // 原始字段: num → heat（热度值）
    //         topic_flag: 1,        // 1 表示话题
    //         flag_desc: "综艺",    // 分类标签
    //         url: "https://..."    // 原始字段: url（可选）
    //       }
    //     ]
    //   }
    // }

    // 从 data.realtime 数组中提取热搜列表
    const realtimeList = data.data?.realtime
    if (!Array.isArray(realtimeList)) {
      throw new Error('Invalid response format: data.realtime is not an array')
    }

    // 映射热搜数据
    const items = realtimeList.map((item, index) => {
      // rank: 使用数组索引 + 1（因为接口返回的 rank 字段不是标准的 1-50）
      const rank = index + 1

      // title: 映射自 word 字段
      const title = item.word || '未知'

      // heat: 映射自 num 字段，并根据数值大小格式化
      // 例如: 1137057 → "113.7万"，120000000 → "1.2亿"
      const heat = item.num ? formatHeat(item.num) : ''

      // url: 如果接口返回有 url 字段则使用，否则用 "#" 占位
      const url = item.url || '#'

      return { rank, title, heat, url }
    })

    return {
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items,
      error: false,
      message: ''
    }
  } catch (error) {
    console.error('[Weibo Service] Fetch error:', error.message)
    return {
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: '微博热搜暂时无法获取'
    }
  }
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
