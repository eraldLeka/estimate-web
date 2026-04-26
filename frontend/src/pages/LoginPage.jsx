import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { login } from '../api'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [allowAutofill, setAllowAutofill] = useState(false)
  const { setToken } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ username, password })
      setToken(res.data.access_token)
      navigate('/dashboard')
    } catch {
      toast.error(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 40, width: '100%', maxWidth: 380,
      }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
            {t('app.name')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 6 }}>
            {t('auth.subtitle')}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              {t('auth.username')}
            </label>
            <input
              name="preventive_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={inputStyle}
              required
              autoComplete="off"
              readOnly={!allowAutofill}
              onFocus={() => setAllowAutofill(true)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              {t('auth.password')}
            </label>
            <input
              name="preventive_password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              required
              autoComplete="new-password"
              readOnly={!allowAutofill}
              onFocus={() => setAllowAutofill(true)}
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
}

const btnStyle = {
  padding: '12px',
  background: 'var(--accent)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 8,
}
