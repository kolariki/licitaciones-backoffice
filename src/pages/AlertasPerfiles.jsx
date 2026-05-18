import React, { useState, useEffect, useCallback } from 'react'
import { Briefcase, RefreshCw, Send, X, Loader2, MailCheck, ShieldCheck, ClipboardCheck, ExternalLink, Brain, AlertCircle, ChevronDown, ChevronRight, Building2, DollarSign, Calendar, CheckCheck } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function AlertasPerfiles() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [horas, setHoras] = useState(24)
  const [tab, setTab] = useState('enviadas')   // 'enviadas' | 'pendientes'
  const [expanded, setExpanded] = useState(new Set())
  const [acting, setActing] = useState({})

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas/perfiles-dashboard?horas=${horas}`)
      if (!r.ok) {
        if (r.status === 404) throw new Error('Endpoint no disponible — redeploy pendiente')
        throw new Error(`HTTP ${r.status}`)
      }
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      setData(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [horas])

  useEffect(() => { fetchData() }, [fetchData])

  const toggle = (k) => { const n = new Set(expanded); n.has(k) ? n.delete(k) : n.add(k); setExpanded(n) }

  const aprobarEnviar = async (payloadFile, numeroProceso) => {
    const k = `${payloadFile}|${numeroProceso}`
    setActing(p => ({ ...p, [k]: true }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/confirmar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: [{ payloadFile, numeroProceso }] })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(p => ({ ...p, [k]: false })) }
  }

  const rechazar = async (payloadFile, numeroProceso) => {
    if (!window.confirm(`Rechazar ${numeroProceso}?`)) return
    const k = `r_${payloadFile}|${numeroProceso}`
    setActing(p => ({ ...p, [k]: true }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/rechazar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ payloadFile, numeroProceso })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(p => ({ ...p, [k]: false })) }
  }

  const aprobarGrupo = async (payloadFile, lics) => {
    if (!window.confirm(`Enviar ${lics.length} licitaciones de este grupo?`)) return
    const k = `g_${payloadFile}`
    setActing(p => ({ ...p, [k]: true }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/confirmar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: lics.map(l => ({ payloadFile, numeroProceso: l.numeroProceso })) })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(p => ({ ...p, [k]: false })) }
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('es-CR', { dateStyle:'short', timeStyle:'short' }) : '–'
  const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-CR') : '–'

  const stats = data?.stats || {}
  const enviadas = data?.enviadas || []
  const pendientes = data?.pendientes || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-7 h-7 text-blue-500" /> Alertas de Perfiles</h1>
          <p className="text-gray-400 text-sm mt-1">
            Dashboard exclusivo de alertas con perfilId (empresas con perfiles configurados).
            Muestra qué se envió automáticamente y qué queda pendiente después de cada corrida.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg border border-gray-700 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <input type="number" min={1} max={168} value={horas}
              onChange={e => setHoras(Math.min(168, Math.max(1, parseInt(e.target.value) || 24)))}
              className="w-14 bg-transparent text-xs text-white text-center outline-none" />
            <span className="text-xs text-gray-400">hs</span>
          </div>
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refrescar
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Auto-enviadas" value={stats.enviadasLicitaciones ?? 0} subtitle={`${stats.enviadasTotal ?? 0} batches`} icon={<MailCheck className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Pendientes aprobadas" value={stats.pendientesAprobadas ?? 0} subtitle="esperan tu OK" icon={<ShieldCheck className="w-4 h-4" />} color="text-violet-400" />
        <StatCard label="Rechazadas por agente" value={stats.pendientesRechazadas ?? 0} subtitle="revisión manual" icon={<X className="w-4 h-4" />} color="text-red-400" />
        <StatCard label="Sin descripción" value={stats.pendientesSinAgente ?? 0} subtitle="sin agente" icon={<ClipboardCheck className="w-4 h-4" />} color="text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800">
        <button onClick={() => setTab('enviadas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'enviadas' ? 'border-emerald-500 text-emerald-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
          <MailCheck className="w-4 h-4" /> Enviadas automáticas
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === 'enviadas' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'}`}>{stats.enviadasLicitaciones ?? 0}</span>
        </button>
        <button onClick={() => setTab('pendientes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'pendientes' ? 'border-amber-500 text-amber-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
          <ClipboardCheck className="w-4 h-4" /> Pendientes
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === 'pendientes' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-400'}`}>{stats.pendientesLicitaciones ?? 0}</span>
        </button>
      </div>

      {/* TAB ENVIADAS */}
      {tab === 'enviadas' && (
        <div className="space-y-3">
          {enviadas.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-500">
              Sin envíos automáticos de perfiles en las últimas {horas}h.
            </div>
          ) : enviadas.map(e => {
            const k = 'e_' + e._id
            const open = expanded.has(k)
            return (
              <div key={e._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button onClick={() => toggle(k)} className="w-full px-4 py-3 hover:bg-gray-800/30 text-left flex items-center gap-3">
                  {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  <MailCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{e.emailUsuario}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-400">{e.nombreAlerta}</span>
                      {e.perfilNombre && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border border-gray-300 bg-white text-blue-900">PERFIL: {e.perfilNombre}</span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{e.totalLicitaciones} lics</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">via: {e.via}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{fmt(e.fechaEnvio)}</div>
                  </div>
                </button>
                {open && (
                  <div className="px-10 pb-3 space-y-2 bg-gray-950/40">
                    {e.licitaciones.map((l, i) => (
                      <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-xs">
                        <div className="flex items-start gap-2 mb-1">
                          <code className="font-mono text-cyan-400">{l.numeroProceso}</code>
                          {l.agenteDecision && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              <Brain className="w-3 h-3 inline" /> {l.agenteDecision.confianza}%
                            </span>
                          )}
                        </div>
                        <div className="text-white font-medium leading-snug">{l.titulo}</div>
                        <div className="text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0.5">
                          <div className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {l.entidadEmisora || '–'}</div>
                          <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {l.montoTexto || '–'}</div>
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtFecha(l.fechaCierre)}</div>
                        </div>
                        {l.urlDetalle && (
                          <a href={l.urlDetalle} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-1">
                            <ExternalLink className="w-3 h-3" /> SICOP
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* TAB PENDIENTES */}
      {tab === 'pendientes' && (
        <div className="space-y-3">
          {pendientes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-500">
              Sin licitaciones pendientes para alertas con perfilId.
            </div>
          ) : pendientes.map(g => {
            const k = 'p_' + g.payloadFile
            const open = expanded.has(k)
            const aprobadas = g.licitaciones.filter(l => l.estado === 'aprobada-pendiente')
            return (
              <div key={g.payloadFile} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 hover:bg-gray-800/30 flex items-center gap-3">
                  <button onClick={() => toggle(k)} className="text-gray-500 hover:text-white">
                    {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <ClipboardCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{g.usuario?.email}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-400">{g.alerta?.nombre}</span>
                      {g.alerta?.perfilNombre && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border border-gray-300 bg-white text-blue-900">PERFIL: {g.alerta.perfilNombre}</span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">{g.licitaciones.length} lic</span>
                      {aprobadas.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">{aprobadas.length} pre-aprobadas</span>
                      )}
                    </div>
                  </div>
                  {aprobadas.length > 0 && (
                    <button onClick={() => aprobarGrupo(g.payloadFile, aprobadas)} disabled={acting['g_'+g.payloadFile]}
                      className="px-2 py-1 rounded text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50">
                      {acting['g_'+g.payloadFile] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Enviar {aprobadas.length}
                    </button>
                  )}
                </div>
                {open && (
                  <div className="px-10 pb-3 space-y-2 bg-gray-950/40">
                    {g.licitaciones.map(l => {
                      const lk = g.payloadFile + '|' + l.numeroProceso
                      const dec = l.agenteDecision
                      return (
                        <div key={l.numeroProceso} className={`bg-gray-900/60 border rounded-lg p-3 text-xs ${
                          l.estado === 'aprobada-pendiente' ? 'border-violet-500/30'
                          : l.estado === 'rechazada-agente' ? 'border-red-500/30'
                          : 'border-amber-500/20'
                        }`}>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex-1 min-w-0">
                              <code className="font-mono text-cyan-400">{l.numeroProceso}</code>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                l.estado === 'aprobada-pendiente' ? 'bg-violet-500/20 text-violet-300'
                                : l.estado === 'rechazada-agente' ? 'bg-red-500/20 text-red-300'
                                : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {l.estado === 'aprobada-pendiente' ? '🛡️ Pre-aprobada'
                                  : l.estado === 'rechazada-agente' ? '🚫 Rechazada agente'
                                  : '📋 Sin agente'}
                              </span>
                              {dec && (
                                <span className="ml-2 text-[10px] text-gray-400">
                                  {dec.confianza}%
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {l.estado === 'aprobada-pendiente' && (
                                <button onClick={() => aprobarEnviar(g.payloadFile, l.numeroProceso)} disabled={acting[lk]}
                                  className="px-2 py-1 rounded text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50">
                                  {acting[lk] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                  Enviar
                                </button>
                              )}
                              <button onClick={() => rechazar(g.payloadFile, l.numeroProceso)} disabled={acting['r_'+lk]}
                                className="px-2 py-1 rounded text-[11px] font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1 disabled:opacity-50">
                                <X className="w-3 h-3" /> Descartar
                              </button>
                            </div>
                          </div>
                          <div className="text-white font-medium leading-snug">{l.titulo}</div>
                          <div className="text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0.5">
                            <div className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {l.entidadEmisora || '–'}</div>
                            <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {l.montoTexto || '–'}</div>
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtFecha(l.fechaCierre)}</div>
                          </div>
                          {dec?.razon && (
                            <div className={`mt-2 text-[11px] rounded p-1.5 ${
                              l.estado === 'aprobada-pendiente' ? 'bg-violet-500/5 border border-violet-500/20 text-violet-200'
                              : 'bg-red-500/5 border border-red-500/20 text-red-200'
                            }`}>
                              🧠 <strong>Agente:</strong> {dec.razon}
                            </div>
                          )}
                          {!dec && l.razonCoincidencia && (
                            <div className="mt-1 text-[11px] text-gray-500">{l.razonCoincidencia}</div>
                          )}
                          {l.urlDetalle && (
                            <a href={l.urlDetalle} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" /> Ver SICOP
                            </a>
                          )}
                        </div>
                      )
                    })}
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

function StatCard({ label, value, subtitle, icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className={`flex items-center gap-1.5 text-xs ${color} mb-1`}>
        {icon} <span className="text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
