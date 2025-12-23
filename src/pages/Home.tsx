import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import { getChampionImageUrl, groupChampionsByKana } from '../utils/champion'
import { useChampionSearch } from '../hooks/useChampionSearch'
import { ChampionCard } from '../components/ChampionCard'
import { SearchInput } from '../components/SearchInput'
import type { Champion } from '../types/champion'

interface Props {
  champions: Champion[]
  ddragonVersion: string | null
}

export function Home({ champions, ddragonVersion }: Props) {
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

      {searchQuery && filteredChampions.length === 0 && (
        <div className={styles.noResults}>
          該当するチャンピオンが見つかりません
        </div>
      )}
    </div>
  )
}
