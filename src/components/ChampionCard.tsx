import styles from './ChampionCard.module.css'

interface Props {
  imageUrl: string
  name: string
  onClick: () => void
  variant?: 'default' | 'circle' | 'matchup'
}

export function ChampionCard({ imageUrl, name, onClick, variant = 'default' }: Props) {
  const variantClass = variant !== 'default' ? styles[variant] : ''

  return (
    <div
      className={`${styles.card} ${variantClass}`}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      <img
        src={imageUrl}
        alt={name}
        className={styles.image}
      />
      <span className={styles.name}>{name}</span>
    </div>
  )
}
