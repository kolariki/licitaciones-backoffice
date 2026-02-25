import React, { useState, useEffect } from 'react'
import { Users, Bell, Crown, TrendingUp, ArrowUpRight, Clock, UserPlus } from 'lucide-react'
import { API_URL } from '../config'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5" />
        <ArrowUpRight className="w-4 h-4 opacity-50" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/usuarios`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const stats = data?.stats || {}
  const users = data?.users || []
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
  const premiumUsers = users.filter(u => u.nivelSuscripcion === 'premium' || u.rol === 'premium')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Usuarios" value={stats.totalUsers || 0} color="blue" />
        <StatCard icon={TrendingUp} label="Usuarios Activos" value={stats.activeUsers || 0} color="green" />
        <StatCard icon={Crown} label="Premium" value={stats.premiumUsers || 0} sub={`${stats.totalUsers ? Math.round(stats.premiumUsers / stats.totalUsers * 100) : 0}% del total`} color="purple" />
        <StatCard icon={Bell} label="Total Alertas" value={stats.totalAlerts || 0} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-400" /> Últimos Registros</h2>
            <Link to="/users" className="text-xs text-blue-400 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {recentUsers.map(u => (
              <Link key={u._id} to={`/users/${u._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                  {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.nivelSuscripcion === 'premium' || u.rol === 'premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                    {u.nivelSuscripcion || u.rol || 'free'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(u.createdAt).toLocaleDateString('es')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold flex items-center gap-2"><Crown className="w-4 h-4 text-purple-400" /> Usuarios Premium</h2>
            <span className="text-xs text-gray-500">{premiumUsers.length} usuarios</span>
          </div>
          <div className="divide-y divide-gray-800">
            {premiumUsers.map(u => (
              <Link key={u._id} to={`/users/${u._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
                  {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-400">{u.alertasCount} alertas</p>
                </div>
              </Link>
            ))}
            {premiumUsers.length === 0 && (
              <p className="text-sm text-gray-500 px-5 py-8 text-center">Sin usuarios premium</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
