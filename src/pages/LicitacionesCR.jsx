import React, { useState, useEffect } from 'react'
import { Database, Search, ChevronDown, ChevronUp, ExternalLink, Calendar, Building2, DollarSign, Tag, Package, FileText, Shield, Clock, MapPin, Hash, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { API_URL } from '../config'

export default function LicitacionesCR() {
  const [licitaciones, setLicitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const limit = 25

  const fetchData = async (p = 1, q = '', estado = '', tipo = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: p, limit })
      if (q) params.set('search', q)
      if (estado) params.set('estado', estado)
      if (tipo) params.set('tipoProceso', tipo)
      const res = await fetch(`${API_URL}/api/v2/licitaciones?${params}`)
      const d = await res.json()
      setLicitaciones(d.licitaciones || [])
      const pag = d.paginacion || {}
      setTotal(pag.total || 0)
      setTotalPages(pag.totalPaginas || 1)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData(page, search, estadoFilter, tipoFilter) }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData(1, search, estadoFilter, tipoFilter)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatMonto = (m, moneda) => {
    if (!m && m !== 0) return '—'
    const n = typeof m === 'number' ? m : parseFloat(m)
    if (isNaN(n)) return String(m)
    return n.toLocaleString('es-CR', { minimumFractionDigits: 2 }) + (moneda ? ` ${moneda}` : '')
  }

  const estadoColor = (estado) => {
    if (!estado) return 'bg-gray-700 text-gray-300'
    const e = estado.toLowerCase()
    if (e.includes('firme') || e.includes('adjud')) return 'bg-green-900/50 text-green-400 border border-green-500/30'
    if (e.includes('recep') || e.includes('apert')) return 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
    if (e.includes('desierto') || e.includes('infruct')) return 'bg-red-900/50 text-red-400 border border-red-500/30'
    if (e.includes('ejecuc')) return 'bg-purple-900/50 text-purple-400 border border-purple-500/30'
    return 'bg-gray-800 text-gray-300 border border-gray-600'
  }

  const renderValue = (val, depth = 0) => {
    if (val === null || val === undefined || val === '') return <span className="text-gray-600 italic">—</span>
    if (typeof val === 'boolean') return <span className={val ? 'text-green-400' : 'text-red-400'}>{val ? 'Sí' : 'No'}</span>
    if (typeof val === 'number') return <span className="text-blue-400">{val.toLocaleString('es-CR')}</span>
    if (typeof val === 'string') {
      if (val.match(/^\d{4}-\d{2}-\d{2}T/)) return <span className="text-yellow-400">{formatDate(val)}</span>
      if (val.startsWith('http')) return <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{val}</a>
      return <span className="text-gray-200 break-words">{val}</span>
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-gray-600 italic">[]</span>
      return (
        <div className="space-y-1 ml-2">
          {val.map((item, i) => (
            <div key={i} className="border-l-2 border-gray-700 pl-3 py-1">
              {typeof item === 'object' ? renderObject(item, depth + 1) : renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      )
    }
    if (typeof val === 'object') return renderObject(val, depth + 1)
    return <span>{String(val)}</span>
  }

  const renderObject = (obj, depth = 0) => {
    if (!obj) return null
    const entries = Object.entries(obj).filter(([k]) => k !== '_id' && !k.startsWith('__'))
    if (entries.length === 0) return <span className="text-gray-600 italic">{'{}'}</span>
    return (
      <div className={`space-y-1 ${depth > 0 ? 'ml-2' : ''}`}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="text-gray-500 text-xs font-mono shrink-0 min-w-[140px]">{key}:</span>
            <div className="flex-1 text-sm">{renderValue(val, depth)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Database size={28} className="text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Licitaciones CR — Base de Datos</h2>
          <p className="text-sm text-gray-400">{total.toLocaleString()} registros en licitacionesCR</p>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, título, entidad, objeto..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); fetchData(1, search, e.target.value, tipoFilter) }}
          className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
          <option value="">Todos los estados</option>
          <option value="Recepción de Ofertas">Recepción de Ofertas</option>
          <option value="Acto Final en Firme">Acto Final en Firme</option>
          <option value="Adjudicado">Adjudicado</option>
          <option value="En Ejecución">En Ejecución</option>
          <option value="Desierto">Desierto</option>
          <option value="Infructuoso">Infructuoso</option>
        </select>
        <button type="submit" className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors">
          Buscar
        </button>
        {(search || estadoFilter || tipoFilter) && (
          <button type="button" onClick={() => { setSearch(''); setEstadoFilter(''); setTipoFilter(''); setPage(1); fetchData(1, '', '', '') }}
            className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </form>

      {error && <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Número</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Título</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Entidad</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Tipo</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Monto</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Publicación</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {licitaciones.map((lic, i) => (
                    <React.Fragment key={lic._id || i}>
                      <tr
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        className={`border-b border-gray-800/50 cursor-pointer transition-colors ${expanded === i ? 'bg-cyan-900/10' : 'hover:bg-gray-800/50'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {expanded === i ? <ChevronUp size={14} className="text-cyan-400" /> : <ChevronDown size={14} className="text-gray-500" />}
                            <span className="text-cyan-400 font-mono text-xs">{lic.numeroProceso}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white max-w-[300px] truncate">{lic.titulo}</td>
                        <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{lic.entidadEmisora}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor(lic.estado)}`}>{lic.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{lic.tipoProceso}</td>
                        <td className="px-4 py-3 text-right text-green-400 font-mono text-xs">{formatMonto(lic.monto, lic.moneda)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(lic.fechaPublicacion)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(lic.fechaCierre)}</td>
                      </tr>
                      {expanded === i && (
                        <tr>
                          <td colSpan={8} className="px-0 py-0">
                            <div className="bg-gray-900/80 border-t border-b border-cyan-500/20 p-6">
                              {/* Header */}
                              <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <FileText size={18} className="text-cyan-400" /> Datos Generales
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex gap-2"><Hash size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Número:</span><span className="text-cyan-400 font-mono">{lic.numeroProceso}</span></div>
                                    {lic.numeroExpediente && <div className="flex gap-2"><Hash size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Expediente:</span><span className="text-gray-200">{lic.numeroExpediente}</span></div>}
                                    <div className="flex gap-2"><Building2 size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Entidad:</span><span className="text-gray-200">{lic.entidadEmisora}</span></div>
                                    {lic.unidadOperativa && <div className="flex gap-2"><Building2 size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Unidad:</span><span className="text-gray-200">{lic.unidadOperativa}</span></div>}
                                    {lic.provincia && <div className="flex gap-2"><MapPin size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Provincia:</span><span className="text-gray-200">{lic.provincia}</span></div>}
                                    <div className="flex gap-2"><Tag size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Tipo:</span><span className="text-gray-200">{lic.tipoProceso}</span></div>
                                    {lic.modalidad && <div className="flex gap-2"><Tag size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Modalidad:</span><span className="text-gray-200">{lic.modalidad}</span></div>}
                                    {lic.procedimientoSeleccion && <div className="flex gap-2"><Tag size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Procedimiento:</span><span className="text-gray-200">{lic.procedimientoSeleccion}</span></div>}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Calendar size={18} className="text-cyan-400" /> Fechas y Montos
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex gap-2"><Calendar size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Publicación:</span><span className="text-yellow-400">{formatDate(lic.fechaPublicacion)}</span></div>
                                    <div className="flex gap-2"><Calendar size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Cierre:</span><span className="text-yellow-400">{formatDate(lic.fechaCierre)}</span></div>
                                    {lic.fechaApertura && <div className="flex gap-2"><Calendar size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Apertura:</span><span className="text-yellow-400">{formatDate(lic.fechaApertura)}</span></div>}
                                    {lic.fechaInicioContrato && <div className="flex gap-2"><Calendar size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Inicio Contrato:</span><span className="text-yellow-400">{formatDate(lic.fechaInicioContrato)}</span></div>}
                                    <div className="flex gap-2"><DollarSign size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Monto:</span><span className="text-green-400 font-bold">{formatMonto(lic.monto, lic.moneda)}</span></div>
                                    {lic.presupuestoOficial && <div className="flex gap-2"><DollarSign size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Presupuesto Oficial:</span><span className="text-green-400">{formatMonto(lic.presupuestoOficial, lic.moneda)}</span></div>}
                                    {lic.duracionContrato && <div className="flex gap-2"><Clock size={14} className="text-gray-500 mt-0.5 shrink-0" /><span className="text-gray-500 w-36 shrink-0">Duración:</span><span className="text-gray-200">{lic.duracionContrato}</span></div>}
                                  </div>
                                </div>
                              </div>

                              {/* Objeto */}
                              {lic.objeto && (
                                <div className="mb-6">
                                  <h3 className="text-sm font-bold text-gray-400 mb-2">OBJETO</h3>
                                  <p className="text-gray-200 text-sm bg-gray-800/50 rounded-lg p-3">{lic.objeto}</p>
                                </div>
                              )}

                              {/* Descripción */}
                              {lic.descripcion && lic.descripcion !== lic.objeto && (
                                <div className="mb-6">
                                  <h3 className="text-sm font-bold text-gray-400 mb-2">DESCRIPCIÓN</h3>
                                  <p className="text-gray-200 text-sm bg-gray-800/50 rounded-lg p-3 whitespace-pre-wrap">{lic.descripcion}</p>
                                </div>
                              )}

                              {/* Garantías */}
                              {lic.garantias && Object.keys(lic.garantias).length > 0 && (
                                <div className="mb-6">
                                  <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2"><Shield size={14} /> GARANTÍAS</h3>
                                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                                    {Object.entries(lic.garantias).filter(([k]) => k !== '_id').map(([key, val]) => (
                                      <div key={key} className="text-sm">
                                        <span className="text-cyan-400 font-medium capitalize">{key}:</span>{' '}
                                        <span className="text-gray-200">{val}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Productos */}
                              {lic.productos && lic.productos.length > 0 && (
                                <div className="mb-6">
                                  <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2"><Package size={14} /> PRODUCTOS ({lic.productos.length})</h3>
                                  <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-gray-700">
                                          <th className="text-left px-3 py-2 text-gray-500">#</th>
                                          <th className="text-left px-3 py-2 text-gray-500">Descripción</th>
                                          <th className="text-left px-3 py-2 text-gray-500">Cantidad</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {lic.productos.slice(0, 50).map((p, pi) => (
                                          <tr key={pi} className="border-b border-gray-700/50">
                                            <td className="px-3 py-2 text-gray-500">{p.numero || pi + 1}</td>
                                            <td className="px-3 py-2 text-gray-200">{p.descripcion}</td>
                                            <td className="px-3 py-2 text-blue-400 whitespace-nowrap">{p.cantidad}</td>
                                          </tr>
                                        ))}
                                        {lic.productos.length > 50 && (
                                          <tr><td colSpan={3} className="px-3 py-2 text-gray-500 text-center">... y {lic.productos.length - 50} productos más</td></tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Datos Específicos */}
                              {lic.datosEspecificos && Object.keys(lic.datosEspecificos).length > 0 && (
                                <div className="mb-6">
                                  <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2"><Database size={14} /> DATOS ESPECÍFICOS</h3>
                                  <div className="bg-gray-800/50 rounded-lg p-4 max-h-[600px] overflow-y-auto text-xs">
                                    {renderObject(lic.datosEspecificos)}
                                  </div>
                                </div>
                              )}

                              {/* Links */}
                              <div className="flex gap-3 flex-wrap">
                                {lic.urlDetalle && (
                                  <a href={lic.urlDetalle} target="_blank" rel="noopener noreferrer"
                                    className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-600/30 transition-colors flex items-center gap-2">
                                    <ExternalLink size={14} /> Ver en SICOP
                                  </a>
                                )}
                                {lic.urlPliego && (
                                  <a href={lic.urlPliego} target="_blank" rel="noopener noreferrer"
                                    className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-600/30 transition-colors flex items-center gap-2">
                                    <FileText size={14} /> Ver Pliego
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-400">
              Mostrando {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-300">Pág {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
