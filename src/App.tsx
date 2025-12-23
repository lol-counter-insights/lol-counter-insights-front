import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useChampions } from './hooks/useChampions'
import { Home } from './pages/Home'
import { ChampionDetail } from './pages/ChampionDetail'
import styles from './App.module.css'

function App() {
  const { champions, ddragonVersion, loading, error } = useChampions()

  if (loading) {
    return <div className={styles.loading}>チャンピオンを読み込み中...</div>
  }

  if (error) {
    return <div className={styles.error}>エラー: {error}</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home champions={champions} ddragonVersion={ddragonVersion} />}
        />
        <Route
          path="/champion/:championId"
          element={<ChampionDetail champions={champions} ddragonVersion={ddragonVersion} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
