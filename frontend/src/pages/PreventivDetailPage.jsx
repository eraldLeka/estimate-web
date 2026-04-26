import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { getPreventiv, exportPdf, deletePreventiv } from '../api'
import { getLocaleFromLanguage } from '../i18n/locale'

const FIXED_SELLER_NAME = 'Erald Leka'

export default function PreventivDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const locale = getLocaleFromLanguage(i18n.resolvedLanguage || i18n.language)

  const { data, isLoading } = useQuery({
    queryKey: ['preventiv', id],
    queryFn: () => getPreventiv(id),
  })
  const p = data?.data

  const deleteMutation = useMutation({
    mutationFn: () => deletePreventiv(id),
    onSuccess: () => {
      qc.invalidateQueries(['preventiva'])
      toast.success(t('preventiveDetail.toast.deleted'))
      navigate('/dashboard')
    },
  })

  const handleExport = async () => {
    try {
      const res = await exportPdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `preventiv_${id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error(t('preventiveDetail.toast.exportError'))
    }
  }

  if (isLoading) return <p style={{ color: 'var(--text2)' }}>{t('preventiveDetail.loading')}</p>
  if (!p) return <p style={{ color: 'var(--danger)' }}>{t('preventiveDetail.notFound')}</p>

  const seller = normalizeSeller(p.seller_snapshot)
  const grandTotal = p.items.reduce((sum, item) => sum + item.total, 0)
  const issueDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(p.created_at))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <button onClick={() => navigate('/dashboard')} style={btnGhostModern} type="button">
          <ArrowLeft size={18} /> {t('actions.back')}
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => deleteMutation.mutate()} style={btnDangerModern} type="button">
            <Trash2 size={16} /> {t('actions.delete')}
          </button>
          <button onClick={handleExport} style={btnAccentModern} type="button">
            <Download size={16} /> {t('actions.downloadPdf')}
          </button>
        </div>
      </div>

      {/* Main Document Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
      >
        <div style={{ padding: 40, borderBottom: '2px solid var(--bg3)', background: 'linear-gradient(to right, #fdfdfd, #fff)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={badge}>{t('preventiveDetail.document.badge')}</span>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0d1b40', marginTop: 12, letterSpacing: '-0.5px' }}>
                {t('preventiveDetail.document.titleLabel')} <span style={{ color: 'var(--accent)' }}>#{p.id}</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
                {t('preventiveDetail.document.issueDate', { date: issueDate })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>{grandTotal.toFixed(2)} EUR</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                {t('preventiveDetail.document.grandTotal')}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 40 }}>
            <div>
              <h4 style={infoTitle}>{t('preventiveDetail.document.forClient')}</h4>
              <div style={infoContent}>{p.client_name}</div>
            </div>
            <div>
              <h4 style={infoTitle}>{t('preventiveDetail.document.issuedBy')}</h4>
              <div style={infoContent}>{seller.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {seller.email} • {seller.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div style={{ padding: '0 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thModern}>{t('preventiveDetail.document.table.product')}</th>
                <th style={{ ...thModern, textAlign: 'center' }}>{t('preventiveDetail.document.table.quantity')}</th>
                <th style={{ ...thModern, textAlign: 'right' }}>{t('preventiveDetail.document.table.price')}</th>
                <th style={{ ...thModern, textAlign: 'right' }}>{t('preventiveDetail.document.table.total')}</th>
              </tr>
            </thead>
            <tbody>
              {p.items.map((item) => (
                <tr key={item.id} className="tr-hover" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdModern}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      {item.image_snapshot ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${item.image_snapshot}`}
                          style={imgStyle}
                          alt={item.name_snapshot}
                        />
                      ) : (
                        <div style={{ ...imgStyle, background: '#f0f4ff' }} />
                      )}
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{item.name_snapshot}</span>
                    </div>
                  </td>
                  <td style={{ ...tdModern, textAlign: 'center', fontFamily: 'DM Mono' }}>{item.quantity}</td>
                  <td style={{ ...tdModern, textAlign: 'right' }}>{item.price_snapshot.toFixed(2)} €</td>
                  <td style={{ ...tdModern, textAlign: 'right', fontWeight: 700, color: '#1a202c' }}>
                    {item.total.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: '30px 40px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right', minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{t('preventiveDetail.document.subtotal')}</span>
              <span style={{ fontWeight: 600 }}>{grandTotal.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{t('preventiveDetail.document.total')}</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>{grandTotal.toFixed(2)} EUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function normalizeSeller(snapshot) {
  const s = snapshot || {}
  return {
    name: s.name || FIXED_SELLER_NAME,
    email: s.email || '',
    phone: s.phone || '',
  }
}

const badge = {
  background: '#eef2ff',
  color: '#4338ca',
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1,
}

const infoTitle = { fontSize: 11, color: 'var(--text2)', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }
const infoContent = { fontSize: 16, fontWeight: 700, color: '#1e293b' }

const thModern = { padding: '20px 16px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }
const tdModern = { padding: 16 }

const imgStyle = { width: 50, height: 50, objectFit: 'cover', borderRadius: 10, border: '1px solid #edf2f7' }

const btnBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  transition: 'all 0.2s',
}

const btnAccentModern = {
  ...btnBase,
  background: 'var(--accent)',
  color: 'white',
  padding: '10px 20px',
  boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
  transition: 'transform 0.2s',
  border: 'none',
}

const btnGhostModern = {
  ...btnBase,
  color: 'var(--text2)',
  border: 'none',
  background: 'transparent',
}

const btnDangerModern = {
  ...btnBase,
  color: 'var(--danger)',
  border: 'none',
  background: '#fff1f2',
  padding: '10px 16px',
}
