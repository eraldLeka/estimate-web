import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Settings, User, Phone, Mail, MapPin, Save, Lock, Building2 } from 'lucide-react'

import { getSeller, updateSeller } from '../api'
import '../styles/SettingsStyle.css'

const FIXED_SELLER_NAME = 'Erald Leka'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({ queryKey: ['seller'], queryFn: getSeller })
  const seller = data?.data || {}

  const [overrides, setOverrides] = useState({})
  const view = {
    name: FIXED_SELLER_NAME,
    phone: overrides.phone ?? seller.phone ?? '',
    email: overrides.email ?? seller.email ?? '',
    address: overrides.address ?? seller.address ?? '',
  }

  const mutation = useMutation({
    mutationFn: updateSeller,
    onSuccess: () => toast.success(t('settings.toast.saved')),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ ...seller, ...overrides, name: FIXED_SELLER_NAME })
  }

  if (isLoading) {
    return (
      <p style={{ color: '#6b7db3', fontFamily: 'Sora, sans-serif', fontSize: 14 }}>
        {t('actions.loading')}
      </p>
    )
  }

  return (
    <div className="st-root">
      {/* PAGE HEADER */}
      <div className="st-header">
        <div className="st-header-icon">
          <Settings size={18} strokeWidth={1.8} />
        </div>
        <div>
          <p className="st-breadcrumb">{t('settings.breadcrumb')}</p>
          <h1 className="st-title">{t('settings.title')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="st-layout">
          {/* —— LEFT: MERGED CARD —— */}
          <div className="st-card">
            {/* SECTION 1 — Identity */}
            <div className="st-section">
              <div className="st-section-header">
                <span className="st-section-icon"><User size={13} strokeWidth={2.2} /></span>
                <span className="st-section-title">{t('settings.sections.identity')}</span>
              </div>
              <div className="st-fields">
                <div className="st-field st-field--full">
                  <label className="st-label">{t('settings.fields.sellerName')}</label>
                  <div className="st-input-wrap">
                    <span className="st-input-icon"><User size={14} strokeWidth={1.8} /></span>
                    <input
                      className="st-input st-input--readonly"
                      value={FIXED_SELLER_NAME}
                      readOnly
                      tabIndex={-1}
                    />
                    <span className="st-readonly-badge">
                      <Lock size={9} strokeWidth={2.5} />
                      {t('settings.fields.fixed')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 — Contact & Address */}
            <div className="st-section">
              <div className="st-section-header">
                <span className="st-section-icon"><Building2 size={13} strokeWidth={2.2} /></span>
                <span className="st-section-title">{t('settings.sections.contactAddress')}</span>
              </div>
              <div className="st-fields">
                <div className="st-field">
                  <label className="st-label">{t('settings.fields.phone')}</label>
                  <div className="st-input-wrap">
                    <span className="st-input-icon"><Phone size={14} strokeWidth={1.8} /></span>
                    <input
                      className="st-input"
                      value={view.phone}
                      onChange={e => setOverrides(o => ({ ...o, phone: e.target.value }))}
                      placeholder="+355 6X XXX XXXX"
                    />
                  </div>
                </div>

                <div className="st-field">
                  <label className="st-label">{t('settings.fields.email')}</label>
                  <div className="st-input-wrap">
                    <span className="st-input-icon"><Mail size={14} strokeWidth={1.8} /></span>
                    <input
                      className="st-input"
                      type="email"
                      value={view.email}
                      onChange={e => setOverrides(o => ({ ...o, email: e.target.value }))}
                      placeholder="edvini@email.com"
                    />
                  </div>
                </div>

                <div className="st-field st-field--full">
                  <label className="st-label">{t('settings.fields.address')}</label>
                  <div className="st-input-wrap">
                    <span className="st-input-icon"><MapPin size={14} strokeWidth={1.8} /></span>
                    <input
                      className="st-input"
                      value={view.address}
                      onChange={e => setOverrides(o => ({ ...o, address: e.target.value }))}
                      placeholder="Rruga..., Tiranë"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="st-footer">
              <button type="submit" className="st-btn" disabled={mutation.isPending}>
                <Save size={14} strokeWidth={2} />
                {mutation.isPending ? t('actions.saving') : t('settings.fields.saveChanges')}
              </button>
            </div>
          </div>

          {/* —— RIGHT: LIVE PREVIEW —— */}
          <div className="st-preview">
            <p className="st-preview-label">{t('settings.preview.title')}</p>

            <div className="st-preview-row">
              <div className="st-preview-icon-wrap"><User size={15} strokeWidth={1.8} /></div>
              <div className="st-preview-content">
                <span className="st-preview-key">{t('settings.preview.name')}</span>
                <span className="st-preview-val">{FIXED_SELLER_NAME}</span>
              </div>
            </div>

            <div className="st-preview-row">
              <div className="st-preview-icon-wrap"><Phone size={15} strokeWidth={1.8} /></div>
              <div className="st-preview-content">
                <span className="st-preview-key">{t('settings.preview.phone')}</span>
                {view.phone
                  ? <span className="st-preview-val">{view.phone}</span>
                  : <span className="st-preview-val st-preview-val--empty">{t('settings.preview.notSet')}</span>}
              </div>
            </div>

            <div className="st-preview-row">
              <div className="st-preview-icon-wrap"><Mail size={15} strokeWidth={1.8} /></div>
              <div className="st-preview-content">
                <span className="st-preview-key">{t('settings.preview.email')}</span>
                {view.email
                  ? <span className="st-preview-val">{view.email}</span>
                  : <span className="st-preview-val st-preview-val--empty">{t('settings.preview.notSet')}</span>}
              </div>
            </div>

            <div className="st-preview-row">
              <div className="st-preview-icon-wrap"><MapPin size={15} strokeWidth={1.8} /></div>
              <div className="st-preview-content">
                <span className="st-preview-key">{t('settings.preview.address')}</span>
                {view.address
                  ? <span className="st-preview-val">{view.address}</span>
                  : <span className="st-preview-val st-preview-val--empty">{t('settings.preview.notSet')}</span>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
