import type { Champion, CustomChampionData } from '../types/champion'
import { normalizeForSearch } from './kana'
import customChampionData from '../data/champions.json'

const customData = customChampionData as Record<string, CustomChampionData>

/**
 * チャンピオン画像URLを生成
 */
export const getChampionImageUrl = (ddragonVersion: string | null, imageFull: string): string => {
  if (!ddragonVersion) return ''
  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${imageFull}`
}

/**
 * スプラッシュアート画像URLを生成
 */
export const getSplashUrl = (championId: string): string =>
  `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`

/**
 * チャンピオンを検索クエリでフィルタリング
 */
export const filterChampionsByQuery = (
  champions: Champion[],
  query: string
): Champion[] => {
  const sorted = [...champions].sort((a, b) => a.name.localeCompare(b.name, 'ja'))

  if (!query) return sorted

  const normalizedQuery = normalizeForSearch(query)

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
}

/**
 * 外部サイトへのリンク生成
 */
export const getOpggUrl = (championId: string): string =>
  `https://www.op.gg/champions/${championId.toLowerCase()}`

export const getUggUrl = (championId: string): string =>
  `https://u.gg/lol/champions/${championId.toLowerCase()}/build`
