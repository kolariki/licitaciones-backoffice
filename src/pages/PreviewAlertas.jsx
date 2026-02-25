import React, { useState, useEffect } from 'react'
import { Bell, Send, Loader2, RefreshCw, ExternalLink, Check, AlertTriangle, FileText, DollarSign, Calendar, Building2, Hash, Tag, User, Mail, ChevronDown, ChevronUp } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function PreviewAlertas() {
  const [payloads, setPayloads] = useState([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [runningAlertas, setRunningAlertas] = useState(false)
  const [sendingIndividual, setSendingIndividual] = useState({})
  const [sendingComplete, setSendingComplete] = useState({})
  const [sentAlerts, setSentAlerts] = useState({})
  const [expandedPayloads, setExpandedPayloads] = useState({})
  const [result, setResult] = useState(null)

  const fetchPayloads = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas/payloads`)
      const d = await r.json()
      if (d.success) setPayloads(d.payloads || [])
    } catch (e) {
      console.error('Error loading payloads:', e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPayloads() }, [])

  const regenerarPreview = async () => {
    setRegenerating(true)
    setResult(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/regenerar-preview`, { method: 'POST' })
      const d = await r.json()
      setResult({ success: d.success !== false, message: d.success ? 'Preview regenerado correctamente' : (d.error || 'Error') })
      if (d.success) fetchPayloads()
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setRegenerating(false)
  }

  const ejecutarAlertas = async () => {
    setRunningAlertas(true)
    setResult(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas/run`, { method: 'POST' })
      const d = await r.json()
      setResult({ success: d.success !== false, message: d.message || 'Alertas verificadas' })
      setTimeout(() => fetchPayloads(), 2000)
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setRunningAlertas(false)
  }

  const enviarIndividual = async (alertaId, usuarioId, numeroProceso, licitacionId, payloadFilename) => {
    const key = `${alertaId}_${licitacionId}`
    setSendingIndividual(p => ({ ...p, [key]: true }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/enviar-alerta-individual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId, usuarioId, numeroProceso, licitacionId, payloadFilename })
      })
      const d = await r.json()
      if (d.success) setSentAlerts(p => ({ ...p, [key]: true }))
      else setResult({ success: false, message: d.error || 'Error al enviar' })
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setSendingIndividual(p => ({ ...p, [key]: false }))
  }

  const enviarCompleta = async (alertaId, usuarioId, filename) => {
    const key = `complete_${alertaId}_${usuarioId}`
    setSendingComplete(p => ({ ...p, [key]: true }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/enviar-alerta-completa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId, usuarioId, filename })
      })
      const d = await r.json()
      if (d.success) {
        setSentAlerts(p => ({ ...p, [key]: true }))
        setResult({ success: true, message: `Alerta completa enviada a ${parseField(filename, 'email') || 'usuario'}` })
      } else {
        setResult({ success: false, message: d.error || 'Error al enviar' })
      }
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setSendingComplete(p => ({ ...p, [key]: false }))
  }

  // Parse stringified objects from payload
  const parseField = (val) => {
    if (!val) return null
    if (typeof val === 'object') return val
    try { return JSON.parse(val.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false')) } catch { return val }
  }

  const togglePayload = (idx) => {
    setExpandedPayloads(p => ({ ...p, [idx]: !p[idx] }))
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d }
  }

  const formatMonto = (m) => m || '—'

  // Stats
  const totalPayloads = payloads.length
  const totalLicitaciones = payloads.reduce((acc, p) => {
    const lics = parseField(p.licitaciones)
    return acc + (Array.isArray(lics) ? lics.length : 0)
  }, 0)
  const uniqueUsers = [...new Set(payloads.map(p => {
    const u = parseField(p.usuario)
    return u?.email || u?._id || ''
  }))].length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Preview de Alertas</h1>
          <p className="text-gray-400 text-sm mt-1">Revisa y envía alertas generadas a usuarios</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={ejecutarAlertas} disabled={runningAlertas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50">
            {runningAlertas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Verificar Alertas
          </button>
          <button onClick={regenerarPreview} disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 transition-colors disabled:opacity-50">
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerar Preview
          </button>
          <button onClick={fetchPayloads} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Recargar
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {result.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {result.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{totalPayloads}</div>
          <div className="text-xs text-gray-500 mt-1">Alertas pendientes</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalLicitaciones}</div>
          <div className="text-xs text-gray-500 mt-1">Licitaciones</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{uniqueUsers}</div>
          <div className="text-xs text-gray-500 mt-1">Usuarios destino</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="ml-2 text-gray-400">Cargando alertas...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && payloads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay alertas pendientes</p>
          <p className="text-sm mt-1">Ejecutá "Verificar Alertas" para generar nuevas</p>
        </div>
      )}

      {/* Payload cards */}
      {!loading && payloads.map((payload, idx) => {
        const usuario = parseField(payload.usuario)
        const alerta = parseField(payload.alerta)
        const licitaciones = parseField(payload.licitaciones) || []
        const meta = parseField(payload.metadatos)
        const expanded = expandedPayloads[idx] !== false // default open
        const completeKey = `complete_${payload.alertaId}_${payload.usuarioId}`

        return (
          <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Card header */}
            <div className="p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors"
                 onClick={() => togglePayload(idx)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alerta?.nombre || 'Alerta'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${alerta?.tipo === 'palabra_clave' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : alerta?.tipo === 'codigo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-700 text-gray-400'}`}>
                        {alerta?.tipo || 'tipo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{usuario?.nombre || '—'}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{usuario?.email || '—'}</span>
                      <span>{Array.isArray(licitaciones) ? licitaciones.length : 0} licitaciones</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sentAlerts[completeKey] ? (
                    <span className="flex items-center gap-1 text-xs text-green-400"><Check className="w-3.5 h-3.5" /> Enviada</span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); enviarCompleta(payload.alertaId, payload.usuarioId, payload._filename) }}
                      disabled={sendingComplete[completeKey]}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {sendingComplete[completeKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Enviar todo
                    </button>
                  )}
                  {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>
            </div>

            {/* Licitaciones list */}
            {expanded && Array.isArray(licitaciones) && (
              <div className="divide-y divide-gray-800/50">
                {licitaciones.map((lic, licIdx) => {
                  const indKey = `${payload.alertaId}_${lic._id}`
                  return (
                    <div key={licIdx} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-amber-400/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {lic.numeroProceso}
                            </span>
                            {lic.razonCoincidencia && (
                              <span className="text-[10px] text-gray-500 italic">{lic.razonCoincidencia}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-white mt-1.5 line-clamp-2">{lic.titulo || lic.objeto || '—'}</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Building2 className="w-3 h-3 text-gray-600 shrink-0" />
                              <span className="truncate">{lic.entidadEmisora || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <DollarSign className="w-3 h-3 text-gray-600 shrink-0" />
                              <span>{formatMonto(lic.montoTexto || lic.presupuesto)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Calendar className="w-3 h-3 text-gray-600 shrink-0" />
                              <span>Cierre: {formatDate(lic.fechaCierre)}</span>
                            </div>
                          </div>

                          {lic.objeto && lic.objeto !== lic.titulo && (
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{lic.objeto}</p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {sentAlerts[indKey] ? (
                            <span className="flex items-center gap-1 text-xs text-green-400"><Check className="w-3.5 h-3.5" /></span>
                          ) : (
                            <button
                              onClick={() => enviarIndividual(payload.alertaId, payload.usuarioId, lic.numeroProceso, lic._id, payload._filename)}
                              disabled={sendingIndividual[indKey]}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-amber-300 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 transition-colors disabled:opacity-50"
                            >
                              {sendingIndividual[indKey] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Enviar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
