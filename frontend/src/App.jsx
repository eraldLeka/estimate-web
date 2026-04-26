import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import NewPreventivPage from './pages/NewPreventivPage'
import PreventivDetailPage from './pages/PreventivDetailPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import PreventivaList from './pages/PreventivaList'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="preventiva/new" element={<NewPreventivPage />} />
        <Route path="preventiva/:id" element={<PreventivDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path='preventives' element={<PreventivaList/>} />
      </Route>
    </Routes>
  )
}