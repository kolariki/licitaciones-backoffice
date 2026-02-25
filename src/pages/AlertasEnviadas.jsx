import React, { useState, useEffect } from 'react'
import { Mail, Bell, Search, ChevronDown, ChevronUp, Clock, FileText, Building2, User, Filter } from 'lucide-react'
import { API_URL } from '../config'

export default function AlertasEnviadas() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUsers, setExpandedUsers] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/historial-alertas`)
      .then(r => r.json())
      .then(d => {
        setHistorial(d.historial || [])
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const toggleUser = (email) => {
    setExpandedUsers(prev => ({ ...prev, [email]: !prev[email] }))
  }

  // Group by user email
  const porUsuario = {}
  historial.forEach(h => {
    const email = h.emailUsuario || 'Sin email'
    if (!porUsuario[email]) porUsuario[email] = []
    porUsuario[email].push(h)
  })

  // Filter
  const filteredEmails = Object.keys(porUsuario).filter(email => {
    if (!search) return true
    const q = search.toLowerCase()
    if (email.toLowerCase().includes(q)) return true
    return porUsuario[email].some(h =>
      (h.numeroProceso || '').toLowerCase().includes(q) ||
      (h.tituloLicitacion || '').toLowerCase().includes(q) ||
      (h.nombreAlerta || '').toLowerCase().includes(q)
    )
  }).sort((a, b) => {
    const lastA = Math.max(...porUsuario[a].map(h => new Date(h.fechaEnvio || 0).getTime()))
    const lastB = Math.max(...porUsuario[b].map(h => new Date(h.fechaEnvio || 0).getTime()))
    return lastB - lastA
  })

  const totalEnvios = historial.length
  const totalUsuarios = Object.keys(porUsuario).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas Enviadas</h1>
        <p className="text-gray-400 text-sm mt-1">
          {totalEnvios > 0 ? `${totalEnvios} alertas enviadas a ${totalUsuarios} usuarios` : 'Historial de alertas enviadas por email'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Total envíos</p>
          <p className="text-2xl font-bold">{totalEnvios}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Usuarios alcanzados</p>
          <p className="text-2xl font-bold">{totalUsuarios}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Licitaciones alertadas</p>
          <p className="text-2xl font-bold">{new Set(historial.map(h => h.numeroProceso)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por email, número de proceso, título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map(email => {
            const envios = porUsuario[email]
            const isExpanded = expandedUsers[email]
            const lastDate = envios.reduce((max, h) => {
              const d = new Date(h.fechaEnvio || 0)
              return d > max ? d : max
            }, new Date(0))

            return (
              <div key={email} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleUser(email)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{email}</p>
                    <p className="text-xs text-gray-500">
                      {envios.length} alerta{envios.length !== 1 ? 's' : ''} enviada{envios.length !== 1 ? 's' : ''} · Última: {lastDate.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 shrink-0">
                    {envios.length}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                    {envios.sort((a, b) => new Date(b.fechaEnvio || 0) - new Date(a.fechaEnvio || 0)).map((h, i) => (
                      <div key={h._id || i} className="px-5 py-3 hover:bg-gray-800/20 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-blue-400">{h.numeroProceso || 'Sin número'}</p>
                            <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">{h.tituloLicitacion || ''}</p>
                            {h.entidadEmisora && (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Building2 className="w-3 h-3" /> {h.entidadEmisora}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {h.fechaEnvio && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(h.fechaEnvio).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {h.nombreAlerta && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded flex items-center gap-1">
                              <Bell className="w-3 h-3" /> {h.nombreAlerta}
                            </span>
                          )}
                          {h.razonCoincidencia && (
                            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">{h.razonCoincidencia}</span>
                          )}
                          {h.tipoCoincidencia && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 rounded">{h.tipoCoincidencia}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filteredEmails.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{search ? 'No se encontraron resultados' : 'No hay alertas enviadas aún'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
