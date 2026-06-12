import { useState, useEffect } from 'react'
import { HotPlatform } from '../types/hot'

interface ApiResponse {
  platforms: HotPlatform[]
}

interface UseHotListReturn {
  data: HotPlatform[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useHotList(): UseHotListReturn {
  const [data, setData] = useState<HotPlatform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 模拟网络延迟（500-800ms）
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300))
      
      // 从后端 API 获取所有平台数据
      const response = await fetch('/api/hot')
      
      if (!response.ok) {
        throw new Error('网络请求失败')
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.platforms && Array.isArray(result.platforms)) {
        setData(result.platforms)
      } else {
        throw new Error('数据格式错误')
      }
    } catch {
      setError('网络请求失败，请检查网络连接')
      // 清空数据，让各个卡片显示错误状态
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    loading,
    error,
    retry: loadData
  }
}
