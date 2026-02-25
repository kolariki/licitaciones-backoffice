import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, BarChart3, FileText, Menu, Layers, Send, LogOut, MailCheck, Server, Eye } from 'lucide-react'
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

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
  { to: '/licitaciones', icon: FileText, label: 'Licitaciones' },
  { to: '/recomendaciones', icon: Send, label: 'Recomendaciones' },
  { to: '/alertas-enviadas', icon: MailCheck, label: 'Alertas Enviadas' },
  { to: '/scraper', icon: Server, label: 'Scraper Principal' },
  { to: '/preview-alertas', icon: Eye, label: 'Preview Alertas' },
]

function Sidebar({ open, setOpen }) {
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
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
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

function ProtectedApp() {
  const { isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) return <Login />

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/licitaciones" element={<Licitaciones />} />
            <Route path="/recomendaciones" element={<Recomendaciones />} />
            <Route path="/alertas-enviadas" element={<AlertasEnviadas />} />
            <Route path="/scraper" element={<ScraperPrincipal />} />
            <Route path="/preview-alertas" element={<PreviewAlertas />} />
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
