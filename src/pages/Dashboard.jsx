import React, { useState, useEffect } from 'react'
import { Users, Bell, Crown, TrendingUp, ArrowUpRight, Clock, UserPlus, Database, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, FileText, Mail } from 'lucide-react'
import { API_URL } from '../config'
import { Link } from 'react-router-dom'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

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

function RegistrosScraper() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetch(`${SCRAPER_URL}/api/registros-scraper?limit=10`)
      .then(r => r.json())
      .then(d => { if (d.success) setRegistros(d.registros || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const formatDuration = (s) => {
    if (!s) return '-'
    if (s < 60) return `${s}s`
    const m = Math.floor(s / 60)
    return `${m}m ${s % 60}s`
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('es-CR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Costa_Rica' })
  }

  const estadoIcon = (estado) => {
    if (estado === 'completado') return <CheckCircle2 className="w-4 h-4 text-green-400" />
    if (estado === 'error') return <XCircle className="w-4 h-4 text-red-400" />
    if (estado === 'ejecutando') return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
    return <div className="w-2 h-2 rounded-full bg-gray-600" />
  }

  const estadoColor = (estado) => {
    if (estado === 'completado') return 'text-green-400'
    if (estado === 'error') return 'text-red-400'
    if (estado === 'ejecutando') return 'text-blue-400'
    return 'text-gray-500'
  }

  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
      <div className="flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
    </div>
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <h2 className="font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> Registros Scraper
        </h2>
        <span className="text-xs text-gray-500">Últimas {registros.length} ejecuciones</span>
      </div>

      {registros.length === 0 ? (
        <p className="text-sm text-gray-500 px-5 py-8 text-center">Sin registros de ejecuciones</p>
      ) : (
        <div className="divide-y divide-gray-800">
          {registros.map(reg => {
            const isExpanded = expandedId === reg._id
            return (
              <div key={reg._id} className="transition-colors">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : reg._id)}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-800/30 text-left"
                >
                  {estadoIcon(reg.estado)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{formatDate(reg.inicio)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        reg.estado === 'completado' ? 'bg-green-500/15 text-green-400' :
                        reg.estado === 'error' ? 'bg-red-500/15 text-red-400' :
                        'bg-blue-500/15 text-blue-400'
                      }`}>{reg.estado}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{formatDuration(reg.duracionSegundos)}</span>
                      {reg.licitacionesNuevas > 0 && (
                        <span className="text-xs text-cyan-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {reg.licitacionesNuevas} nuevas
                        </span>
                      )}
                      {reg.licitacionesNuevas === 0 && reg.estado === 'completado' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> 0 nuevas
                        </span>
                      )}
                      {reg.alertas?.total > 0 && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> {reg.alertas.total} alertas → {reg.alertas.detalle?.length || 0} usuarios
                        </span>
                      )}
                      {reg.alertas?.total === 0 && reg.estado === 'completado' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> 0 alertas
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3">
                    {/* Pasos */}
                    <div className="space-y-1.5">
                      {reg.pasos?.map((paso, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                          paso.estado === 'completado' ? 'bg-green-500/5 border border-green-500/10' :
                          paso.estado === 'error' ? 'bg-red-500/5 border border-red-500/10' :
                          paso.estado === 'ejecutando' ? 'bg-blue-500/5 border border-blue-500/10' :
                          'bg-gray-800/30 border border-transparent'
                        }`}>
                          {estadoIcon(paso.estado)}
                          <span className={`font-medium flex-1 ${estadoColor(paso.estado)}`}>{paso.nombre}</span>
                          {paso.duracionSegundos != null && <span className="text-gray-500">{formatDuration(paso.duracionSegundos)}</span>}
                          {paso.detalle && <span className="text-gray-400">{paso.detalle}</span>}
                          {paso.error && <span className="text-red-400 truncate max-w-[200px]">{paso.error}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Detalle de alertas por usuario */}
                    {reg.alertas?.detalle?.length > 0 && (
                      <div className="border border-amber-500/10 rounded-lg overflow-hidden">
                        <div className="px-3 py-2 bg-amber-500/5 text-xs font-medium text-amber-400 flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> Alertas generadas por usuario
                        </div>
                        <div className="divide-y divide-gray-800/50">
                          {reg.alertas.detalle.map((det, i) => (
                            <div key={i} className="px-3 py-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{det.usuario}</span>
                                <span className="text-amber-400">{det.licitacionesCoincidentes} licitaciones</span>
                              </div>
                              <div className="text-gray-500 mt-0.5">{det.email} · {det.alertaNombre}</div>
                              {det.licitaciones?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {det.licitaciones.slice(0, 5).map((lic, j) => (
                                    <span key={j} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{lic}</span>
                                  ))}
                                  {det.licitaciones.length > 5 && (
                                    <span className="px-1.5 py-0.5 text-gray-500 text-xs">+{det.licitaciones.length - 5} más</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {reg.error && (
                      <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                        {reg.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
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

      {/* Registros Scraper */}
      <RegistrosScraper />
    </div>
  )
}
