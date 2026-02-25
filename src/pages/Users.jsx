import React, { useState, useEffect } from 'react'
import { Search, Filter, Crown, Mail, MapPin, Bell, ChevronRight, Download, UserPlus } from 'lucide-react'
import { API_URL } from '../config'
import { Link } from 'react-router-dom'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/usuarios`)
      .then(r => r.json())
      .then(d => {
        setUsers(d.users || [])
        setStats(d.stats || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users
    .filter(u => {
      if (search) {
        const s = search.toLowerCase()
        if (!u.nombre?.toLowerCase().includes(s) && !u.email?.toLowerCase().includes(s)) return false
      }
      if (filterPlan !== 'all') {
        const isPremium = u.nivelSuscripcion === 'premium' || u.rol === 'premium'
        if (filterPlan === 'premium' && !isPremium) return false
        if (filterPlan === 'free' && isPremium) return false
      }
      if (filterCountry !== 'all' && u.pais !== filterCountry) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'name') return (a.nombre || '').localeCompare(b.nombre || '')
      if (sortBy === 'alerts') return (b.alertasCount || 0) - (a.alertasCount || 0)
      return 0
    })

  const countries = [...new Set(users.map(u => u.pais).filter(Boolean))]

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 focus:border-blue-500 focus:outline-none">
          <option value="all">Todos los planes</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 focus:border-blue-500 focus:outline-none">
          <option value="all">Todos los países</option>
          {countries.map(c => <option key={c} value={c}>{c === 'costa_rica' ? 'Costa Rica' : c === 'argentina' ? 'Argentina' : c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 focus:border-blue-500 focus:outline-none">
          <option value="recent">Más recientes</option>
          <option value="name">Nombre A-Z</option>
          <option value="alerts">Más alertas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Alertas</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(u => {
                const isPremium = u.nivelSuscripcion === 'premium' || u.rol === 'premium'
                return (
                  <tr key={u._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isPremium ? 'bg-purple-600/30 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                          {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.nombre}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {u.pais === 'costa_rica' ? 'Costa Rica' : u.pais === 'argentina' ? 'Argentina' : u.pais || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isPremium ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                        {isPremium ? '★ Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <Bell className="w-3 h-3 text-amber-400" />
                        {u.alertasCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/users/${u._id}`} className="text-blue-400 hover:text-blue-300">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-12">No se encontraron usuarios</p>
        )}
        <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-500">
          Mostrando {filtered.length} de {users.length} usuarios
        </div>
      </div>
    </div>
  )
}
