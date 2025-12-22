import { useState, useEffect, useMemo, useCallback, type MouseEvent } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import searchIcon from './assets/icons/magnifying-glass.svg'
import bookmarkIcon from './assets/icons/bookmark.svg'
import bookmarkFilledIcon from './assets/icons/bookmark-filled.svg'
import clearIcon from './assets/icons/x-mark.svg'
import { normalizeForSearch } from './utils/kana'
import customChampionData from './data/champions.json'
import { ChampionDetail } from './pages/ChampionDetail'

interface Champion {
  id: string
  name: string
  title?: string
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
  damageType?: 'ad' | 'ap' | 'hybrid'
  lanes?: ('top' | 'jg' | 'mid' | 'bot' | 'sup')[]
}

const DDRAGON_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

const customData = customChampionData as Record<string, CustomChampionData>

type Lane = 'top' | 'jg' | 'mid' | 'bot' | 'sup'

const laneOptions: { key: Lane; label: string }[] = [
  { key: 'top', label: 'TOP' },
  { key: 'jg', label: 'JG' },
  { key: 'mid', label: 'MID' },
  { key: 'bot', label: 'BOT' },
  { key: 'sup', label: 'SUP' },
]

function ChampionSearch({ champions, ddragonVersion }: { champions: Champion[], ddragonVersion: string | null }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanes, setSelectedLanes] = useState<Lane[]>([])
  const [backgroundChampion, setBackgroundChampion] = useState<Champion | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorites')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  // 検索とレーンだけを反映した一覧（背景用）
  const baseFilteredChampions = useMemo(() => {
    const sorted = [...champions].sort((a, b) => a.name.localeCompare(b.name, 'ja'))

    if (!searchQuery && selectedLanes.length === 0) return sorted

    const normalizedQuery = normalizeForSearch(searchQuery)

    return sorted.filter((champion) => {
      // レーンフィルター（指定があれば、いずれかのレーンに一致するものだけ残す）
      if (selectedLanes.length > 0) {
        const lanes = customData[champion.id]?.lanes ?? []
        const isMatchLane = lanes.some((lane) => selectedLanes.includes(lane))
        if (!isMatchLane) return false
      }

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
  }, [champions, searchQuery, selectedLanes])

  // お気に入りフィルタまで反映した最終一覧（表示用）
  const filteredChampions = useMemo(() => {
    if (!favoriteOnly) return baseFilteredChampions
    return baseFilteredChampions.filter((champion) => favoriteIds.includes(champion.id))
  }, [baseFilteredChampions, favoriteOnly, favoriteIds])

  // 背景用に、現在のフィルター結果からランダムに1体選択
  const pickRandomBackground = useCallback(
    (prev: Champion | null) => {
      if (filteredChampions.length === 0) return null
      let next = filteredChampions[Math.floor(Math.random() * filteredChampions.length)]
      if (prev && filteredChampions.length > 1) {
        let tries = 0
        while (next.id === prev.id && tries < 5) {
          next = filteredChampions[Math.floor(Math.random() * filteredChampions.length)]
          tries++
        }
      }
      return next
    },
    [filteredChampions],
  )

  useEffect(() => {
    // 背景はお気に入りフィルタを無視し、検索＋レーンのみで選ぶ
    if (baseFilteredChampions.length === 0) {
      setBackgroundChampion(null)
      return
    }
    setBackgroundChampion((prev) => pickRandomBackground(prev))
  }, [baseFilteredChampions, pickRandomBackground])

  // 行見出しなしの単一グループで表示
  const groupedChampions = useMemo(() => {
    return [{ row: '', champions: filteredChampions }]
  }, [filteredChampions])

  const getChampionImageUrl = (imageFull: string) => {
    if (!ddragonVersion) return ''
    return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${imageFull}`
  }

  const handleChampionClick = (championId: string) => {
    navigate(`/champion/${championId}`)
  }

  const toggleFavorite = (championId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(championId) ? prev.filter((id) => id !== championId) : [...prev, championId],
    )
  }

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const handleLaneClick = (lane: Lane, event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setSelectedLanes((prev) => (prev.length === 1 && prev[0] === lane ? [] : [lane]))
  }

  const clearLanes = () => setSelectedLanes([])

  return (
    <div className={`app ${searchQuery ? 'is-searching' : ''}`}>
      {backgroundChampion && (
        <div
          key={backgroundChampion.id}
          className="app-background"
          style={{
            backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${backgroundChampion.id}_0.jpg)`,
          }}
        />
      )}
      <div className="app-background-overlay" />
      <div className="app-content">
        <header className={`header ${searchQuery ? 'header-hidden-mobile' : ''}`}>
          <h1 className="logo">
            <img src="/logo.png" alt="League of Counter" className="logo-image" />
          </h1>
        </header>

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">
              <img src={searchIcon} alt="" aria-hidden="true" />
            </span>
            <input
            type="text"
            className="search-input"
            placeholder="チャンピオン名を入力..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setSearchQuery('')}
              aria-label="検索をクリア"
            >
              <img src={clearIcon} alt="" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="lane-filter">
          <button
            className={`lane-chip favorite-toggle ${favoriteOnly ? 'is-active' : ''}`}
            onClick={() => setFavoriteOnly((prev) => !prev)}
            type="button"
            aria-label="お気に入りのみ"
          >
            <img src={favoriteOnly ? bookmarkFilledIcon : bookmarkIcon} alt="" aria-hidden="true" />
            <span className="lane-chip-label">お気に入り</span>
          </button>

          <button
            className={`lane-chip ${selectedLanes.length === 0 ? 'is-active' : ''}`}
            onClick={clearLanes}
            type="button"
            aria-label="ALL"
          >
            <span className="lane-chip-label">ALL</span>
          </button>
          {laneOptions.map((lane) => (
            <button
              key={lane.key}
              className={`lane-chip ${selectedLanes.includes(lane.key) ? 'is-active' : ''}`}
              onClick={(event) => handleLaneClick(lane.key, event)}
              type="button"
              aria-label={lane.label}
            >
              <span className="lane-chip-label">{lane.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`champion-list ${searchQuery ? 'is-searching' : ''}`}>
        {groupedChampions.map((group) => (
          <div key={group.row} className="champion-group">
            {group.row && <div className="row-separator">{group.row}</div>}
            <div className="champion-grid">
              {group.champions.map((champion) => (
                <div
                  key={champion.id}
                  className="champion-card"
                  onClick={() => handleChampionClick(champion.id)}
                >
                  <button
                    className={`favorite-button ${favoriteIds.includes(champion.id) ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(champion.id)
                    }}
                    aria-label="お気に入りに追加"
                    type="button"
                  >
                    <img
                      src={favoriteIds.includes(champion.id) ? bookmarkFilledIcon : bookmarkIcon}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                  <img
                    src={getChampionImageUrl(champion.image.full)}
                    alt={champion.name}
                    className="champion-image"
                  />
              <span className="champion-name">{champion.name}</span>
              {customData[champion.id]?.lanes && (
                <div className="champion-lanes">
                  {customData[champion.id].lanes!.map((lane) => {
                    const label = laneOptions.find((opt) => opt.key === lane)?.label ?? lane
                    return (
                      <span key={lane} className="champion-lane-chip">
                        {label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
      </div>

      {filteredChampions.length === 0 && (
        <div className="no-results">
          該当するチャンピオンが見つかりません
        </div>
      )}
      </div>
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
