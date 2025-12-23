import type { Champion, CustomChampionData } from '../types/champion'

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

/**
 * チャンピオンの表示用タグを取得
 * フォーマット: "ファイター / メレー / AD"
 */
export const getChampionTagDisplay = (
  champion: Champion,
  customData?: CustomChampionData
): string => {
  // タグを日本語に変換（1つ目のみ）
  const japaneseTag = champion.tags?.[0]
    ? tagToJapanese[champion.tags[0]] || champion.tags[0]
    : undefined

  // attackrangeからメレー/レンジを判定
  const attackRange = champion.stats?.attackrange
  const japaneseRange = attackRange !== undefined
    ? (attackRange < MELEE_RANGE_THRESHOLD ? 'メレー' : 'レンジ')
    : undefined

  // damageTypeを変換
  const damageTypeDisplay = customData?.damageType
    ? damageTypeToDisplay[customData.damageType]
    : undefined

  // タグ、range、damageTypeを組み合わせ
  return [japaneseTag, japaneseRange, damageTypeDisplay].filter(Boolean).join(' / ')
}
