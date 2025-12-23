import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import styles from './App.module.css'
import { getChampionImageUrl, groupChampionsByKana } from './utils/champion'
import { useChampionSearch } from './hooks/useChampionSearch'
import { ChampionCard } from './components/ChampionCard'
import { SearchInput } from './components/SearchInput'
import { ChampionDetail } from './pages/ChampionDetail'
import type { Champion, ChampionData } from './types/champion'

const DDRAGON_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

function ChampionSearch({ champions, ddragonVersion }: { champions: Champion[], ddragonVersion: string | null }) {
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    setIsFocused,
    filteredChampions,
    isSearching,
  } = useChampionSearch(champions)

  // 50音行ごとにグループ化（検索していない時のみ使用）
  const groupedChampions = useMemo(
    () => groupChampionsByKana(champions),
    [champions]
  )

  const handleChampionClick = (championId: string) => {
    navigate(`/champion/${championId}`)
  }

  const appClass = [
    styles.app,
    isSearching && styles.isSearching,
    searchQuery && styles.hasQuery,
  ].filter(Boolean).join(' ')

  const headerClass = [
    styles.header,
    isSearching && styles.headerHiddenMobile,
  ].filter(Boolean).join(' ')

  return (
    <div className={appClass}>
      <header className={headerClass}>
        <h1 className={styles.logo}>
          <img src="/logo.png" alt="League of Counter" className={styles.logoImage} />
        </h1>
      </header>

      <div className={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
        />
      </div>

      <div className={styles.championList}>
        {searchQuery ? (
          <div className={styles.championGrid}>
            {filteredChampions.map((champion) => (
              <ChampionCard
                key={champion.id}
                imageUrl={getChampionImageUrl(ddragonVersion, champion.image.full)}
                name={champion.name}
                onClick={() => handleChampionClick(champion.id)}
                variant="circle"
              />
            ))}
          </div>
        ) : (
          groupedChampions.map((group) => (
            <div key={group.row} className={styles.championGroup}>
              <div className={styles.rowSeparator}>{group.row}</div>
              <div className={styles.championGrid}>
                {group.champions.map((champion) => (
                  <ChampionCard
                    key={champion.id}
                    imageUrl={getChampionImageUrl(ddragonVersion, champion.image.full)}
                    name={champion.name}
                    onClick={() => handleChampionClick(champion.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredChampions.length === 0 && (
        <div className={styles.noResults}>
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
    return <div className={styles.loading}>チャンピオンを読み込み中...</div>
  }

  if (error) {
    return <div className={styles.error}>エラー: {error}</div>
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
