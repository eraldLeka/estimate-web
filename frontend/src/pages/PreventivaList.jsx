import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Eye, User, Calendar, FileText, Search, ArrowUpDown, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { getPreventiva, exportPdf, deletePreventiv } from '../api'
import { getLocaleFromLanguage } from '../i18n/locale'

export default function PreventivaList() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [sort, setSort] = useState('date-desc')
  const [search, setSearch] = useState('')

  const locale = getLocaleFromLanguage(i18n.resolvedLanguage || i18n.language)

  const { data: res, isLoading } = useQuery({
    queryKey: ['preventiva'],
    queryFn: getPreventiva,
  })

  const rawData = res?.data || []

  const deleteMutation = useMutation({
    mutationFn: deletePreventiv,
    onSuccess: () => {
      qc.invalidateQueries(['preventiva'])
      toast.success(t('preventivesList.toast.deleted'))
    },
    onError: () => toast.error(t('preventivesList.toast.deleteError')),
  })

  // —— FILTER + SORT ——
  const visible = [...rawData]
    .filter(p => !search.trim() || p.client_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name-asc') return a.client_name.localeCompare(b.client_name)
      if (sort === 'name-desc') return b.client_name.localeCompare(a.client_name)
      if (sort === 'price-asc') return a.total - b.total
      if (sort === 'price-desc') return b.total - a.total
      if (sort === 'date-asc') return new Date(a.created_at) - new Date(b.created_at)
      if (sort === 'date-desc') return new Date(b.created_at) - new Date(a.created_at)
      return 0
    })

  const handlePreview = async (id) => {
    try {
      const r = await exportPdf(id)
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch {
      toast.error(t('preventivesList.toast.openPdfError'))
    }
  }

  if (isLoading) return (
    <p style={{ color: '#6b7db3', fontFamily: 'Sora, sans-serif', fontSize: 14, padding: 8 }}>
      {t('actions.loading')}
    </p>
  )

  return (
    <div style={{ width: '100%', fontFamily: 'Sora, sans-serif', color: '#0f1c3f' }}>
      {/* —— PAGE HEADER —— */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #1e4fd8 0%, #2563eb 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', flexShrink: 0,
          }}
          >
            <FileText size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#6b7db3', margin: '0 0 3px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {t('preventivesList.header.eyebrow')}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d1b40', margin: 0, letterSpacing: '-0.4px' }}>
              {t('preventivesList.header.title')}
            </h1>
          </div>
        </div>

        {/* count badge */}
        <span style={{
          fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace',
          background: '#eef2ff', color: '#2563eb',
          padding: '5px 14px', borderRadius: 20, border: '1px solid #c7d7ff',
        }}
        >
          {t('preventivesList.header.count', { count: rawData.length })}
        </span>
      </div>

      {/* —— FILTER BAR —— */}
      {rawData.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#93a8d4', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}
            >
              <Search size={14} strokeWidth={1.8} />
            </span>
            <input
              type="text"
              placeholder={t('preventivesList.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 34px 9px 36px', borderRadius: 10,
                border: '1.5px solid #d0daf0', background: '#f7f9ff',
                color: '#0d1b40', fontFamily: 'Sora, sans-serif', fontSize: 13,
                fontWeight: 500, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.18s, box-shadow 0.18s',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.11)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#d0daf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f7f9ff' }}
            />
            {!!search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 26, height: 26,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#93a8d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={t('actions.cancel')}
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: '#6b7db3', fontFamily: 'Sora, sans-serif',
            }}
            >
              <ArrowUpDown size={12} strokeWidth={2} /> {t('sort.label')}
            </span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                padding: '9px 32px 9px 12px', borderRadius: 10,
                border: '1.5px solid #d0daf0', background: '#f7f9ff',
                color: '#0d1b40', fontFamily: 'Sora, sans-serif', fontSize: 13,
                fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7db3' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                transition: 'border-color 0.18s, box-shadow 0.18s',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.11)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#d0daf0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f7f9ff' }}
            >
              <option value="date-desc">{t('sort.dateNewest')}</option>
              <option value="date-asc">{t('sort.dateOldest')}</option>
              <option value="name-asc">{t('sort.clientAsc')}</option>
              <option value="name-desc">{t('sort.clientDesc')}</option>
              <option value="price-asc">{t('sort.totalLow')}</option>
              <option value="price-desc">{t('sort.totalHigh')}</option>
            </select>
          </div>
        </div>
      )}

      {/* —— TABLE CARD —— */}
      {visible.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: '#fff', border: '1.5px dashed #c5d2f0', borderRadius: 16,
        }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#eef2ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', color: '#6b7db3',
          }}
          >
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#3a4e80' }}>
            {search
              ? t('preventivesList.empty.noResults', { search })
              : t('preventivesList.empty.none')}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: '#8fa0c8' }}>
            {search
              ? t('preventivesList.empty.tryAnother')
              : t('preventivesList.empty.createFirst')}
          </p>
        </div>
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #dce5f7',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(14,30,80,0.06)',
        }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { label: t('preventivesList.table.number'), icon: null, align: 'left', w: 60 },
                  { label: t('preventivesList.table.client'), icon: <User size={12} strokeWidth={2} />, align: 'left' },
                  { label: t('preventivesList.table.date'), icon: <Calendar size={12} strokeWidth={2} />, align: 'left' },
                  { label: t('preventivesList.table.total'), icon: null, align: 'right' },
                  { label: t('preventivesList.table.actions'), icon: null, align: 'right' },
                ].map(({ label, icon, align, w }) => (
                  <th key={label} style={{
                    padding: '11px 18px',
                    background: '#f5f8ff',
                    borderBottom: '1.5px solid #1e4fd8',
                    fontSize: 10.5, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#1e4fd8', textAlign: align,
                    width: w || 'auto',
                  }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {icon}{label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visible.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < visible.length - 1 ? '1px solid #eef2fc' : 'none',
                    transition: 'background 0.15s',
                    animation: `pvFadeSlide 0.22s ease ${i * 0.03}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f8ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* ID */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                    <span style={{
                      background: '#eef2ff', color: '#2563eb',
                      padding: '3px 9px', borderRadius: 6,
                      fontSize: 12, fontWeight: 700,
                      fontFamily: 'DM Mono, monospace',
                    }}
                    >
                      {p.id}
                    </span>
                  </td>

                  {/* CLIENT */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'middle', fontWeight: 600, color: '#0d1b40', fontSize: 13.5 }}>
                    {p.client_name}
                  </td>

                  {/* DATE */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'middle', color: '#6b7db3', fontSize: 13 }}>
                    {new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(p.created_at))}
                  </td>

                  {/* TOTAL */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: 14,
                      fontWeight: 600, color: '#1638a8', letterSpacing: '-0.3px',
                    }}
                    >
                      {p.total?.toFixed(2)} €
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      {/* PDF */}
                      <button
                        type="button"
                        onClick={() => handlePreview(p.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 8,
                          background: 'linear-gradient(135deg, #1e4fd8, #2563eb)',
                          color: '#fff', border: 'none', cursor: 'pointer',
                          fontFamily: 'Sora, sans-serif', fontSize: 12.5, fontWeight: 600,
                          boxShadow: '0 3px 10px rgba(37,99,235,0.25)',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 16px rgba(37,99,235,0.35)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(37,99,235,0.25)' }}
                      >
                        <Eye size={13} strokeWidth={1.8} /> {t('actions.viewPdf')}
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                        title={t('preventivesList.table.deleteTitle')}
                        style={{
                          width: 34, height: 34, borderRadius: 8, padding: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: '#fff7f7', border: '1.5px solid #fde8e8',
                          color: '#c94040', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.transform = 'scale(1.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff7f7'; e.currentTarget.style.borderColor = '#fde8e8'; e.currentTarget.style.color = '#c94040'; e.currentTarget.style.transform = 'none' }}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes pvFadeSlide {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
    </div>
  )
}
