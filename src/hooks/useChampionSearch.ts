import { useState, useMemo } from 'react'
import type { Champion } from '../types/champion'
import { filterChampionsByQuery } from '../utils/champion'

interface UseChampionSearchResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isFocused: boolean
  setIsFocused: (focused: boolean) => void
  filteredChampions: Champion[]
  isSearching: boolean
}

export function useChampionSearch(champions: Champion[]): UseChampionSearchResult {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const filteredChampions = useMemo(() => {
    if (!searchQuery) return []
    return filterChampionsByQuery(champions, searchQuery)
  }, [champions, searchQuery])

  const isSearching = isFocused || !!searchQuery

  return {
    searchQuery,
    setSearchQuery,
    isFocused,
    setIsFocused,
    filteredChampions,
    isSearching,
  }
}
