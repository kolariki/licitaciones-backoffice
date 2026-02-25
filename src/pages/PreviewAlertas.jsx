import React, { useState, useEffect } from 'react'
import { Bell, Send, Loader2, RefreshCw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

export default function PreviewAlertas() {
  const [regenerating, setRegenerating] = useState(false)
  const [runningAlertas, setRunningAlertas] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [result, setResult] = useState(null)

  const regenerarPreview = async () => {
    setRegenerating(true)
    setResult(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/regenerar-preview`, { method: 'POST' })
      const d = await r.json()
      if (d.success) {
        setResult({ success: true, message: 'Preview regenerado' })
        setIframeKey(k => k + 1) // force reload iframe
      } else {
        setResult({ success: false, message: d.error || 'Error' })
      }
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
      // After running alerts, regenerate preview and reload
      setTimeout(async () => {
        await fetch(`${SCRAPER_URL}/api/regenerar-preview`, { method: 'POST' })
        setIframeKey(k => k + 1)
      }, 2000)
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setRunningAlertas(false)
  }

  return (
    <div className={`space-y-4 ${fullscreen ? 'fixed inset-0 z-50 bg-gray-950 p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Preview de Alertas</h1>
          <p className="text-gray-400 text-sm mt-1">Revisa y envía alertas generadas a usuarios</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={ejecutarAlertas}
            disabled={runningAlertas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {runningAlertas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Verificar Alertas
          </button>
          <button
            onClick={regenerarPreview}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 transition-colors disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerar Preview
          </button>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recargar
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {fullscreen ? 'Salir' : 'Expandir'}
          </button>
          <a
            href={`${SCRAPER_URL}/preview-alertas.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir en nueva pestaña
          </a>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div className={`text-xs px-3 py-2 rounded-lg ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {result.message}
        </div>
      )}

      {/* Embedded preview */}
      <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${fullscreen ? 'flex-1 h-[calc(100vh-130px)]' : ''}`}>
        <iframe
          key={iframeKey}
          src={`${SCRAPER_URL}/preview-alertas.html`}
          className={`w-full border-0 ${fullscreen ? 'h-full' : 'h-[calc(100vh-220px)] min-h-[600px]'}`}
          title="Preview de Alertas"
        />
      </div>
    </div>
  )
}
