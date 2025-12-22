import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { counterDataSource } from '../services/counterDataSource'
import type { ChampionCounterData, CounterMatchup } from '../types/counter'
import customChampionData from '../data/champions.json'
import './ChampionDetail.css'

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

interface Props {
  champions: Champion[]
  ddragonVersion: string | null
}

// 外部サイトへのリンク生成
const getOpggUrl = (championId: string) =>
  `https://www.op.gg/champions/${championId.toLowerCase()}`

const getUggUrl = (championId: string) =>
  `https://u.gg/lol/champions/${championId.toLowerCase()}/build`

// スプラッシュアート画像URL
const getSplashUrl = (championId: string) =>
  `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`

// タグの日本語変換
const tagToJapanese: Record<string, string> = {
  Fighter: 'ファイター',
  Tank: 'タンク',
  Mage: 'メイジ',
  Assassin: 'アサシン',
  Marksman: 'マークスマン',
  Support: 'サポート',
}

const damageTypeToDisplay: Record<string, string> = {
  ad: 'AD',
  ap: 'AP',
  hybrid: 'AD・AP',
}

// メレー/レンジ判定のしきい値
const MELEE_RANGE_THRESHOLD = 300

interface CustomChampionData {
  nicknames: string[]
  damageType?: 'ad' | 'ap' | 'hybrid'
}

const customData = customChampionData as Record<string, CustomChampionData>

export function ChampionDetail({ champions, ddragonVersion }: Props) {
  const { championId } = useParams<{ championId: string }>()
  const [counterData, setCounterData] = useState<ChampionCounterData | null>(null)
  const [loading, setLoading] = useState(true)

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

  const getChampionImageUrl = (imageFull: string) => {
    if (!ddragonVersion) return ''
    return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${imageFull}`
  }

  const getChampionById = (id: string) => champions.find((c) => c.id === id)

  if (!champion) {
    return (
      <div className="champion-detail">
        <div className="error">チャンピオンが見つかりません</div>
        <Link to="/" className="back-link">← 検索に戻る</Link>
      </div>
    )
  }

  const navigate = useNavigate()

  const renderMatchupList = (matchups: CounterMatchup[]) => (
    <div className="matchup-list">
      {matchups.map((matchup) => {
        const matchupChampion = getChampionById(matchup.championId)
        return (
          <div
            key={matchup.championId}
            className="matchup-item"
            onClick={() => navigate(`/champion/${matchup.championId}`)}
          >
            {matchupChampion && (
              <img
                src={getChampionImageUrl(matchupChampion.image.full)}
                alt={matchupChampion.name}
                className="matchup-image"
              />
            )}
            <span className="matchup-name">
              {matchupChampion?.name || matchup.championId}
            </span>
          </div>
        )
      })}
    </div>
  )

  // タグを日本語に変換（1つ目のみ）
  const japaneseTag = champion.tags?.[0]
    ? tagToJapanese[champion.tags[0]] || champion.tags[0]
    : undefined

  // attackrangeからメレー/レンジを判定
  const championCustomData = customData[champion.id]
  const attackRange = champion.stats?.attackrange
  const japaneseRange = attackRange !== undefined
    ? (attackRange < MELEE_RANGE_THRESHOLD ? 'メレー' : 'レンジ')
    : undefined

  // damageTypeを変換
  const damageTypeDisplay = championCustomData?.damageType
    ? damageTypeToDisplay[championCustomData.damageType]
    : undefined

  // タグ、range、damageTypeを組み合わせ
  const tagDisplay = [japaneseTag, japaneseRange, damageTypeDisplay].filter(Boolean).join(' / ')

  return (
    <div className="champion-detail">
      {/* ヘッダー */}
      <header className="detail-header">
        <h1 className="detail-logo">
          <Link to="/">
            <img src="/logo.png" alt="League of Counter" className="detail-logo-image" />
          </Link>
        </h1>
        <div className="detail-search-wrapper" onClick={() => navigate('/')}>
          <img src="/search.png" alt="検索" className="detail-search-icon" />
          <input
            type="text"
            className="detail-search-input"
            placeholder="Search"
            readOnly
          />
        </div>
      </header>

      {/* スプラッシュアート */}
      <div className="splash-container">
        <img
          src={getSplashUrl(champion.id)}
          alt={champion.name}
          className="splash-image"
        />
        <div className="splash-overlay" />
      </div>

      {/* チャンピオン情報 */}
      <div className="champion-info">
        <h1 className="champion-title">{champion.name}</h1>
        {tagDisplay && <p className="champion-tags">{tagDisplay}</p>}
      </div>

      {/* カウンター情報 */}
      {loading ? (
        <div className="loading">カウンター情報を読み込み中...</div>
      ) : counterData ? (
        <div className="counter-sections">
          <section className="counter-section">
            <h2 className="section-title">有利チャンピオン</h2>
            {renderMatchupList(counterData.strongAgainst.slice(0, 5))}
          </section>

          <section className="counter-section">
            <h2 className="section-title">不利チャンピオン</h2>
            {renderMatchupList(counterData.weakAgainst.slice(0, 5))}
          </section>
        </div>
      ) : (
        <div className="no-data">
          カウンター情報がまだ登録されていません
        </div>
      )}

      {/* 外部リンク */}
      <div className="external-links">
        <a
          href={getOpggUrl(champion.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link opgg"
        >
          OP.GG ↗
        </a>
        <a
          href={getUggUrl(champion.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link ugg"
        >
          U.GG ↗
        </a>
      </div>
    </div>
  )
}
