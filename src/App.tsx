import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { normalizeForSearch } from './utils/kana'
import customChampionData from './data/champions.json'

interface Champion {
  id: string
  name: string
  image: {
    full: string
  }
}

interface ChampionData {
  data: Record<string, Champion>
}

interface CustomChampionData {
  nicknames: string[]
}

const DDRAGON_VERSION = '14.23.1'
const CHAMPION_JSON_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/champion.json`
const CHAMPION_IMAGE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion`

const customData = customChampionData as Record<string, CustomChampionData>

function App() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response = await fetch(CHAMPION_JSON_URL)
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

    fetchChampions()
  }, [])

  const filteredChampions = useMemo(() => {
    if (!searchQuery) return champions

    const normalizedQuery = normalizeForSearch(searchQuery)

    return champions.filter((champion) => {
      // チャンピオン名（日本語）で検索
      if (normalizeForSearch(champion.name).includes(normalizedQuery)) {
        return true
      }

      // チャンピオンID（英語）で検索
      if (champion.id.toLowerCase().includes(normalizedQuery)) {
        return true
      }

      // カスタムデータの愛称で検索
      const custom = customData[champion.id]
      if (custom?.nicknames) {
        for (const nickname of custom.nicknames) {
          if (normalizeForSearch(nickname).includes(normalizedQuery)) {
            return true
          }
        }
      }

      return false
    })
  }, [champions, searchQuery])

  if (loading) {
    return <div className="loading">チャンピオンを読み込み中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error}</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>LoL Counter Insights</h1>
        <p className="subtitle">チャンピオンを検索</p>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="チャンピオン名・愛称を入力..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="champion-count">
        {filteredChampions.length} / {champions.length} チャンピオン
      </div>

      <div className="champion-grid">
        {filteredChampions.map((champion) => (
          <div key={champion.id} className="champion-card">
            <img
              src={`${CHAMPION_IMAGE_URL}/${champion.image.full}`}
              alt={champion.name}
              className="champion-image"
            />
            <span className="champion-name">{champion.name}</span>
          </div>
        ))}
      </div>

      {filteredChampions.length === 0 && (
        <div className="no-results">
          該当するチャンピオンが見つかりません
        </div>
      )}
    </div>
  )
}

export default App
