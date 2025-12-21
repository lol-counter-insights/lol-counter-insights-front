/**
 * カウンター情報の型定義
 */

// 個別のカウンターマッチアップ情報
export interface CounterMatchup {
  championId: string
}

// チャンピオンごとのカウンター情報
export interface ChampionCounterData {
  strongAgainst: CounterMatchup[] // このチャンピオンが有利な相手
  weakAgainst: CounterMatchup[] // このチャンピオンが不利な相手
}

// カウンターデータソースのinterface
// 後から自動データソースに切り替え可能
export interface CounterDataSource {
  getCounterData(championId: string): Promise<ChampionCounterData | null>
  getAllCounterData(): Promise<Record<string, ChampionCounterData>>
}
