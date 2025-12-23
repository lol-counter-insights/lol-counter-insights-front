import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { counterDataSource } from '../services/counterDataSource'
import type { ChampionCounterData, CounterMatchup } from '../types/counter'
import type { Champion, CustomChampionData } from '../types/champion'
import {
  getChampionImageUrl,
  getSplashUrl,
  getOpggUrl,
  getUggUrl,
} from '../utils/champion'
import { getChampionTagDisplay } from '../utils/tag'
import { useChampionSearch } from '../hooks/useChampionSearch'
import { ChampionCard } from '../components/ChampionCard'
import { SearchInput } from '../components/SearchInput'
import customChampionData from '../data/champions.json'
import styles from './ChampionDetail.module.css'

interface Props {
  champions: Champion[]
  ddragonVersion: string | null
}

const customData = customChampionData as Record<string, CustomChampionData>

export function ChampionDetail({ champions, ddragonVersion }: Props) {
  const { championId } = useParams<{ championId: string }>()
  const navigate = useNavigate()
  const [counterData, setCounterData] = useState<ChampionCounterData | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    searchQuery,
    setSearchQuery,
    setIsFocused,
    filteredChampions,
    isSearching,
  } = useChampionSearch(champions)

  const champion = champions.find((c) => c.id === championId)

  useEffect(() => {
    const fetchCounterData = async () => {
      if (!championId) return
      setLoading(true)
      const data = await counterDataSource.getCounterData(championId)
      setCounterData(data)
      setLoading(false)
    }
    fetchCounterData()
  }, [championId])

  const getChampionById = (id: string) => champions.find((c) => c.id === id)

  if (!champion) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>チャンピオンが見つかりません</div>
        <Link to="/">← 検索に戻る</Link>
      </div>
    )
  }

  const renderMatchupList = (matchups: CounterMatchup[]) => (
    <div className={styles.matchupList}>
      {matchups.map((matchup) => {
        const matchupChampion = getChampionById(matchup.championId)
        if (!matchupChampion) return null
        return (
          <ChampionCard
            key={matchup.championId}
            imageUrl={getChampionImageUrl(ddragonVersion, matchupChampion.image.full)}
            name={matchupChampion.name}
            onClick={() => navigate(`/champion/${matchup.championId}`)}
            variant="matchup"
          />
        )
      })}
    </div>
  )

  // タグ表示を取得
  const tagDisplay = getChampionTagDisplay(champion, customData[champion.id])

  const headerClass = [
    styles.header,
    isSearching && styles.searchFocused,
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <header className={headerClass}>
        <h1 className={styles.logo}>
          <Link to="/">
            <img src="/logo2.png" alt="League of Counter" className={styles.logoImage} />
          </Link>
        </h1>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          variant="compact"
        >
          {/* 検索結果オーバーレイ */}
          {searchQuery && filteredChampions.length > 0 && (
            <div className={styles.searchResultsOverlay}>
              {filteredChampions.map((champ) => (
                <ChampionCard
                  key={champ.id}
                  imageUrl={getChampionImageUrl(ddragonVersion, champ.image.full)}
                  name={champ.name}
                  onClick={() => {
                    navigate(`/champion/${champ.id}`)
                    setSearchQuery('')
                  }}
                  variant="circle"
                />
              ))}
            </div>
          )}
        </SearchInput>
      </header>

      {/* スプラッシュアート */}
      <div className={styles.splashContainer}>
        <img
          src={getSplashUrl(champion.id)}
          alt={champion.name}
          className={styles.splashImage}
        />
        <div className={styles.splashOverlay} />
      </div>

      {/* チャンピオン情報 */}
      <div className={styles.championInfo}>
        <h1 className={styles.championTitle}>
          <span className={styles.vsPrefix}>vs.</span>{champion.name}
        </h1>
        {tagDisplay && <p className={styles.championTags}>{tagDisplay}</p>}
      </div>

      {/* カウンター情報 */}
      {loading ? (
        <div className={styles.loading}>カウンター情報を読み込み中...</div>
      ) : counterData ? (
        <div className={styles.counterSections}>
          <section className={styles.counterSection}>
            <h2 className={styles.sectionTitle}>おすすめピック</h2>
            {renderMatchupList(counterData.strongAgainst.slice(0, 5))}
          </section>

          <section className={styles.counterSection}>
            <h2 className={styles.sectionTitle}>NGピック</h2>
            {renderMatchupList(counterData.weakAgainst.slice(0, 5))}
          </section>
        </div>
      ) : (
        <div className={styles.noData}>
          カウンター情報がまだ登録されていません
        </div>
      )}

      {/* 外部リンク */}
      <div className={styles.externalLinks}>
        <a
          href={getOpggUrl(champion.id)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
        >
          OP.GG ↗
        </a>
        <a
          href={getUggUrl(champion.id)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
        >
          U.GG ↗
        </a>
      </div>
    </div>
  )
}
