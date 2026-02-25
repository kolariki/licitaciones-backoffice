import React, { useState, useEffect } from 'react'
import { Bell, Send, CheckCircle2, XCircle, Loader2, RefreshCw, Mail, User, FileText, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function PreviewAlertas() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState(null)
  const [expandedPayloads, setExpandedPayloads] = useState({})
  const [sendStatus, setSendStatus] = useState({}) // key: alertaId_licitacion or alertaId_all

  const fetchData = () => {
    setLoading(true)
    fetch(`${SCRAPER_URL}/api/alertas/estadisticas`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const regenerarPreview = async () => {
    setRegenerating(true)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/regenerar-preview`, { method: 'POST' })
      const d = await r.json()
      if (d.success) {
        fetchData() // Refresh after regeneration
      }
    } catch (e) { }
    setRegenerating(false)
  }

  const enviarAlertaIndividual = async (alertaId, usuarioId, numeroProceso, licitacionId, payloadFilename) => {
    const key = `${alertaId}_${numeroProceso}`
    setSendStatus(prev => ({ ...prev, [key]: 'sending' }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/enviar-alerta-individual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId, usuarioId, numeroProceso, licitacionId, payloadFilename })
      })
      const d = await r.json()
      setSendStatus(prev => ({ ...prev, [key]: d.success ? 'sent' : 'error' }))
    } catch {
      setSendStatus(prev => ({ ...prev, [key]: 'error' }))
    }
  }

  const enviarAlertaCompleta = async (alertaId, usuarioId, filename) => {
    const key = `${alertaId}_all`
    setSendStatus(prev => ({ ...prev, [key]: 'sending' }))
    try {
      const r = await fetch(`${SCRAPER_URL}/api/enviar-alerta-completa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertaId, usuarioId, filename })
      })
      const d = await r.json()
      setSendStatus(prev => ({ ...prev, [key]: d.success ? 'sent' : 'error' }))
    } catch {
      setSendStatus(prev => ({ ...prev, [key]: 'error' }))
    }
  }

  const togglePayload = (payload) => {
    setExpandedPayloads(prev => ({ ...prev, [payload]: !prev[payload] }))
  }

  // Group alertas by payload (which represents user+alert combo)
  const alertasPorPayload = {}
  if (data?.alertasEnviadas) {
    data.alertasEnviadas.forEach(a => {
      const key = a.payload || 'sin-payload'
      if (!alertasPorPayload[key]) alertasPorPayload[key] = { ...a, licitaciones: [] }
      alertasPorPayload[key].licitaciones.push(a)
    })
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  const StatusBadge = ({ status }) => {
    if (!status) return null
    if (status === 'sending') return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
    if (status === 'sent') return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
    if (status === 'error') return <XCircle className="w-3.5 h-3.5 text-red-400" />
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Preview de Alertas</h1>
          <p className="text-gray-400 text-sm mt-1">Alertas generadas listas para enviar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={regenerarPreview}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 transition-colors disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerar Preview
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refrescar
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : data ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Bell className="w-3 h-3" /> Alertas configuradas</p>
              <p className="text-2xl font-bold">{data.totalAlertas || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Licitaciones</p>
              <p className="text-2xl font-bold">{data.totalLicitaciones || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Usuarios procesados</p>
              <p className="text-2xl font-bold">{data.usuariosProcesados || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Send className="w-3 h-3" /> Alertas a enviar</p>
              <p className="text-2xl font-bold text-amber-400">{data.alertasEnviadas?.length || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Omitidas</p>
              <p className="text-2xl font-bold text-gray-500">{data.alertasOmitidas?.length || 0}</p>
            </div>
          </div>

          {/* Resumen envíos */}
          {data.resumen && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Emails: <span className="text-white font-medium">{data.resumen.emailsEnviados || 0}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Push: <span className="text-white font-medium">{data.resumen.pushEnviados || 0}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">SSE: <span className="text-white font-medium">{data.resumen.sseEnviados || 0}</span></span>
              </div>
              {data.resumen.alertasOmitidas > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Omitidas: <span className="text-amber-400 font-medium">{data.resumen.alertasOmitidas}</span></span>
                </div>
              )}
            </div>
          )}

          {/* Alertas grouped by payload */}
          {Object.keys(alertasPorPayload).length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No hay alertas pendientes de envío</p>
              <p className="text-gray-600 text-xs mt-1">Ejecutá "Verificar Alertas" para generar nuevas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(alertasPorPayload).map(([payload, group]) => {
                const isExpanded = expandedPayloads[payload] !== false // default open
                const alertaId = group.licitaciones[0]?.alertaId || ''
                const usuarioId = group.licitaciones[0]?.usuarioId || ''

                return (
                  <div key={payload} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    {/* Header */}
                    <button
                      onClick={() => togglePayload(payload)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-sm font-bold text-purple-400 shrink-0">
                        {(group.usuario || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-white truncate">{group.usuario}</p>
                        <p className="text-xs text-gray-500">
                          Alerta: <span className="text-purple-400">{group.alerta}</span> · {group.licitaciones.length} licitacion{group.licitaciones.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sendStatus[`${alertaId || payload}_all`]} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Extract alertaId and usuarioId from the first licitacion's payload filename
                            const firstLic = group.licitaciones[0]
                            if (firstLic) {
                              // We need alertaId, usuarioId from the data - they might be in the payload filename
                              enviarAlertaCompleta(
                                payload.split('_')[1] || '', // alertaId from filename
                                '', // usuarioId - not available directly, but the backend reads from payload
                                payload
                              )
                            }
                          }}
                          disabled={sendStatus[`${alertaId || payload}_all`] === 'sending' || sendStatus[`${alertaId || payload}_all`] === 'sent'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Send className="w-3 h-3" /> Enviar todo
                        </button>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    {/* Licitaciones */}
                    {isExpanded && (
                      <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                        {group.licitaciones.map((lic, i) => {
                          const sendKey = `${payload}_${lic.licitacion}`
                          return (
                            <div key={i} className="px-5 py-3 hover:bg-gray-800/20 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-blue-400">{lic.licitacion}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{lic.razon}</p>
                                  {lic.timestamp && (
                                    <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {fmtDate(lic.timestamp)}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <StatusBadge status={sendStatus[sendKey]} />
                                  <button
                                    onClick={() => enviarAlertaIndividual(
                                      payload.split('_')[1] || '',
                                      '', 
                                      lic.licitacion,
                                      '', // licitacionId not available
                                      payload
                                    )}
                                    disabled={sendStatus[sendKey] === 'sending' || sendStatus[sendKey] === 'sent'}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    <Send className="w-3 h-3" /> Enviar
                                  </button>
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
          )}

          {/* Omitidas */}
          {data.alertasOmitidas?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Alertas omitidas ({data.alertasOmitidas.length})
              </h3>
              <div className="space-y-2">
                {data.alertasOmitidas.map((o, i) => (
                  <div key={i} className="text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-2">
                    <span className="text-gray-400">{o.usuario}</span> · {o.alerta} · {o.razon || 'Sin razón'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link to original preview */}
          <div className="text-center">
            <a
              href={`${SCRAPER_URL}/preview-alertas.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-400 underline"
            >
              Ver preview original en servidor
            </a>
          </div>
        </>
      ) : null}
    </div>
  )
}
