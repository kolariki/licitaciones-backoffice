import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, RefreshCw, Send, X, CheckCheck, Loader2, AlertCircle, ExternalLink, FileText, ChevronDown, ChevronRight, User, Brain } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function AprobadasPendientes() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [acting, setActing] = useState(null) // {file, np} key for in-flight action
  const [expanded, setExpanded] = useState(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes`)
      if (!r.ok) {
        if (r.status === 404) throw new Error('Endpoint /api/aprobadas-pendientes no disponible — redeploy pendiente')
        throw new Error(`HTTP ${r.status}`)
      }
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error('Respuesta no JSON')
      const d = await r.json()
      if (!d.success) throw new Error(d.error || '?')
      setData(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const enviarUna = async (g, lic) => {
    const key = g.payloadFile + '|' + lic.numeroProceso
    setActing(key)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/confirmar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: [{ payloadFile: g.payloadFile, numeroProceso: lic.numeroProceso }] })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(null) }
  }

  const rechazar = async (g, lic) => {
    if (!window.confirm(`Rechazar ${lic.numeroProceso}? Se elimina del payload sin enviar.`)) return
    const key = g.payloadFile + '|' + lic.numeroProceso
    setActing(key)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/rechazar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ payloadFile: g.payloadFile, numeroProceso: lic.numeroProceso })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(null) }
  }

  const enviarGrupo = async (g) => {
    if (!window.confirm(`Confirmar y enviar las ${g.licitaciones.length} licitaciones de "${g.alerta?.nombre}" al user ${g.usuario?.email}?`)) return
    setActing('grupo|' + g.payloadFile)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/confirmar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: g.licitaciones.map(l => ({ payloadFile: g.payloadFile, numeroProceso: l.numeroProceso })) })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(null) }
  }

  const enviarTodas = async () => {
    if (!window.confirm(`Enviar TODAS las ${data?.totalLicitaciones} licitaciones pre-aprobadas? Esto manda emails reales a ${data?.porUsuario?.length} usuarios.`)) return
    setActing('all')
    try {
      const r = await fetch(`${SCRAPER_URL}/api/aprobadas-pendientes/confirmar`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ items: 'all' })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      alert(`Enviadas: ${d.enviados}, fallidas: ${d.fallados}`)
      fetchData()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActing(null) }
  }

  const toggle = (k) => {
    const n = new Set(expanded); n.has(k) ? n.delete(k) : n.add(k); setExpanded(n)
  }

  const grupos = data?.grupos || []
  const porEmail = {}
  for (const g of grupos) {
    const eml = g.usuario?.email || 'desconocido'
    if (!porEmail[eml]) porEmail[eml] = []
    porEmail[eml].push(g)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-violet-500" /> Aprobadas Pendientes (Modo Revisión)</h1>
          <p className="text-gray-400 text-sm mt-1">
            Licitaciones que el agente LLM <strong>aprobó pero NO se enviaron</strong>. El sistema corre en modo
            revisión hasta que confirmes que el filtro está fino. Acá decidís manualmente qué se envía y qué se descarta.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refrescar
          </button>
          {grupos.length > 0 && (
            <button onClick={enviarTodas} disabled={acting === 'all'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {acting === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Enviar todas ({data?.totalLicitaciones})
            </button>
          )}
        </div>
      </div>

      {/* Banner explicativo */}
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 text-sm text-violet-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong className="block mb-1">¿Cómo funciona el Modo Revisión?</strong>
            Cuando corre la cadena de alertas (cron 13/19 ART), el agente LLM evalúa cada match. Las que aprueba
            <strong> NO se mandan automáticamente</strong>, quedan acá esperando tu OK. Cuando estés conforme con la
            calidad del filtro, podés desactivar el modo revisión (env var <code className="bg-black/30 px-1 rounded">MODO_REVISION_AUTO_ENVIO=false</code>)
            y a partir de ahí el agente despacha solo.
          </div>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Grupos (alerta × user)" value={grupos.length} icon={<FileText className="w-4 h-4" />} color="text-blue-400" />
        <StatCard label="Licitaciones esperando" value={data?.totalLicitaciones ?? 0} icon={<ShieldCheck className="w-4 h-4" />} color="text-violet-400" />
        <StatCard label="Usuarios involucrados" value={data?.porUsuario?.length ?? 0} icon={<User className="w-4 h-4" />} color="text-cyan-400" />
      </div>

      {grupos.length === 0 && !loading && !error ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-sm text-gray-500">
          🎉 No hay licitaciones pre-aprobadas pendientes. Cuando la cadena de alertas corra, las que el agente apruebe aparecerán acá.
        </div>
      ) : Object.entries(porEmail).map(([eml, lista]) => {
        const totalEml = lista.reduce((s, g) => s + g.licitaciones.length, 0)
        return (
          <div key={eml} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">{eml}</h2>
                <p className="text-[11px] text-gray-500">{lista.length} alerta(s) · {totalEml} licitación(es) pre-aprobadas</p>
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {lista.map(g => {
                const k = 'g_' + g.payloadFile
                const open = expanded.has(k)
                return (
                  <div key={g.payloadFile}>
                    <div className="px-4 py-3 hover:bg-gray-800/30 flex items-center gap-3">
                      <button onClick={() => toggle(k)} className="text-gray-500 hover:text-white">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">🎯 {g.alerta?.nombre || '(sin nombre)'}</span>
                          {g.alerta?.perfilNombre && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">📁 {g.alerta.perfilNombre}</span>}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">{g.licitaciones.length} lic</span>
                        </div>
                      </div>
                      <button onClick={() => enviarGrupo(g)} disabled={acting === 'grupo|' + g.payloadFile}
                        className="px-2 py-1 rounded text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50">
                        {acting === 'grupo|' + g.payloadFile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Enviar todas
                      </button>
                    </div>

                    {open && (
                      <div className="px-12 pb-3 space-y-2 bg-gray-950/40">
                        {g.licitaciones.map(lic => {
                          const lk = g.payloadFile + '|' + lic.numeroProceso
                          const dec = lic.agenteDecision
                          return (
                            <div key={lic.numeroProceso} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-xs">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <code className="font-mono text-cyan-400">{lic.numeroProceso}</code>
                                  {lic.viaAuto && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">via: {lic.viaAuto}</span>}
                                  {dec && (
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${dec.confianza >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                      <Brain className="w-3 h-3 inline" /> {dec.confianza}%
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={() => enviarUna(g, lic)} disabled={acting === lk}
                                    className="px-2 py-1 rounded text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50">
                                    {acting === lk ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    Enviar
                                  </button>
                                  <button onClick={() => rechazar(g, lic)} disabled={acting === lk}
                                    className="px-2 py-1 rounded text-[11px] font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1 disabled:opacity-50">
                                    <X className="w-3 h-3" /> Rechazar
                                  </button>
                                </div>
                              </div>
                              <div className="text-white font-medium leading-snug">{lic.titulo}</div>
                              <div className="text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0.5">
                                <div>🏢 {lic.entidadEmisora || '–'}</div>
                                <div>💰 {lic.montoTexto || '–'}</div>
                                <div>📅 {lic.fechaCierre ? new Date(lic.fechaCierre).toLocaleDateString('es-CR') : '–'}</div>
                              </div>
                              {dec?.razon && (
                                <div className="mt-2 text-violet-300 bg-violet-500/5 border border-violet-500/20 rounded p-1.5">
                                  🧠 <strong>Agente:</strong> {dec.razon}
                                </div>
                              )}
                              {lic.razonCoincidencia && !dec?.razon && (
                                <div className="mt-1 text-[11px] text-gray-500">{lic.razonCoincidencia}</div>
                              )}
                              {lic.urlDetalle && (
                                <a href={lic.urlDetalle} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-2">
                                  <ExternalLink className="w-3 h-3" /> Ver licitación en SICOP
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
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className={`flex items-center gap-1.5 text-xs ${color} mb-1`}>
        {icon} <span className="text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
