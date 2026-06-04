import { HotPlatform } from '../types/hot'

export async function fetchHot(): Promise<HotPlatform[]> {
  const response = await fetch('/api/hot')
  if (!response.ok) {
    throw new Error('Failed to fetch hot data')
  }
  return response.json()
}

export async function fetchHotBySource(source: string): Promise<HotPlatform> {
  const response = await fetch(`/api/hot/${source}`)
  if (!response.ok) {
    throw new Error('Failed to fetch hot data')
  }
  return response.json()
}
