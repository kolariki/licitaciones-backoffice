import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MessageSquare, Send, Loader2, RefreshCw, User, ShieldCheck } from 'lucide-react'
import { API_URL } from '../config'
import { useAuth } from '../hooks/useAuth'

const ESTADO_BADGE = {
  abierta: 'bg-amber-500/20 text-amber-400',
  respondida: 'bg-emerald-500/20 text-emerald-400',
  cerrada: 'bg-gray-500/20 text-gray-400',
}

function fmtFecha(f) {
  if (!f) return ''
  try {
    return new Date(f).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

export default function ConsultasExpertos() {
  const { token, user } = useAuth()
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('all')
  const [seleccionada, setSeleccionada] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const hiloRef = useRef(null)

  const headers = { 'x-auth-token': token, 'Content-Type': 'application/json' }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const url = `${API_URL}/api/backoffice/consultas${filtro !== 'all' ? `?estado=${filtro}` : ''}`
      const r = await fetch(url, { headers: { 'x-auth-token': token } })
      const d = await r.json()
      setConsultas(d.consultas || [])
    } catch (e) {
      console.error('Error cargando consultas:', e)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, token])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Refresco silencioso (polling) para ver consultas/respuestas nuevas sin recargar.
  const seleccionadaRef = useRef(null)
  useEffect(() => {
    seleccionadaRef.current = seleccionada?._id || null
  }, [seleccionada])

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const url = `${API_URL}/api/backoffice/consultas${filtro !== 'all' ? `?estado=${filtro}` : ''}`
        const r = await fetch(url, { headers: { 'x-auth-token': token } })
        const d = await r.json()
        setConsultas(d.consultas || [])
        // Refrescar también el hilo abierto (follow-ups del usuario en tiempo real).
        const abiertoId = seleccionadaRef.current
        if (abiertoId) {
          const lista = d.consultas || []
          const fresca = lista.find(x => x._id === abiertoId)
          if (fresca) setSeleccionada(prev => (prev && prev._id === abiertoId ? { ...prev, ...fresca } : prev))
        }
      } catch {
        /* silencioso: reintenta en el próximo tick */
      }
    }, 15000)
    return () => clearInterval(id)
  }, [filtro, token])

  useEffect(() => {
    if (hiloRef.current) hiloRef.current.scrollTop = hiloRef.current.scrollHeight
  }, [seleccionada])

  const abrir = async (c) => {
    setRespuesta('')
    setSeleccionada(c)
    // Marcar como vista por el operador (también devuelve el hilo fresco).
    try {
      const r = await fetch(`${API_URL}/api/backoffice/consultas/${c._id}`, { headers: { 'x-auth-token': token } })
      const d = await r.json()
      if (d.consulta) {
        setSeleccionada(d.consulta)
        setConsultas(prev => prev.map(x => (x._id === c._id ? { ...x, noLeidoExperto: false } : x)))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const responder = async () => {
    const texto = respuesta.trim()
    if (!texto || !seleccionada) return
    setEnviando(true)
    try {
      const r = await fetch(`${API_URL}/api/backoffice/consultas/${seleccionada._id}/responder`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ texto, nombre: user?.nombre || 'Equipo Elevum' }),
      })
      const d = await r.json()
      if (d.consulta) {
        setSeleccionada(d.consulta)
        setConsultas(prev => prev.map(x => (x._id === d.consulta._id ? d.consulta : x)))
        setRespuesta('')
      }
    } catch (e) {
      console.error('Error respondiendo:', e)
    } finally {
      setEnviando(false)
    }
  }

  const noLeidas = consultas.filter(c => c.noLeidoExperto).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Consultas a expertos
            {noLeidas > 0 && (
              <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                {noLeidas} sin leer
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Consultas del Agente Elevum. Respondé 1 a 1; al usuario le llega en la app y por email.</p>
        </div>
        <button
          onClick={cargar}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'abierta', 'respondida', 'cerrada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filtro === f ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {f === 'all' ? 'Todas' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Lista */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : consultas.length === 0 ? (
            <p className="text-sm text-gray-500 p-6 text-center">No hay consultas.</p>
          ) : (
            consultas.map(c => (
              <button
                key={c._id}
                onClick={() => abrir(c)}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 transition-colors ${
                  seleccionada?._id === c._id ? 'bg-blue-600/10' : 'hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {c.usuarioNombre || c.usuarioEmail || 'Usuario'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${ESTADO_BADGE[c.estado] || ''}`}>
                    {c.estado}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {c.numeroProceso || 'Consulta general'}
                </div>
                <div className="text-xs text-gray-400 truncate mt-1">
                  {c.mensajes?.[c.mensajes.length - 1]?.texto || ''}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-600">{fmtFecha(c.updatedAt)}</span>
                  {c.noLeidoExperto && <span className="w-2 h-2 rounded-full bg-red-400" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Hilo */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col max-h-[70vh]">
          {!seleccionada ? (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm p-8">
              Seleccioná una consulta para ver el hilo y responder.
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    {seleccionada.usuarioNombre || seleccionada.usuarioEmail || 'Usuario'}
                  </h2>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${ESTADO_BADGE[seleccionada.estado] || ''}`}>
                    {seleccionada.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{seleccionada.usuarioEmail}</p>
                {seleccionada.numeroProceso && (
                  <p className="text-xs text-blue-400 mt-1">
                    {seleccionada.numeroProceso}
                    {seleccionada.licitacionTitulo ? ` — ${seleccionada.licitacionTitulo}` : ''}
                  </p>
                )}
              </div>

              <div ref={hiloRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {seleccionada.contexto?.length > 0 && (
                  <details className="text-xs text-gray-500 bg-gray-950/60 rounded-lg p-3">
                    <summary className="cursor-pointer text-gray-400">Contexto del chat con el agente ({seleccionada.contexto.length})</summary>
                    <div className="mt-2 space-y-1">
                      {seleccionada.contexto.map((m, i) => (
                        <p key={i}>
                          <span className="font-semibold">{m.role === 'user' ? '👤 Usuario: ' : '🤖 Agente: '}</span>
                          {m.content}
                        </p>
                      ))}
                    </div>
                  </details>
                )}

                {seleccionada.mensajes?.map((m, i) => (
                  <div key={i} className={`flex ${m.autor === 'experto' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${m.autor === 'experto' ? 'bg-blue-600/20' : 'bg-gray-800'}`}>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
                        {m.autor === 'experto' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {m.autor === 'experto' ? (m.nombre || 'Experto') : (m.nombre || 'Usuario')}
                        <span className="text-gray-600">· {fmtFecha(m.fecha)}</span>
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{m.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-800 flex items-end gap-2">
                <textarea
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); responder() } }}
                  rows={2}
                  placeholder="Escribí tu respuesta…"
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none outline-none focus:border-blue-500"
                />
                <button
                  onClick={responder}
                  disabled={enviando || !respuesta.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Responder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
