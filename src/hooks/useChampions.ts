import { useState, useEffect } from 'react'
import type { Champion, ChampionData } from '../types/champion'

const DDRAGON_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

interface UseChampionsResult {
  champions: Champion[]
  ddragonVersion: string | null
  loading: boolean
  error: string | null
}

export function useChampions(): UseChampionsResult {
  const [champions, setChampions] = useState<Champion[]>([])
  const [ddragonVersion, setDdragonVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 最新バージョンを取得
        const versionsResponse = await fetch(DDRAGON_VERSIONS_URL)
        if (!versionsResponse.ok) {
          throw new Error('Failed to fetch versions')
        }
        const versions: string[] = await versionsResponse.json()
        const latestVersion = versions[0]
        setDdragonVersion(latestVersion)

        // チャンピオンデータを取得
        const championUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ja_JP/champion.json`
        const response = await fetch(championUrl)
        if (!response.ok) {
          throw new Error('Failed to fetch champions')
        }
        const data: ChampionData = await response.json()
        const championList = Object.values(data.data)
        setChampions(championList)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { champions, ddragonVersion, loading, error }
}
