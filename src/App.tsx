import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { normalizeForSearch, getKanaRow } from './utils/kana'
import customChampionData from './data/champions.json'
import { ChampionDetail } from './pages/ChampionDetail'

interface Champion {
  id: string
  name: string
  image: {
    full: string
  }
  tags?: string[]
  stats?: {
    attackrange: number
  }
}

interface ChampionData {
  data: Record<string, Champion>
}

interface CustomChampionData {
  nicknames: string[]
}

const DDRAGON_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

const customData = customChampionData as Record<string, CustomChampionData>

function ChampionSearch({ champions, ddragonVersion }: { champions: Champion[], ddragonVersion: string | null }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const filteredChampions = useMemo(() => {
    const sorted = [...champions].sort((a, b) => a.name.localeCompare(b.name, 'ja'))

    if (!searchQuery) return sorted

    const normalizedQuery = normalizeForSearch(searchQuery)

    return sorted.filter((champion) => {
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

  // 50音行ごとにグループ化
  const groupedChampions = useMemo(() => {
    const groups: { row: string; champions: Champion[] }[] = []
    let currentRow = ''

    for (const champion of filteredChampions) {
      const row = getKanaRow(champion.name[0])
      if (row !== currentRow) {
        currentRow = row
        groups.push({ row, champions: [] })
      }
      groups[groups.length - 1].champions.push(champion)
    }

    return groups
  }, [filteredChampions])

  const getChampionImageUrl = (imageFull: string) => {
    if (!ddragonVersion) return ''
    return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${imageFull}`
  }

  const handleChampionClick = (championId: string) => {
    navigate(`/champion/${championId}`)
  }

  return (
    <div className={`app ${isFocused || searchQuery ? 'is-searching' : ''} ${searchQuery ? 'has-query' : ''}`}>
      <header className={`header ${isFocused || searchQuery ? 'header-hidden-mobile' : ''}`}>
        <h1 className="logo">
          <img src="/logo.png" alt="League of Counter" className="logo-image" />
        </h1>
      </header>

      <div className="search-container">
        <div className="search-wrapper">
          <img src="/search.png" alt="検索" className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
          />
          {searchQuery && (
            <button
              className="search-cancel"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              <img src="/cancel.png" alt="クリア" />
            </button>
          )}
        </div>
      </div>

      <div className={`champion-list ${isFocused || searchQuery ? 'is-searching' : ''}`}>
        {searchQuery ? (
          <div className="champion-grid">
            {filteredChampions.map((champion) => (
              <div
                key={champion.id}
                className="champion-card"
                onClick={() => handleChampionClick(champion.id)}
              >
                <img
                  src={getChampionImageUrl(champion.image.full)}
                  alt={champion.name}
                  className="champion-image"
                />
                <span className="champion-name">{champion.name}</span>
              </div>
            ))}
          </div>
        ) : (
          groupedChampions.map((group) => (
            <div key={group.row} className="champion-group">
              <div className="row-separator">{group.row}</div>
              <div className="champion-grid">
                {group.champions.map((champion) => (
                  <div
                    key={champion.id}
                    className="champion-card"
                    onClick={() => handleChampionClick(champion.id)}
                  >
                    <img
                      src={getChampionImageUrl(champion.image.full)}
                      alt={champion.name}
                      className="champion-image"
                    />
                    <span className="champion-name">{champion.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredChampions.length === 0 && (
        <div className="no-results">
          該当するチャンピオンが見つかりません
        </div>
      )}
    </div>
  )
}

function App() {
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

  if (loading) {
    return <div className="loading">チャンピオンを読み込み中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error}</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<ChampionSearch champions={champions} ddragonVersion={ddragonVersion} />}
        />
        <Route
          path="/champion/:championId"
          element={<ChampionDetail champions={champions} ddragonVersion={ddragonVersion} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
