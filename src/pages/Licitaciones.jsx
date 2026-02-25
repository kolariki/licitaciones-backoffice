import React, { useState, useEffect } from 'react'
import { FileText, Search, ExternalLink, Calendar, Building2, DollarSign, Tag } from 'lucide-react'
import { API_URL } from '../config'

export default function Licitaciones() {
  const [licitaciones, setLicitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)

  const fetchData = (p = 1, q = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (q) params.set('search', q)
    fetch(`${API_URL}/api/licitaciones-costa-rica/licitaciones?${params}`)
      .then(r => r.json())
      .then(d => {
        setLicitaciones(d.licitaciones || d.data || [])
        setTotal(d.total || d.pagination?.total || 0)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
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
            placeholder="Buscar licitaciones..."
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
            {licitaciones.map((l, i) => (
              <div key={l._id || i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-400 mb-1">{l.numeroProceso || l.numero || l.id_proceso || 'Sin número'}</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{l.descripcion || l.titulo || l.objeto || 'Sin descripción'}</p>
                  </div>
                  {l.estado && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 whitespace-nowrap">{l.estado}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                  {(l.entidadContratante || l.institucion) && (
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {l.entidadContratante || l.institucion}</span>
                  )}
                  {(l.fechaPublicacion || l.fecha_publicacion) && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(l.fechaPublicacion || l.fecha_publicacion).toLocaleDateString('es')}</span>
                  )}
                  {l.montoEstimado && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {typeof l.montoEstimado === 'number' ? l.montoEstimado.toLocaleString('es', { style: 'currency', currency: 'CRC' }) : l.montoEstimado}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {licitaciones.length === 0 && <p className="text-center text-gray-500 py-12">No se encontraron licitaciones</p>}

          {total > 20 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-30">Anterior</button>
              <span className="text-sm text-gray-400">Página {page} de {Math.ceil(total / 20)}</span>
              <button onClick={() => changePage(page + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-30">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
