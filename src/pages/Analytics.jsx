import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Crown, TrendingUp, Calendar, Bell } from 'lucide-react'
import { API_URL } from '../config'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/usuarios`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const users = data?.users || []
  const stats = data?.stats || {}

  // Registration by month
  const byMonth = {}
  users.forEach(u => {
    const d = new Date(u.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] || 0) + 1
  })
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]))
  const maxMonth = Math.max(...months.map(m => m[1]), 1)

  // By country
  const byCountry = {}
  users.forEach(u => {
    const c = u.pais === 'costa_rica' ? 'Costa Rica' : u.pais === 'argentina' ? 'Argentina' : u.pais || 'Otro'
    byCountry[c] = (byCountry[c] || 0) + 1
  })

  // Alerts distribution
  const alertsBuckets = { '0': 0, '1-3': 0, '4-10': 0, '10+': 0 }
  users.forEach(u => {
    const c = u.alertasCount || 0
    if (c === 0) alertsBuckets['0']++
    else if (c <= 3) alertsBuckets['1-3']++
    else if (c <= 10) alertsBuckets['4-10']++
    else alertsBuckets['10+']++
  })

  // Conversion rate
  const convRate = stats.totalUsers ? (stats.premiumUsers / stats.totalUsers * 100).toFixed(1) : 0

  // Recent registrations (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentCount = users.filter(u => new Date(u.createdAt).getTime() > weekAgo).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <p className="text-gray-400 text-sm mt-1">Estadísticas y métricas de la plataforma</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-blue-400">{convRate}%</p>
          <p className="text-sm text-gray-400 mt-1">Conversión a Premium</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-green-400">{recentCount}</p>
          <p className="text-sm text-gray-400 mt-1">Registros últimos 7 días</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-amber-400">{stats.totalAlerts || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Alertas totales</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-purple-400">{users.length ? (stats.totalAlerts / users.length).toFixed(1) : 0}</p>
          <p className="text-sm text-gray-400 mt-1">Alertas por usuario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations by Month - Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Registros por Mes</h3>
          <div className="space-y-2">
            {months.map(([month, count]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">{month}</span>
                <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all" style={{ width: `${(count / maxMonth) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Country */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-green-400" /> Usuarios por País</h3>
          <div className="space-y-4">
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
              <div key={country}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">{country}</span>
                  <span className="text-sm text-gray-400">{count} ({(count / users.length * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${(count / users.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> Distribución de Alertas</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(alertsBuckets).map(([range, count]) => (
              <div key={range} className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-gray-400 mt-1">{range} alertas</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-purple-400" /> Distribución de Planes</h3>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">{stats.totalUsers - stats.premiumUsers}</span>
              </div>
              <p className="text-sm text-gray-400">Free</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-purple-400">{stats.premiumUsers}</span>
              </div>
              <p className="text-sm text-purple-400">Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
