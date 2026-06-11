import React, { useState, useEffect, useCallback } from 'react'
import { CreditCard, RefreshCw, Loader2, Send, Eye, CheckCircle2, XCircle, MailCheck } from 'lucide-react'
import { API_URL } from '../config'
import { useAuth } from '../hooks/useAuth'

function fmtFecha(f) {
  if (!f) return '—'
  try {
    return new Date(f).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

const PLAN_BADGE = {
  free: 'bg-gray-500/20 text-gray-400',
  basic: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-indigo-500/20 text-indigo-400',
  premium: 'bg-amber-500/20 text-amber-400',
}

export default function PagosRechazados() {
  const { token } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [seleccion, setSeleccion] = useState(new Set())
  const [enviando, setEnviando] = useState(false)
  const [resultados, setResultados] = useState({}) // _id → 'enviado' | 'fallido' | 'salteado_ya_enviado'
  const [verPreview, setVerPreview] = useState(false)
  const [soloSinEmail, setSoloSinEmail] = useState(true)

  const headers = { 'x-auth-token': token, 'Content-Type': 'application/json' }

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/api/backoffice/pagos-rechazados`, { headers: { 'x-auth-token': token } })
      const d = await r.json()
      setUsuarios(d.usuarios || [])
    } catch (e) {
      console.error('Error cargando pagos rechazados:', e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { cargar() }, [cargar])

  const visibles = usuarios.filter(u => !soloSinEmail || !u.fechaEmailEnviado)

  const toggle = (id) => {
    setSeleccion(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const toggleTodos = () => {
    const idsVisibles = visibles.map(u => u._id)
    const todosSeleccionados = idsVisibles.length > 0 && idsVisibles.every(id => seleccion.has(id))
    setSeleccion(todosSeleccionados ? new Set() : new Set(idsVisibles))
  }

  const enviar = async () => {
    const ids = [...seleccion]
    if (ids.length === 0) return
    const conEmailPrevio = usuarios.filter(u => seleccion.has(u._id) && u.fechaEmailEnviado).length
    const msj = `Vas a enviar el email de "pago rechazado / recuperá tu plan" a ${ids.length} usuario(s).` +
      (conEmailPrevio > 0 ? `\n\n⚠️ ${conEmailPrevio} ya lo recibieron antes y serán SALTEADOS (no se reenvía).` : '') +
      `\n\n¿Confirmás el envío?`
    if (!window.confirm(msj)) return

    setEnviando(true)
    try {
      const r = await fetch(`${API_URL}/api/backoffice/pagos-rechazados/enviar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ usuarioIds: ids }),
      })
      const d = await r.json()
      const porId = {}
      for (const res of d.resultados || []) porId[res._id] = res.estado
      setResultados(porId)
      setSeleccion(new Set())
      await cargar() // refresca fechas de email enviado
    } catch (e) {
      console.error('Error enviando emails:', e)
      alert('Error enviando los emails. Revisá la consola.')
    } finally {
      setEnviando(false)
    }
  }

  const idsVisibles = visibles.map(u => u._id)
  const todosSeleccionados = idsVisibles.length > 0 && idsVisibles.every(id => seleccion.has(id))

  // Envío manual a un email cargado a mano
  const [emailManual, setEmailManual] = useState('')
  const [enviandoManual, setEnviandoManual] = useState(false)
  const [resultadoManual, setResultadoManual] = useState(null) // {ok, msj}

  const enviarManual = async () => {
    const email = emailManual.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResultadoManual({ ok: false, msj: 'Email inválido' })
      return
    }
    if (!window.confirm(`¿Enviar el email de "pago rechazado / recuperá tu plan" a ${email}?`)) return
    setEnviandoManual(true)
    setResultadoManual(null)
    try {
      const r = await fetch(`${API_URL}/api/backoffice/pagos-rechazados/enviar-manual`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (d.success) {
        setResultadoManual({ ok: true, msj: `Enviado a ${d.email} (plan ${d.plan}${d.usuarioRegistrado ? ', usuario registrado' : ', no es usuario registrado'})` })
        setEmailManual('')
        cargar()
      } else {
        setResultadoManual({ ok: false, msj: d.message || 'Error enviando' })
      }
    } catch (e) {
      setResultadoManual({ ok: false, msj: 'Error de conexión' })
    } finally {
      setEnviandoManual(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Pagos rechazados
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Usuarios con pago fallido o degradados a Free. Seleccioná y envialés el email de recuperación de plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${API_URL}/api/backoffice/pagos-rechazados/preview`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => { /* el preview requiere token: lo abrimos inline en su lugar */ e.preventDefault(); setVerPreview(v => !v) }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" /> {verPreview ? 'Ocultar email' : 'Ver email'}
          </a>
          <button
            onClick={cargar}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      {verPreview && (
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
            Vista previa del email (asunto: «Tu pago fue rechazado — recuperá tu plan Premium en un minuto»)
          </div>
          <PreviewEmail token={token} />
        </div>
      )}

      <div className="mb-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-2">Enviar a un email específico</div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="email"
            value={emailManual}
            onChange={(e) => { setEmailManual(e.target.value); setResultadoManual(null) }}
            onKeyDown={(e) => e.key === 'Enter' && !enviandoManual && enviarManual()}
            placeholder="usuario@empresa.com"
            className="flex-1 min-w-[260px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={enviarManual}
            disabled={enviandoManual || !emailManual.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {enviandoManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar email
          </button>
        </div>
        {resultadoManual && (
          <div className={`mt-2 text-xs flex items-center gap-1 ${resultadoManual.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {resultadoManual.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {resultadoManual.msj}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Si el email pertenece a un usuario registrado, el mensaje se personaliza con su nombre y su plan anterior, y queda registrado en su ficha.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={soloSinEmail}
            onChange={(e) => setSoloSinEmail(e.target.checked)}
            className="rounded border-gray-700 bg-gray-800"
          />
          Mostrar solo los que aún no recibieron el email
        </label>
        <button
          onClick={enviar}
          disabled={enviando || seleccion.size === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviar a {seleccion.size} seleccionado{seleccion.size === 1 ? '' : 's'}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : visibles.length === 0 ? (
          <div className="text-center py-14 text-gray-500 text-sm">
            {usuarios.length === 0
              ? 'No hay usuarios con pagos rechazados ni degradaciones registradas. 🎉'
              : 'Todos los usuarios con pago rechazado ya recibieron el email. Destildá el filtro para verlos.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} className="rounded border-gray-700 bg-gray-800" />
                </th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Plan actual</th>
                <th className="px-4 py-3">Plan a recuperar</th>
                <th className="px-4 py-3">Pago fallido</th>
                <th className="px-4 py-3">Degradado</th>
                <th className="px-4 py-3">Email enviado</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(u => (
                <tr key={u._id} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={seleccion.has(u._id)} onChange={() => toggle(u._id)} className="rounded border-gray-700 bg-gray-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{u.nombre || '—'}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[u.planActual] || PLAN_BADGE.free}`}>
                      {u.planActual}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-400 font-medium">{u.planAnterior}</td>
                  <td className="px-4 py-3 text-gray-400">{fmtFecha(u.fechaPagoFallido)}</td>
                  <td className="px-4 py-3 text-gray-400">{fmtFecha(u.fechaDegradacion)}</td>
                  <td className="px-4 py-3">
                    {u.fechaEmailEnviado ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <MailCheck className="w-3.5 h-3.5" /> {fmtFecha(u.fechaEmailEnviado)}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {resultados[u._id] === 'enviado' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {resultados[u._id] === 'fallido' && <XCircle className="w-4 h-4 text-red-400" />}
                    {resultados[u._id] === 'salteado_ya_enviado' && <span className="text-[10px] text-gray-500">ya enviado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/** Preview inline del email: lo trae autenticado y lo renderiza en un iframe. */
function PreviewEmail({ token }) {
  const [html, setHtml] = useState(null)
  useEffect(() => {
    fetch(`${API_URL}/api/backoffice/pagos-rechazados/preview`, { headers: { 'x-auth-token': token } })
      .then(r => r.text())
      .then(setHtml)
      .catch(() => setHtml('<p style="padding:20px">No se pudo cargar el preview</p>'))
  }, [token])
  if (html === null) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-gray-600" /></div>
  }
  return <iframe title="preview-email" srcDoc={html} className="w-full bg-white" style={{ height: 620, border: 0 }} />
}
