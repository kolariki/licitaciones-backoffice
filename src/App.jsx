import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, BarChart3, FileText, Menu, Layers, Send, LogOut, MailCheck, Server, Eye, Database, Mail, Zap } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/Users'
import UserDetail from './pages/UserDetail'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Licitaciones from './pages/Licitaciones'
import Recomendaciones from './pages/Recomendaciones'
import AlertasEnviadas from './pages/AlertasEnviadas'
import ScraperPrincipal from './pages/ScraperPrincipal'
import PreviewAlertas from './pages/PreviewAlertas'
import LicitacionesCR from './pages/LicitacionesCR'
import EmailMasivo from './pages/EmailMasivo'
import AutoEnvios from './pages/AutoEnvios'

const SUPERADMIN_EMAIL = 'ivankolariki1990@gmail.com'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
  { to: '/licitaciones', icon: FileText, label: 'Licitaciones' },
  { to: '/recomendaciones', icon: Send, label: 'Recomendaciones' },
  { to: '/alertas-enviadas', icon: MailCheck, label: 'Alertas Enviadas' },
  { to: '/auto-envios', icon: Zap, label: 'Auto-Envíos', superadminOnly: true },
  { to: '/scraper', icon: Server, label: 'Scraper Principal', superadminOnly: true },
  { to: '/preview-alertas', icon: Eye, label: 'Preview Alertas' },
  { to: '/licitaciones-cr', icon: Database, label: 'BD Licitaciones CR' },
  { to: '/email-masivo', icon: Mail, label: 'Email Masivo' },
]

function Sidebar({ open, setOpen, alertsPending, onDismissAlerts }) {
  const { user, logout } = useAuth()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 border-r border-gray-800 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Layers className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-lg font-bold text-white">Elevum</h1>
            <p className="text-xs text-gray-400">Backoffice</p>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.filter(item => !item.superadminOnly || user?.email === SUPERADMIN_EMAIL).map(({ to, icon: Icon, label }) => {
            const isAlertItem = to === '/preview-alertas' && alertsPending
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => { setOpen(false); if (isAlertItem) onDismissAlerts() }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isAlertItem ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse' :
                    isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <Icon className={`w-5 h-5 ${isAlertItem ? 'text-green-400' : ''}`} />
                {label}
                {isAlertItem && (
                  <span className="ml-auto w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-ping" />
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm font-bold text-blue-300">
              {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-300 truncate">{user?.nombre || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || user?.rol || ''}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

function SuperadminRoute({ children }) {
  const { user } = useAuth()
  if (user?.email !== SUPERADMIN_EMAIL) return <Navigate to="/dashboard" replace />
  return children
}

function ProtectedApp() {
  const { isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [alertsPending, setAlertsPending] = React.useState(false)

  React.useEffect(() => {
    const handler = () => setAlertsPending(true)
    window.addEventListener('alertas-pending', handler)
    return () => window.removeEventListener('alertas-pending', handler)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // If not authenticated, only /admin shows login — everything else shows landing
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/bb" element={<Login />} />
        <Route path="*" element={
          <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="text-center">
              <img src="/elevum-logo.png" alt="Elevum" className="h-12 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Elevum Licitaciones</h1>
              <p className="text-gray-500 mb-8">Plataforma inteligente de gestión de licitaciones</p>
              <a
                href="https://elevumgroup.com"
                style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2847 100%)' }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Conocer plataforma
              </a>
            </div>
          </div>
        } />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} alertsPending={alertsPending} onDismissAlerts={() => setAlertsPending(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/bb" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/licitaciones" element={<Licitaciones />} />
            <Route path="/recomendaciones" element={<Recomendaciones />} />
            <Route path="/alertas-enviadas" element={<AlertasEnviadas />} />
            <Route path="/auto-envios" element={<SuperadminRoute><AutoEnvios /></SuperadminRoute>} />
            <Route path="/scraper" element={<SuperadminRoute><ScraperPrincipal /></SuperadminRoute>} />
            <Route path="/preview-alertas" element={<PreviewAlertas />} />
            <Route path="/licitaciones-cr" element={<LicitacionesCR />} />
            <Route path="/email-masivo" element={<EmailMasivo />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
