import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CloudSun, FileText, Plus, TrendingUp, ArrowRight, Sun, Moon } from 'lucide-react'

import { getPreventiva } from '../api'
import { getLocaleFromLanguage } from '../i18n/locale'
import '../styles/DashboardStyle.css'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['preventiva'],
    queryFn: getPreventiva,
  })

  const preventiva = data?.data || []
  const total = preventiva.reduce((sum, p) => sum + (p.total || 0), 0)

  const hour = new Date().getHours()
  const locale = getLocaleFromLanguage(i18n.resolvedLanguage || i18n.language)

  let greetingKey = 'dashboard.greeting.midday'
  let Icon = <Sun className="sky-icon midday-icon" size={32} />

  if (hour >= 5 && hour < 11) {
    greetingKey = 'dashboard.greeting.morning'
    Icon = <CloudSun className="sky-icon morning-icon" size={32} />
  } else if (hour >= 19 || hour < 5) {
    greetingKey = 'dashboard.greeting.night'
    Icon = <Moon className="sky-icon night-icon" size={32} />
  }

  const todayLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="dash-root">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <div className="dash-eyebrow">
            <div className="dash-eyebrow-dot" />
            {t('dashboard.system')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {Icon}
            <h1 className="dash-title" style={{ margin: 0 }}>
              {t(greetingKey)}, <strong>Erald Leka</strong>
            </h1>
          </div>
          <p className="dash-subtitle">{todayLabel}</p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/preventiva/new')} type="button">
          <Plus size={15} strokeWidth={2.5} />
          {t('dashboard.newPreventive')}
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('dashboard.stats.totalPreventives')}</div>
          <div className="stat-value">{preventiva.length}</div>
          <FileText size={52} className="stat-bg-icon" />
        </div>

        <div className="stat-card accent">
          <div className="stat-label">{t('dashboard.stats.totalValue')}</div>
          <div className="stat-value">{total.toFixed(2)} €</div>
          <TrendingUp size={52} className="stat-bg-icon" />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">{t('dashboard.recent.title')}</span>
          <span className="table-badge">{t('dashboard.recent.last5')}</span>
        </div>

        <div className="col-heads">
          <span className="col-head">{t('dashboard.recent.clientDate')}</span>
          <span className="col-head">{t('dashboard.recent.amount')}</span>
        </div>

        {isLoading ? (
          <div className="state-loading">{t('actions.loading')}</div>
        ) : preventiva.length === 0 ? (
          <div className="state-empty">
            <FileText size={30} style={{ opacity: 0.2 }} />
            <span>{t('dashboard.recent.empty')}</span>
          </div>
        ) : (
          preventiva.slice(0, 5).map(p => (
            <div
              key={p.id}
              className="prev-row"
              onClick={() => navigate(`/preventiva/${p.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(`/preventiva/${p.id}`)
              }}
            >
              <div>
                <div className="client-name">{p.client_name}</div>
                <div className="row-date">
                  {new Intl.DateTimeFormat(locale).format(new Date(p.created_at))}
                </div>
              </div>

              <div className="row-right">
                <div className="row-amount">{Number(p.total || 0).toFixed(2)} €</div>
                <ArrowRight size={14} className="row-arrow" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
