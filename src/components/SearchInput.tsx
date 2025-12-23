import styles from './SearchInput.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  autoFocus?: boolean
  variant?: 'default' | 'compact'
  children?: React.ReactNode
}

export function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  variant = 'default',
  children,
}: Props) {
  const wrapperClass = variant === 'compact'
    ? `${styles.wrapper} ${styles.compact}`
    : styles.wrapper

  return (
    <div className={wrapperClass}>
      <img src="/search.png" alt="検索" className={styles.icon} />
      <input
        type="text"
        className={styles.field}
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
      {value && (
        <button
          className={styles.cancel}
          onClick={() => onChange('')}
          type="button"
        >
          <img src="/cancel.png" alt="クリア" />
        </button>
      )}
      {children}
    </div>
  )
}
