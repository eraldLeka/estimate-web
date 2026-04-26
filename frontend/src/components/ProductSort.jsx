import { ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ProductSort({ currentSort, onSortChange }) {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
        textTransform: 'uppercase', color: '#6b7db3',
        fontFamily: 'Sora, sans-serif',
      }}
      >
        <ArrowUpDown size={13} strokeWidth={2} />
        {t('sort.label')}
      </span>

      <select
        value={currentSort}
        onChange={e => onSortChange(e.target.value)}
        style={{
          padding: '8px 32px 8px 12px',
          borderRadius: 10,
          border: '1.5px solid #d0daf0',
          background: '#f7f9ff',
          color: '#0d1b40',
          fontFamily: 'Sora, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7db3' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#2563eb'
          e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.11)'
          e.target.style.background = '#fff'
        }}
        onBlur={e => {
          e.target.style.borderColor = '#d0daf0'
          e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.03)'
          e.target.style.background = '#f7f9ff'
        }}
      >
        <option value="price-asc">{t('sort.priceAsc')}</option>
        <option value="price-desc">{t('sort.priceDesc')}</option>
        <option value="name-asc">{t('sort.nameAsc')}</option>
        <option value="name-desc">{t('sort.nameDesc')}</option>
      </select>
    </div>
  )
}

