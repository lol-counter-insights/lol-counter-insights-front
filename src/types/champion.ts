export interface Champion {
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

export interface ChampionData {
  data: Record<string, Champion>
}

export interface CustomChampionData {
  nicknames: string[]
  damageType?: 'ad' | 'ap' | 'hybrid'
}
