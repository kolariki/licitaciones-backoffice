import React, { useState, useEffect } from 'react'
import { FileText, Search, ExternalLink, Calendar, Building2, DollarSign, Tag, Bell, ChevronDown, ChevronUp, Mail, Clock } from 'lucide-react'
import { API_URL } from '../config'

export default function Licitaciones() {
  const [licitaciones, setLicitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)
  const [alertasEnviadas, setAlertasEnviadas] = useState({})
  const [expandedAlerts, setExpandedAlerts] = useState({})

  const fetchAlertHistory = async (lics) => {
    if (!lics.length) return
    try {
      const numeros = lics.map(l => l.numeroProceso).filter(Boolean)
      if (!numeros.length) return
      const res = await fetch(`${API_URL}/api/dashboard/licitaciones/alertas-enviadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numerosProceso: numeros })
      })
      const d = await res.json()
      if (d.success) setAlertasEnviadas(d.alertas || {})
    } catch {}
  }

  const fetchData = async (p = 1, q = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (q) params.set('search', q)
    try {
      const res = await fetch(`${API_URL}/api/v2/licitaciones?${params}`)
      const d = await res.json()
      const lics = d.licitaciones || []
      setLicitaciones(lics)
      setTotal(d.paginacion?.total || 0)
      setLoading(false)
      fetchAlertHistory(lics)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(1) }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData(1, search)
  }

  const changePage = (p) => {
    setPage(p)
    fetchData(p, search)
  }

  const toggleAlertExpand = (np) => {
    setExpandedAlerts(prev => ({ ...prev, [np]: !prev[np] }))
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Licitaciones</h1>
        <p className="text-gray-400 text-sm mt-1">{total > 0 ? `${total.toLocaleString()} licitaciones en el sistema` : 'Costa Rica - SICOP'}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por título, número de proceso, entidad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
          Buscar
        </button>
      </form>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="space-y-3">
            {licitaciones.map((l, i) => {
              const np = l.numeroProceso
              const envios = alertasEnviadas[np] || []
              const isExpanded = expandedAlerts[np]

              return (
                <div key={l._id || i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-400 mb-1">{np || 'Sin número'}</p>
                      <p className="text-sm text-gray-200 line-clamp-2">{l.titulo || l.objeto || l.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {envios.length > 0 && (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 whitespace-nowrap">
                          <Bell className="w-3 h-3" /> {envios.length} envío{envios.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {l.estado && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 whitespace-nowrap">{l.estado}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    {l.entidadEmisora && (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {l.entidadEmisora}</span>
                    )}
                    {l.tipoProceso && (
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {l.tipoProceso}</span>
                    )}
                    {l.fechaCierre && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Cierre: {new Date(l.fechaCierre).toLocaleDateString('es')}</span>
                    )}
                    {(l.montoTexto || l.monto) && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {l.montoTexto || l.monto}</span>
                    )}
                  </div>

                  {/* Alert history */}
                  {envios.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => toggleAlertExpand(np)}
                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        Enviada como alerta a {envios.length} usuario{envios.length !== 1 ? 's' : ''}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5">
                          {envios.map((e, j) => (
                            <div key={j} className="flex items-center gap-3 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2">
                              <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                              <span className="text-gray-300 font-medium">{e.email}</span>
                              {e.alerta && <span className="text-gray-500">vía "{e.alerta}"</span>}
                              {e.razon && <span className="text-gray-600 hidden md:inline">({e.razon})</span>}
                              {e.fecha && (
                                <span className="ml-auto flex items-center gap-1 text-gray-600 shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {new Date(e.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {licitaciones.length === 0 && <p className="text-center text-gray-500 py-12">No se encontraron licitaciones</p>}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm disabled:opacity-30 transition-colors">Anterior</button>
              <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
              <button onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm disabled:opacity-30 transition-colors">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
