import { createElement } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, Settings, LogOut, LibraryBig } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import useAuthStore from '../store/authStore'
import LanguageSwitcher from './LanguageSwitcher'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/products', icon: Package, labelKey: 'nav.products' },
  { to: '/preventives', icon: LibraryBig, labelKey: 'nav.preventives' },
  { to: '/preventiva/new', icon: FileText, labelKey: 'nav.newPreventive' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
]

export default function Layout() {
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <header style={headerStyle}>
        {/* Left */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bg2)' }}>
            {t('app.name')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--bg2)' }}>
            Erald Leka
          </div>
        </div>

        {/* Center navigation */}
        <nav style={{ display: 'flex', gap: 8 }}>
          {navItems.map(({ to, icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'var(--text)' : 'var(--bg2)',
                background: isActive ? 'var(--bg2)' : 'transparent',
              })}
            >
              {createElement(icon, { size: 14 })}
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={logoutBtn} type="button">
            <LogOut size={16} />
            {t('actions.logout')}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: 32 }}>
        <Outlet />
      </main>
    </div>
  )
}

const headerStyle = {
  height: 70,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  borderBottom: '1px solid var(--border)',
  background: '#2563ee',
  color: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}

const logoutBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  border: 'none',
  borderRadius: 'var(--radius)',
  background: 'red',
  color: 'var(--bg2)',
  cursor: 'pointer',
  fontWeight: 500,
}
