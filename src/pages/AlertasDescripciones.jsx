import React, { useState, useEffect, useCallback } from 'react'
import { Brain, RefreshCw, Search, Loader2, Edit3, Save, X, CheckCircle2, XCircle, Sparkles } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function AlertasDescripciones() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')

  const [regenerating, setRegenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [editing, setEditing] = useState(null)

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ limit: '500' })
      if (email.trim()) params.set('email', email.trim())
      const r = await fetch(`${SCRAPER_URL}/api/alertas-descripciones?${params}`)
      if (!r.ok) {
        if (r.status === 404) throw new Error('Endpoint no disponible — redeploy del back pendiente')
        throw new Error(`HTTP ${r.status}`)
      }
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error('Respuesta no es JSON — redeploy pendiente')
      const d = await r.json()
      if (!d.success) throw new Error(d.error || '?')
      setData(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [email])

  useEffect(() => { fetch_() }, [fetch_])

  const regenerarTodas = async () => {
    if (!window.confirm(`Regenerar descripciones LLM ${email ? 'solo para ' + email : 'para TODAS las alertas elegibles'}. Costo aprox: <$0.50. ¿Continuar?`)) return
    setRegenerating(true); setOutput('▶ Iniciando...\n')
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas-descripciones/regenerar-todas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      })
      const d = await r.json()
      setOutput((d.output || '').slice(-15000) + `\n──── exit=${d.code ?? '?'} ${d.success ? '✅' : '❌'} ────`)
      fetch_()
    } catch (e) { setOutput('Error: ' + e.message) }
    finally { setRegenerating(false) }
  }

  const regenerarUna = async (alertaId) => {
    setRegenerating(true)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas-descripciones/${alertaId}/regenerar`, { method: 'POST' })
      const d = await r.json()
      setOutput((d.output || '').slice(-8000))
      fetch_()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setRegenerating(false) }
  }

  const saveManual = async (descripcion, encajaConStr, noEncajaConStr) => {
    try {
      const r = await fetch(`${SCRAPER_URL}/api/alertas-descripciones/${editing.alertaId}/manual`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcionManual: descripcion,
          encajaCon: encajaConStr.split('\n').map(s => s.trim()).filter(Boolean),
          noEncajaCon: noEncajaConStr.split('\n').map(s => s.trim()).filter(Boolean)
        })
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      setEditing(null)
      fetch_()
    } catch (e) { alert('Error: ' + e.message) }
  }

  const descs = data?.descripciones || []
  const porEmail = {}
  for (const d of descs) {
    if (!porEmail[d.emailUsuario]) porEmail[d.emailUsuario] = []
    porEmail[d.emailUsuario].push(d)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-7 h-7 text-indigo-500" /> Descripciones de Alertas</h1>
          <p className="text-gray-400 text-sm mt-1">
            Descripción semántica de cada alerta (qué encaja / qué no), generada por LLM a partir de
            licitaciones que ya recibió el usuario. Se usa para filtrar matches por palabras antes del auto-envío.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refrescar
          </button>
          <button onClick={regenerarTodas} disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Regenerar {email ? 'de ' + email : 'todas'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="text-[11px] text-gray-500 uppercase">Filtrar por email</label>
        <div className="relative">
          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="vacío = todos"
            className="w-full md:w-96 bg-gray-800 border border-gray-700 rounded pl-7 pr-2 py-1.5 text-sm text-white placeholder-gray-600" />
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      {output && <pre className="bg-black/60 text-gray-300 text-[11px] leading-relaxed rounded-lg p-3 max-h-60 overflow-auto whitespace-pre-wrap">{output}</pre>}

      <div className="text-xs text-gray-400 bg-indigo-500/10 border border-indigo-500/20 rounded p-3">
        ℹ️ Cada alerta necesita ≥5 envíos históricos para generar una descripción. La descripción manual (si existe)
        sobreescribe la generada por el LLM. El agente decisor de auto-envío usa la descripción activa para validar
        cada licitación nueva antes de mandarla.
      </div>

      {descs.length === 0 && !loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-sm text-gray-500">
          Sin descripciones generadas todavía. Apretá "Regenerar" para empezar.
        </div>
      ) : Object.entries(porEmail).map(([eml, lista]) => (
        <div key={eml} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">{eml}</h2>
            <p className="text-[11px] text-gray-500">{lista.length} alerta(s) con descripción</p>
          </div>
          <div className="divide-y divide-gray-800">
            {lista.map(d => {
              const isEditing = editing?._id === d._id
              return (
                <div key={d._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        🎯 {d.alertaNombre || '(sin nombre)'}
                        {d.descripcionManual && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Manual</span>}
                        <span className="text-[10px] text-gray-500">• {d.ejemplosUsados} ejemplos</span>
                        <span className="text-[10px] text-gray-500">• {d.modeloUsado}</span>
                      </h3>

                      {isEditing ? (
                        <EditForm
                          initial={d}
                          onSave={saveManual}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <>
                          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                            {d.descripcionManual || d.descripcionGenerada || <span className="italic text-gray-500">(sin descripción)</span>}
                          </p>

                          <div className="grid md:grid-cols-2 gap-3 mt-3">
                            {d.encajaCon?.length > 0 && (
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
                                <p className="text-[11px] text-emerald-400 uppercase flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> Encaja con</p>
                                <ul className="text-xs text-gray-300 space-y-0.5">
                                  {d.encajaCon.map((e, i) => <li key={i}>• {e}</li>)}
                                </ul>
                              </div>
                            )}
                            {d.noEncajaCon?.length > 0 && (
                              <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
                                <p className="text-[11px] text-red-400 uppercase flex items-center gap-1 mb-1"><XCircle className="w-3 h-3" /> NO encaja con</p>
                                <ul className="text-xs text-gray-300 space-y-0.5">
                                  {d.noEncajaCon.map((e, i) => <li key={i}>• {e}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => setEditing(d)} title="Editar descripción manual"
                          className="px-2 py-1 rounded text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => regenerarUna(d.alertaId)} disabled={regenerating} title="Regenerar con LLM"
                          className="px-2 py-1 rounded text-[11px] font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center gap-1 disabled:opacity-50">
                          <Sparkles className="w-3 h-3" /> Regenerar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function EditForm({ initial, onSave, onCancel }) {
  const [descripcion, setDescripcion] = useState(initial.descripcionManual || initial.descripcionGenerada || '')
  const [encajaCon, setEncajaCon] = useState((initial.encajaCon || []).join('\n'))
  const [noEncajaCon, setNoEncajaCon] = useState((initial.noEncajaCon || []).join('\n'))

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className="text-[11px] text-gray-500 uppercase">Descripción manual (sobreescribe la generada)</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-emerald-400 uppercase">Encaja con (uno por línea)</label>
          <textarea value={encajaCon} onChange={e => setEncajaCon(e.target.value)} rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200" />
        </div>
        <div>
          <label className="text-[11px] text-red-400 uppercase">NO encaja con (uno por línea)</label>
          <textarea value={noEncajaCon} onChange={e => setNoEncajaCon(e.target.value)} rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 flex items-center gap-1"><X className="w-3 h-3" /> Cancelar</button>
        <button onClick={() => onSave(descripcion, encajaCon, noEncajaCon)} className="px-3 py-1.5 rounded text-xs text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"><Save className="w-3 h-3" /> Guardar</button>
      </div>
    </div>
  )
}
