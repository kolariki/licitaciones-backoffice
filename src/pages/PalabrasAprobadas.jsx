import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, RefreshCw, Search, Volume2, VolumeX, Loader2, Hash, Calendar, FileText, Mic2 } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function PalabrasAprobadas() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [email, setEmail] = useState('')
  const [soloSilenciadas, setSoloSilenciadas] = useState(false)
  const [ordenar, setOrdenar] = useState('veces')

  const [rebuilding, setRebuilding] = useState(false)
  const [rebuildOutput, setRebuildOutput] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ limit: '500', ordenar })
      if (email.trim()) params.set('email', email.trim())
      if (soloSilenciadas) params.set('soloSilenciadas', 'true')
      const r = await fetch(`${SCRAPER_URL}/api/palabras-aprobadas?${params.toString()}`)
      if (!r.ok) {
        if (r.status === 404) throw new Error('Endpoint /api/palabras-aprobadas no disponible — redeploy del back pendiente')
        throw new Error(`HTTP ${r.status}`)
      }
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error('Respuesta no es JSON — redeploy pendiente')
      const d = await r.json()
      if (!d.success) throw new Error(d.error || '?')
      setData(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [email, soloSilenciadas, ordenar])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleSilenciar = async (palabra) => {
    setActionLoading(palabra._id)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/palabras-aprobadas/${palabra._id}/silenciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ silenciada: !palabra.silenciada })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      setData(prev => ({
        ...prev,
        palabras: prev.palabras.map(p => p._id === palabra._id ? { ...p, silenciada: !p.silenciada } : p)
      }))
    } catch (e) { alert('Error: ' + e.message) }
    finally { setActionLoading(null) }
  }

  const rebuildAll = async () => {
    if (!window.confirm(`Rebuild ${email ? 'solo de ' + email : 'GLOBAL'} desde NotificacionEnviada. Tarda algunos minutos. ¿Continuar?`)) return
    setRebuilding(true); setRebuildOutput('▶ Iniciando rebuild...\n')
    try {
      const r = await fetch(`${SCRAPER_URL}/api/palabras-aprobadas/rebuild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      })
      const d = await r.json()
      setRebuildOutput((d.output || '').slice(-15000) + `\n──── exit=${d.code ?? '?'} ${d.success ? '✅' : '❌'} ────`)
      fetchData()
    } catch (e) { setRebuildOutput('Error: ' + e.message) }
    finally { setRebuilding(false) }
  }

  const palabras = data?.palabras || []
  const porUsuario = data?.porUsuario || []

  // Agrupar palabras por usuario para la vista de detalle
  const palabrasPorEmail = {}
  for (const p of palabras) {
    if (!palabrasPorEmail[p.emailUsuario]) palabrasPorEmail[p.emailUsuario] = []
    palabrasPorEmail[p.emailUsuario].push(p)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-7 h-7 text-purple-500" /> Vocabulario Aprobado</h1>
          <p className="text-gray-400 text-sm mt-1">
            Palabras que ya generaron al menos un envío histórico a cada usuario. Cuando una nueva
            licitación matchea solo palabras de esta lista (no silenciadas), se envía automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refrescar
          </button>
          <button onClick={rebuildAll} disabled={rebuilding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50">
            {rebuilding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic2 className="w-3.5 h-3.5" />}
            Rebuild desde Historial
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-[11px] text-gray-500 uppercase">Email del usuario</label>
            <div className="relative">
              <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="vacío = todos"
                className="w-full bg-gray-800 border border-gray-700 rounded pl-7 pr-2 py-1.5 text-sm text-white placeholder-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase">Ordenar por</label>
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white">
              <option value="veces">Más enviadas</option>
              <option value="reciente">Más recientes</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" checked={soloSilenciadas} onChange={e => setSoloSilenciadas(e.target.checked)} className="accent-orange-500" />
              Solo silenciadas
            </label>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      {rebuildOutput && (
        <pre className="bg-black/60 text-gray-300 text-[11px] leading-relaxed rounded-lg p-3 max-h-60 overflow-auto whitespace-pre-wrap">{rebuildOutput}</pre>
      )}

      {/* Resumen por usuario */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Resumen por usuario</h2>
        </div>
        {porUsuario.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">Sin datos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-2">Usuario</th>
                  <th className="text-right px-4 py-2">Palabras únicas</th>
                  <th className="text-right px-4 py-2">Confiables (no silenciadas)</th>
                  <th className="text-right px-4 py-2">Silenciadas</th>
                  <th className="text-right px-4 py-2">Envíos totales</th>
                  <th className="text-right px-4 py-2">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {porUsuario.map(u => (
                  <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => setEmail(u._id)}>
                    <td className="px-4 py-2 text-white text-xs">{u._id}</td>
                    <td className="text-right px-4 py-2 text-gray-300">{u.palabrasUnicas}</td>
                    <td className="text-right px-4 py-2 font-bold text-emerald-400">{u.palabrasUnicas - u.silenciadas}</td>
                    <td className="text-right px-4 py-2 text-orange-400">{u.silenciadas}</td>
                    <td className="text-right px-4 py-2 text-gray-400">{u.envios}</td>
                    <td className="text-right px-4 py-2 text-gray-500 text-[11px]">{u.ultimaActividad ? new Date(u.ultimaActividad).toLocaleDateString('es-CR') : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Listado por usuario */}
      {Object.entries(palabrasPorEmail).map(([eml, lista]) => (
        <div key={eml} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">{eml}</h2>
            <span className="text-xs text-gray-500">— {lista.length} palabras</span>
          </div>
          <div className="divide-y divide-gray-800">
            {lista.map(p => (
              <div key={p._id} className={`px-4 py-2.5 flex items-center gap-3 hover:bg-gray-800/30 ${p.silenciada ? 'opacity-60' : ''}`}>
                <code className={`px-2 py-1 rounded text-xs font-mono ${p.silenciada ? 'bg-orange-500/10 text-orange-400 line-through' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {p.palabra}
                </code>
                {p.palabraOriginal && p.palabraOriginal.toLowerCase() !== p.palabra.toLowerCase() && (
                  <span className="text-[11px] text-gray-500">orig: "{p.palabraOriginal}"</span>
                )}
                <div className="flex-1 text-xs text-gray-400">
                  <span title="Veces enviada"><Hash className="w-3 h-3 inline" /> {p.vecesEnviada}</span>
                  <span className="mx-2">·</span>
                  <span title="Último envío"><Calendar className="w-3 h-3 inline" /> {p.ultimaVezEnviada ? new Date(p.ultimaVezEnviada).toLocaleDateString('es-CR') : '–'}</span>
                  {p.alertaNombres?.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      <span title="Alertas que la usaron">{p.alertaNombres.length} alerta{p.alertaNombres.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                  {p.ejemplosLicitaciones?.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      <span title={p.ejemplosLicitaciones.map(e => e.numeroProceso).join(', ')}><FileText className="w-3 h-3 inline" /> {p.ejemplosLicitaciones.length} ej</span>
                    </>
                  )}
                </div>
                <button onClick={() => toggleSilenciar(p)} disabled={actionLoading === p._id}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    p.silenciada ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                  } disabled:opacity-50`}>
                  {actionLoading === p._id ? <Loader2 className="w-3 h-3 animate-spin" />
                    : p.silenciada ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  {p.silenciada ? 'Reactivar' : 'Silenciar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
