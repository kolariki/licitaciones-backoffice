import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, BarChart3, Settings, FileText, Shield, Search, Menu, X, Layers } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/Users'
import UserDetail from './pages/UserDetail'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Licitaciones from './pages/Licitaciones'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
  { to: '/licitaciones', icon: FileText, label: 'Licitaciones' },
]

function Sidebar({ open, setOpen }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 border-r border-gray-800 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Layers className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-lg font-bold text-white">Elevum</h1>
            <p className="text-xs text-gray-400">Backoffice</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500">Elevum Licitaciones v1.0</p>
          <p className="text-xs text-gray-600">Panel de administración</p>
        </div>
      </aside>
    </>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="lg:ml-64">
          <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">A</div>
              <span className="text-sm text-gray-300 hidden sm:block">Admin</span>
            </div>
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
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
