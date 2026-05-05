import React, { useState, useEffect, useCallback } from 'react'
import { Mail, MailCheck, MailX, AlertTriangle, Hash, Bell, Calendar, RefreshCw, Search, Filter, ChevronDown, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function AutoEnvios() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dias, setDias] = useState(7)
  const [email, setEmail] = useState('')
  const [via, setVia] = useState('')
  const [soloFallidos, setSoloFallidos] = useState(false)
  const [soloIncompletos, setSoloIncompletos] = useState(false)

  const [expanded, setExpanded] = useState(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ dias: String(dias), limit: '200' })
      if (email.trim()) params.set('email', email.trim())
      if (via) params.set('via', via)
      if (soloFallidos) params.set('soloFallidos', 'true')
      if (soloIncompletos) params.set('soloIncompletos', 'true')

      const r = await fetch(`${SCRAPER_URL}/api/auto-envios?${params.toString()}`)
      const d = await r.json()
      if (!d.success) throw new Error(d.error || 'Error desconocido')
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dias, email, via, soloFallidos, soloIncompletos])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleExpand = (id) => {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
  }

  const fmtDate = (s) => {
    if (!s) return '–'
    try { return new Date(s).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' }) } catch { return s }
  }

  const stats = data?.stats || {}
  const porUsuario = data?.porUsuario || []
  const envios = data?.envios || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MailCheck className="w-7 h-7 text-emerald-500" /> Auto-Envíos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registro de emails enviados automáticamente por matches por código de catálogo SICOP.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
          <Filter className="w-4 h-4" /> Filtros
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] text-gray-500 uppercase">Días</label>
            <input type="number" min={1} max={90} value={dias} onChange={e => setDias(parseInt(e.target.value) || 7)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-gray-500 uppercase">Email del usuario</label>
            <div className="relative">
              <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="ej: cr.arboledaserena@gmail.com"
                className="w-full bg-gray-800 border border-gray-700 rounded pl-7 pr-2 py-1.5 text-sm text-white placeholder-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase">Vía</label>
            <select value={via} onChange={e => setVia(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white">
              <option value="">Todas</option>
              <option value="codigo">codigo</option>
              <option value="alta-confianza">alta-confianza</option>
              <option value="test">test</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 justify-end">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" checked={soloFallidos} onChange={e => setSoloFallidos(e.target.checked)} className="accent-red-500" />
              Solo fallidos
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" checked={soloIncompletos} onChange={e => setSoloIncompletos(e.target.checked)} className="accent-amber-500" />
              Solo incompletos
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Envíos" value={stats.totalEnvios ?? '–'} icon={<Mail className="w-4 h-4" />} color="text-blue-400" />
        <StatCard label="Licitaciones" value={stats.totalLics ?? '–'} icon={<Hash className="w-4 h-4" />} color="text-cyan-400" />
        <StatCard label="Email OK" value={stats.exitosos ?? '–'} icon={<MailCheck className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Email falló" value={stats.fallidos ?? '–'} icon={<MailX className="w-4 h-4" />} color="text-red-400" />
        <StatCard label="Datos incompletos" value={stats.incompletos ?? '–'} icon={<AlertTriangle className="w-4 h-4" />} color="text-amber-400" />
      </div>

      {/* Por usuario */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Top usuarios (por licitaciones recibidas)</h2>
          <span className="text-xs text-gray-500">— ventana: últimos {dias}d</span>
        </div>
        {porUsuario.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">Sin datos para esta ventana</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-2">Usuario</th>
                  <th className="text-right px-4 py-2">Envíos</th>
                  <th className="text-right px-4 py-2">Licitaciones</th>
                  <th className="text-right px-4 py-2">Fallidos</th>
                  <th className="text-right px-4 py-2">Último envío</th>
                </tr>
              </thead>
              <tbody>
                {porUsuario.map(u => (
                  <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => setEmail(u._id)}>
                    <td className="px-4 py-2">
                      <div className="text-white">{u.nombreUsuario || '(sin nombre)'}</div>
                      <div className="text-[11px] text-gray-500">{u._id}</div>
                    </td>
                    <td className="text-right px-4 py-2 text-gray-300">{u.envios}</td>
                    <td className="text-right px-4 py-2 font-bold text-cyan-400">{u.lics}</td>
                    <td className={`text-right px-4 py-2 ${u.fallidos > 0 ? 'text-red-400' : 'text-gray-500'}`}>{u.fallidos}</td>
                    <td className="text-right px-4 py-2 text-gray-400 text-xs">{fmtDate(u.ultimoEnvio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Envíos detallados */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Envíos ({data?.mostrados ?? 0} de {data?.totalMatch ?? 0})</h2>
        </div>
        {envios.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">{loading ? 'Cargando…' : 'Sin envíos para los filtros actuales'}</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {envios.map(e => (
              <EnvioRow key={e._id} envio={e} expanded={expanded.has(e._id)} onToggle={() => toggleExpand(e._id)} fmtDate={fmtDate} />
            ))}
          </div>
        )}
      </div>
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

function EnvioRow({ envio, expanded, onToggle, fmtDate }) {
  const okColor = envio.emailEnviado ? 'text-emerald-400' : 'text-red-400'
  const okIcon = envio.emailEnviado ? <MailCheck className="w-4 h-4" /> : <MailX className="w-4 h-4" />
  const incompleto = !envio.todasCompletas

  return (
    <div>
      <button onClick={onToggle} className="w-full px-4 py-3 hover:bg-gray-800/30 text-left flex items-center gap-3">
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
        <div className={`shrink-0 ${okColor}`}>{okIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white font-medium">{envio.emailUsuario}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-400">{envio.nombreAlerta}</span>
            {envio.perfilNombre && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">{envio.perfilNombre}</span>
            )}
            {incompleto && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {envio.licsConDataIncompleta} incompleta{envio.licsConDataIncompleta !== 1 ? 's' : ''}
              </span>
            )}
            {envio.via && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">via: {envio.via}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {envio.totalLicitaciones} licitaciones · {fmtDate(envio.fechaEnvio)} · {envio.scriptOrigen || '–'}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-12 pb-3 pt-1 space-y-2 bg-gray-950/40">
          {envio.emailError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
              <strong>Error:</strong> {envio.emailError}
            </div>
          )}
          <div className="text-[11px] text-gray-500 uppercase mt-2">Licitaciones</div>
          {(envio.licitaciones || []).map((lic, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-xs">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-cyan-400">{lic.numeroProceso}</span>
                  {lic.dataCompleta ? (
                    <span className="ml-2 text-[10px] text-emerald-400">✓ datos completos</span>
                  ) : (
                    <span className="ml-2 text-[10px] text-amber-400">⚠ faltan: {(lic.camposFaltantes || []).join(', ') || '?'}</span>
                  )}
                  {lic.tieneResumenIA && (
                    <span className="ml-2 text-[10px] text-purple-400">📋 con resumen</span>
                  )}
                </div>
              </div>
              <div className="text-white font-medium leading-snug">{lic.titulo || '(sin título)'}</div>
              <div className="text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0.5">
                <div>🏢 {lic.entidadEmisora || '–'}</div>
                <div>💰 {lic.montoTexto || '–'}</div>
                <div>📅 {lic.fechaCierre ? new Date(lic.fechaCierre).toLocaleDateString('es-CR') : '–'}</div>
              </div>
              {lic.urlDetalle && (
                <a href={lic.urlDetalle} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-2">
                  <ExternalLink className="w-3 h-3" /> Abrir licitación
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
