import React, { useState, useEffect } from 'react'
import { Mail, Bell, Search, ChevronDown, ChevronUp, Clock, FileText, User, BarChart3, Loader2 } from 'lucide-react'
import { API_URL } from '../config'

function UserDetail({ usuario, expanded, onToggle }) {
  const [semanas, setSemanas] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (expanded && !loaded) {
      setLoading(true)
      fetch(`${API_URL}/api/estadisticas-emails/usuario/${usuario.usuarioId}`)
        .then(r => r.json())
        .then(d => {
          setSemanas(d.data || [])
          setSelectedWeek(0)
          setLoaded(true)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [expanded, loaded, usuario.usuarioId])

  const currentWeek = semanas[selectedWeek]
  const u = currentWeek?.usuario || {}
  const allAlertas = [
    ...(u.porTipo?.palabra_clave || []).map(a => ({ ...a, tipo: 'palabra_clave' })),
    ...(u.porTipo?.codigo || []).map(a => ({ ...a, tipo: 'codigo' })),
    ...(u.porTipo?.ambos || []).map(a => ({ ...a, tipo: 'ambos' }))
  ].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
          {(usuario.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{usuario.nombre || usuario.email}</p>
          {usuario.nombre && <p className="text-xs text-gray-500 truncate">{usuario.email}</p>}
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 shrink-0">
          {usuario.totalAlertas} alerta{usuario.totalAlertas !== 1 ? 's' : ''}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Week selector */}
              {semanas.length > 1 && (
                <div className="px-5 py-3 border-b border-gray-800 flex gap-2 overflow-x-auto">
                  {semanas.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedWeek(i)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedWeek === i
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {fmtDate(s.periodo?.desde)} - {fmtDate(s.periodo?.hasta)}
                    </button>
                  ))}
                </div>
              )}

              {/* Week stats summary */}
              {currentWeek && (
                <div className="px-5 py-2 border-b border-gray-800/50 flex items-center gap-4 text-xs text-gray-500">
                  <span>{currentWeek.periodo?.descripcion}</span>
                  <span>·</span>
                  <span>{u.totalAlertas || 0} alertas esta semana</span>
                </div>
              )}

              {/* Alerts list */}
              <div className="divide-y divide-gray-800/50">
                {allAlertas.length === 0 && (
                  <p className="px-5 py-6 text-sm text-gray-500 text-center">Sin alertas en este período</p>
                )}
                {allAlertas.map((a, i) => (
                  <div key={a._id || i} className="px-5 py-3 hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-400">{a.numeroProceso || 'Sin número'}</p>
                        {a.razon && <p className="text-xs text-gray-400 mt-0.5">{a.razon}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          a.tipo === 'codigo' ? 'bg-green-500/15 text-green-400' :
                          a.tipo === 'ambos' ? 'bg-purple-500/15 text-purple-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {a.tipo === 'palabra_clave' ? 'palabra clave' : a.tipo}
                        </span>
                        {a.fecha && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fmtDate(a.fecha)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function AlertasEnviadas() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/estadisticas-emails`)
      .then(r => r.json())
      .then(d => { setEstadisticas(d.data || null); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const usuarios = estadisticas?.usuarios || []
  const stats = estadisticas?.estadisticas || {}
  const periodo = estadisticas?.periodo || {}

  const filteredUsers = usuarios.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.email || '').toLowerCase().includes(q) ||
      (u.nombre || '').toLowerCase().includes(q)
  }).sort((a, b) => (b.totalAlertas || 0) - (a.totalAlertas || 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas Enviadas</h1>
        <p className="text-gray-400 text-sm mt-1">
          {periodo.descripcion || 'Estadísticas de alertas enviadas por email'}
        </p>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Total notificaciones</p>
              <p className="text-2xl font-bold">{stats.totalNotificaciones || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Usuarios alcanzados</p>
              <p className="text-2xl font-bold">{stats.totalUsuarios || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Por palabra clave</p>
              <p className="text-2xl font-bold">{stats.porTipoCoincidencia?.palabra_clave || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Por código</p>
              <p className="text-2xl font-bold">{stats.porTipoCoincidencia?.codigo || 0}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Users list */}
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <UserDetail
                key={u.usuarioId}
                usuario={u}
                expanded={expandedUser === u.usuarioId}
                onToggle={() => setExpandedUser(expandedUser === u.usuarioId ? null : u.usuarioId)}
              />
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{search ? 'No se encontraron resultados' : 'No hay alertas enviadas'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
