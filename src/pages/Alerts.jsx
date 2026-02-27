import React, { useState, useEffect } from 'react'
import { Bell, Search, User, Tag, Code, Clock, ToggleLeft, ToggleRight, Zap, Filter, Inbox } from 'lucide-react'
import { API_URL } from '../config'
import { Link } from 'react-router-dom'

export default function Alerts() {
  const [users, setUsers] = useState([])
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/usuarios`)
      .then(r => r.json())
      .then(async (d) => {
        const usrs = d.users || []
        setUsers(usrs)
        const withAlerts = usrs.filter(u => u.alertasCount > 0)
        const alertPromises = withAlerts.map(u =>
          fetch(`${API_URL}/api/dashboard/usuarios/${u._id}/alertas`)
            .then(r => r.json())
            .then(data => (data.alertas || []).map(a => ({ ...a, userName: u.nombre, userEmail: u.email, userId: u._id })))
            .catch(() => [])
        )
        const results = await Promise.all(alertPromises)
        setAllAlerts(results.flat())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = allAlerts.filter(a => {
    if (search) {
      const s = search.toLowerCase()
      if (!(a.nombre || '').toLowerCase().includes(s) &&
          !(a.userName || '').toLowerCase().includes(s) &&
          !(a.palabrasClaveArray || []).some(kw => kw.toLowerCase().includes(s))) return false
    }
    if (filterType === 'active' && !a.activa) return false
    if (filterType === 'inactive' && a.activa) return false
    if (filterType === 'keywords' && a.tipo !== 'keywords') return false
    if (filterType === 'codes' && a.tipo !== 'codes') return false
    return true
  })

  const activeCount = allAlerts.filter(a => a.activa).length
  const keywordsCount = allAlerts.filter(a => a.tipo === 'keywords').length
  const codesCount = allAlerts.filter(a => a.tipo === 'codes').length

  const filters = [
    { key: 'all', label: 'Todas', count: allAlerts.length },
    { key: 'active', label: 'Activas', count: activeCount },
    { key: 'inactive', label: 'Inactivas', count: allAlerts.length - activeCount },
    { key: 'keywords', label: 'Palabras', count: keywordsCount },
    { key: 'codes', label: 'Códigos', count: codesCount },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade { animation: fadeIn 0.5s ease-out both; }
        .anim-slide { animation: slideUp 0.5s ease-out both; }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="anim-fade">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/20">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Alertas</h1>
              <p className="text-gray-500 text-sm">{allAlerts.length} alertas de {users.filter(u => u.alertasCount > 0).length} usuarios</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: allAlerts.length, label: 'Total', icon: Bell, gradient: 'from-white/10 to-white/5', border: 'border-white/10', text: 'text-white', shadow: '' },
            { value: activeCount, label: 'Activas', icon: Zap, gradient: 'from-green-500/15 to-green-600/5', border: 'border-green-500/20', text: 'text-green-400', shadow: 'shadow-green-500/5' },
            { value: keywordsCount, label: 'Por Palabras', icon: Search, gradient: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/5' },
            { value: codesCount, label: 'Por Códigos', icon: Code, gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/20', text: 'text-amber-400', shadow: 'shadow-amber-500/5' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`anim-slide bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border ${stat.border} rounded-2xl p-5 text-center hover:shadow-lg ${stat.shadow} transition-all duration-300`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <stat.icon className={`w-5 h-5 ${stat.text} mx-auto mb-2 opacity-60`} />
              <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter Pills */}
        <div className="anim-slide flex flex-col sm:flex-row gap-3" style={{ animationDelay: '200ms' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar alertas o usuarios..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  filterType === f.key
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {f.label} <span className="opacity-60 ml-1">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <div
              key={a._id || i}
              className="anim-slide bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-5 py-4 hover:border-white/10 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* User avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(a.userName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      {a.nombre || 'Sin nombre'}
                      {a.activa && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </p>
                    <Link to={`/users/${a.userId}`} className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 mt-0.5 transition-colors">
                      <User className="w-3 h-3" /> {a.userName} — {a.userEmail}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.tipo === 'keywords' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                    {a.tipo === 'keywords' ? 'Palabras' : 'Códigos'}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.activa ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {a.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-13">
                {(a.palabrasClaveArray || []).map((kw, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10 shadow-sm shadow-blue-500/5">{kw}</span>
                ))}
                {(a.codigos || []).map((c, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10 shadow-sm shadow-amber-500/5 font-mono">{c}</span>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="anim-fade bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl py-16 text-center">
              <Inbox className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No se encontraron alertas</p>
              <p className="text-gray-600 text-xs mt-1">Probá ajustando los filtros o el texto de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
