import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { counterDataSource } from '../services/counterDataSource'
import type { ChampionCounterData, CounterMatchup } from '../types/counter'
import './ChampionDetail.css'

interface Champion {
  id: string
  name: string
  image: {
    full: string
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

  const renderMatchupList = (matchups: CounterMatchup[]) => (
    <div className="matchup-list">
      {matchups.map((matchup, index) => {
        const matchupChampion = getChampionById(matchup.championId)
        return (
          <div key={matchup.championId} className="matchup-item">
            <span className="matchup-rank">{index + 1}</span>
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

  return (
    <div className="champion-detail">
      <Link to="/" className="back-link">← 検索に戻る</Link>

      <div className="champion-header">
        <img
          src={getChampionImageUrl(champion.image.full)}
          alt={champion.name}
          className="champion-detail-image"
        />
        <div className="champion-header-info">
          <h1>{champion.name}</h1>
          <div className="external-links">
            <a
              href={getOpggUrl(champion.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link opgg"
            >
              OP.GG
            </a>
            <a
              href={getUggUrl(champion.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link ugg"
            >
              U.GG
            </a>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">カウンター情報を読み込み中...</div>
      ) : counterData ? (
        <div className="counter-sections">
          <section className="counter-section">
            <h2 className="section-title strong">
              有利なマッチアップ（TOP 5）
            </h2>
            {renderMatchupList(counterData.strongAgainst.slice(0, 5))}
          </section>

          <section className="counter-section">
            <h2 className="section-title weak">
              不利なマッチアップ（TOP 5）
            </h2>
            {renderMatchupList(counterData.weakAgainst.slice(0, 5))}
          </section>
        </div>
      ) : (
        <div className="no-data">
          カウンター情報がまだ登録されていません
        </div>
      )}
    </div>
  )
}
