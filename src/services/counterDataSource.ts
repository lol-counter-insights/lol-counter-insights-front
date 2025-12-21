import type {
  CounterDataSource,
  ChampionCounterData,
} from '../types/counter'
import countersData from '../data/counters.json'

// 手動データソース（JSONファイルから読み込み）
class ManualCounterDataSource implements CounterDataSource {
  private data: Record<string, ChampionCounterData>

  constructor() {
    this.data = countersData as Record<string, ChampionCounterData>
  }

  async getCounterData(championId: string): Promise<ChampionCounterData | null> {
    return this.data[championId] || null
  }

  async getAllCounterData(): Promise<Record<string, ChampionCounterData>> {
    return this.data
  }
}

// TODO: 将来的に自動データソースを実装する際はここに追加
// class AutomatedCounterDataSource implements CounterDataSource {
//   async getCounterData(championId: string): Promise<ChampionCounterData | null> {
//     // APIからデータを取得
//   }
//   async getAllCounterData(): Promise<Record<string, ChampionCounterData>> {
//     // APIからデータを取得
//   }
// }

// 現在のデータソースをエクスポート
// 将来切り替える際はここを変更するだけでOK
export const counterDataSource: CounterDataSource = new ManualCounterDataSource()
