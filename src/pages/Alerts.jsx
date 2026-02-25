import React, { useState, useEffect } from 'react'
import { Bell, Search, User, Tag, Code, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
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
        // Fetch alerts for users that have alerts
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas</h1>
        <p className="text-gray-400 text-sm mt-1">{allAlerts.length} alertas de {users.filter(u => u.alertasCount > 0).length} usuarios</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{allAlerts.length}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-gray-900 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          <p className="text-xs text-gray-400">Activas</p>
        </div>
        <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{keywordsCount}</p>
          <p className="text-xs text-gray-400">Por Palabras</p>
        </div>
        <div className="bg-gray-900 border border-amber-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{codesCount}</p>
          <p className="text-xs text-gray-400">Por Códigos</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar alertas o usuarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300">
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="keywords">Por Palabras</option>
          <option value="codes">Por Códigos</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {filtered.map((a, i) => (
          <div key={a._id || i} className="px-5 py-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  {a.nombre || 'Sin nombre'}
                </p>
                <Link to={`/users/${a.userId}`} className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 mt-1">
                  <User className="w-3 h-3" /> {a.userName} — {a.userEmail}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.tipo === 'keywords' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {a.tipo === 'keywords' ? 'Palabras' : 'Códigos'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.activa ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  {a.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(a.palabrasClaveArray || []).map((kw, j) => (
                <span key={j} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">{kw}</span>
              ))}
              {(a.codigos || []).map((c, j) => (
                <span key={j} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded font-mono">{c}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-12">No se encontraron alertas</p>}
      </div>
    </div>
  )
}
