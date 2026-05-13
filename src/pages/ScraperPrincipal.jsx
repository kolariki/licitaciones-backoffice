import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Loader2, CheckCircle2, XCircle, Clock, Server, Search, Bell, Calendar, Star, FileText, Download, BarChart3, Hash, Database, RefreshCw, Activity, Terminal, ChevronDown, ChevronUp, Zap, FlaskConical, Send, Eye, GitCompare, Trash2, Copy, AlarmClockCheck } from 'lucide-react'
import { API_URL } from '../config'

const SCRAPER_URL = 'https://web-production-0dbf.up.railway.app'

const SCRAPERS = [
  {
    id: 'principal',
    name: 'Scraper Principal',
    desc: 'Extrae licitaciones nuevas de SICOP de forma programada.',
    icon: Server,
    features: ['Extracción automática de licitaciones', 'Múltiples ejecuciones diarias', 'Datos completos de SICOP', 'Almacenamiento en MongoDB'],
    endpoint: '/api/scrapers/principal/run',
    statusKey: 'principal',
    color: 'blue'
  },
  {
    id: 'faltantes',
    name: 'Scraper Faltantes',
    desc: 'Busca y extrae licitaciones específicas que no fueron capturadas por el scraper principal.',
    icon: Search,
    features: ['Búsqueda específica', 'Filtros avanzados', 'Datos complementarios', 'Ejecución automática cada 2 horas'],
    endpoint: '/api/scrapers/faltantes/run',
    statusKey: 'faltantes',
    color: 'purple',
    extraButton: { label: 'Ejecutar Scraper Maestro', endpoint: '/api/scrapers/maestro/run' }
  },
  {
    id: 'alertas',
    name: 'Verificación de Alertas',
    desc: 'Verifica alertas configuradas por usuarios contra licitaciones recientes y envía notificaciones.',
    icon: Bell,
    features: ['Búsqueda por palabras clave', 'Notificaciones por email', 'Push notifications', 'Ejecución automática'],
    endpoint: '/api/alertas/run',
    statusKey: 'alertas',
    color: 'amber'
  },
  {
    id: 'vencimientos',
    name: 'Notificaciones de Vencimiento',
    desc: 'Envía notificaciones a usuarios sobre favoritos próximos a vencer (2 días o menos).',
    icon: Clock,
    features: ['Alertas de vencimiento', 'Emails personalizados', 'Filtros por usuario', 'Ejecución automática'],
    endpoint: '/api/vencimientos/run',
    statusKey: 'vencimientos',
    color: 'red'
  },
  {
    id: 'favoritos',
    name: 'Actualización de Estados de Favoritos',
    desc: 'Actualiza estados de licitaciones favoritas de Costa Rica verificando cambios en SICOP.',
    icon: Star,
    features: ['Solo favoritos de Costa Rica', 'Sincronización de estados', 'Notificaciones por email', 'Ejecución automática a las 18:00'],
    endpoint: '/api/favoritos/run',
    statusKey: 'favoritos',
    color: 'yellow'
  },
  {
    id: 'fechasApertura',
    name: 'Actualización de Fechas de Apertura',
    desc: 'Extrae y actualiza fechas de apertura de licitaciones de SICOP comparándolas con la base de datos.',
    icon: Calendar,
    features: ['Extracción de fechas de apertura', 'Comparación automática con BD', 'Actualización de cambios detectados', 'Ejecución automática a las 2:00 AM'],
    endpoint: '/api/fechas-apertura/run',
    statusKey: 'fechasApertura',
    color: 'cyan'
  },
  {
    id: 'compararDocs',
    name: 'Comparación de Documentos 2026',
    desc: 'Compara documentos esperados vs reales en licitaciones de 2026 y muestra discrepancias.',
    icon: FileText,
    features: ['Comparación licitacionesCR vs documentaciones', 'Solo licitaciones del año 2026', 'Lista documentos faltantes', 'Genera JSON con discrepancias'],
    endpoint: '/api/comparar-documentos',
    color: 'emerald'
  },
  {
    id: 'completarDocs',
    name: 'Completar Documentos Faltantes',
    desc: 'Lee JSON de discrepancias y descarga solo los documentos faltantes para completar la documentación.',
    icon: Download,
    features: ['Lee JSON de discrepancias', 'Descarga solo documentos faltantes', 'Convierte PDFs a JSON', 'Importa a colección documentaciones'],
    endpoint: '/api/completar-documentos',
    color: 'teal'
  },
  {
    id: 'descargarDocsJson',
    name: 'Descargar Documentos desde JSON',
    desc: 'Lee el JSON generado por el scraper específico y descarga todos los documentos.',
    icon: Download,
    features: ['Lee JSON de licitaciones con documentos', 'Usa API Proxy cuando hay SICOP ID', 'Convierte PDFs a JSON', 'Borra JSON al finalizar'],
    endpoint: '/api/descargar-documentos-json',
    color: 'indigo'
  },
  {
    id: 'reporteHoy',
    name: 'Reporte de Licitaciones de Hoy',
    desc: 'Genera reporte con todas las licitaciones extraídas hoy, incluyendo info de documentos.',
    icon: BarChart3,
    features: ['Filtra licitaciones del día actual', 'Incluye documentos esperados y reales', 'Muestra estadísticas de completitud', 'Guarda en formato JSON'],
    endpoint: '/api/generar-reporte-licitaciones-hoy',
    color: 'orange'
  },
  {
    id: 'codigosProductos',
    name: 'Actualizar Códigos de Productos Faltantes',
    desc: 'Busca licitaciones sin códigos de productos y los extrae del HTML almacenado en la BD.',
    icon: Hash,
    features: ['Busca licitaciones sin códigos del año actual', 'Extrae códigos del HTML almacenado', 'Actualiza automáticamente en la BD', 'Muestra resumen de actualizaciones'],
    endpoint: '/api/actualizar-codigos-productos',
    statusKey: 'codigosProductos',
    color: 'pink'
  },
  {
    id: 'codigosClasificacion',
    name: 'Verificar e Insertar Códigos de Clasificación',
    desc: 'Extrae códigos únicos de licitaciones, verifica cuáles faltan y los busca en SICOP con Puppeteer.',
    icon: Hash,
    features: ['Extrae códigos únicos de licitaciones', 'Compara con codigos_clasificacion', 'Busca faltantes en SICOP automáticamente', 'Inserta nuevos códigos en la BD'],
    endpoint: '/api/codigos/verificar',
    color: 'violet'
  },
  {
    id: 'clasificacionProductos',
    name: 'Buscar Clasificación de Productos Faltantes',
    desc: 'Busca en productos_sicop los que no tienen match en codigos_clasificacion y los busca en SICOP.',
    icon: Search,
    features: ['Detecta prefijos sin código de clasificación', 'Busca automáticamente en SICOP con Puppeteer', 'Inserta códigos encontrados en la BD', 'Progreso en tiempo real'],
    endpoint: '/api/codigos/buscar-clasificacion-faltantes',
    statusEndpoint: '/api/codigos/buscar-clasificacion-faltantes/status',
    color: 'rose'
  },
  {
    id: 'completarDatos',
    name: 'Completar Datos de Licitaciones Incompletas',
    desc: 'Busca licitaciones con datos faltantes y las completa consultando SICOP directamente vía proxy.',
    icon: Database,
    features: ['Detecta TITULO_NO_DISPONIBLE, fechas nulas, etc.', 'Consulta SICOP proxy por cada licitación', 'Extrae título, entidad, fechas, monto, estado', 'Actualiza los registros en la BD'],
    endpoint: '/api/licitaciones/completar-datos',
    color: 'lime'
  },
  {
    // 🔄 Detector semanal de prórrogas/extensiones SICOP
    // Vive en `licitaciones-back` (NO en scraper-service) → usamos baseUrl override.
    // Cron automático: lunes 6 AM hora Costa Rica. Este botón es para correrlo manualmente.
    id: 'detectarExtensiones',
    name: 'Detectar Prórrogas / Extensiones SICOP',
    desc: 'Busca licitaciones que la institución extendió tras la fecha de cierre original, actualiza la fechaCierre en la BD y notifica por email a los usuarios que las tienen en favoritos.',
    icon: AlarmClockCheck,
    features: [
      'Recorre 100 páginas (~1000 resultados) de /concursos',
      'Compara con licitaciones cuya fechaCierre cae en ventana de 7 días',
      'Actualiza fechaCierre y agrega al historialFechaCierre[]',
      'Notifica por email a usuarios con la licitación en favoritos',
      'Si estaba "cerrada" y se prorrogó, vuelve a "abierta"',
      '🕒 Cron automático: Lunes 6:00 AM Costa Rica'
    ],
    endpoint: '/api/admin/detectar-extensiones',
    baseUrl: API_URL,            // 👈 sobreescribe SCRAPER_URL → va a licitaciones-back
    color: 'amber'
  }
]

const CHAIN_STEPS = [
  { id: 'faltantes', name: 'Scraper Faltantes', endpoint: '/api/scrapers/faltantes/run' },
  { id: 'codigosProductos', name: 'Actualizar Códigos de Productos', endpoint: '/api/actualizar-codigos-productos' },
  { id: 'codigosClasificacion', name: 'Verificar Códigos de Clasificación', endpoint: '/api/codigos/verificar' },
  { id: 'alertas', name: 'Verificación de Alertas (genera preview)', endpoint: '/api/alertas/run' },
]

const colorMap = {
  blue: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
  amber: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-600/20 text-red-400 border-red-500/30',
  yellow: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
  cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
  emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
  teal: 'bg-teal-600/20 text-teal-400 border-teal-500/30',
  indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
  orange: 'bg-orange-600/20 text-orange-400 border-orange-500/30',
  pink: 'bg-pink-600/20 text-pink-400 border-pink-500/30',
  violet: 'bg-violet-600/20 text-violet-400 border-violet-500/30',
  lime: 'bg-lime-600/20 text-lime-400 border-lime-500/30',
  rose: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
}

const btnColorMap = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  amber: 'bg-amber-600 hover:bg-amber-700',
  red: 'bg-red-600 hover:bg-red-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  cyan: 'bg-cyan-600 hover:bg-cyan-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  teal: 'bg-teal-600 hover:bg-teal-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  violet: 'bg-violet-600 hover:bg-violet-700',
  lime: 'bg-lime-600 hover:bg-lime-700',
  rose: 'bg-rose-600 hover:bg-rose-700',
}

function ScraperCard({ scraper, serverStatus }) {
  const [running, setRunning] = useState(false)
  const [runningExtra, setRunningExtra] = useState(false)
  const [result, setResult] = useState(null)
  const [resultExtra, setResultExtra] = useState(null)
  const [maxPages, setMaxPages] = useState(scraper.id === 'faltantes' ? 25 : 5)
  const [horasAtras, setHorasAtras] = useState(8)

  const status = scraper.statusKey ? serverStatus?.scrapers?.[scraper.statusKey] : null
  const Icon = scraper.icon

  const execute = async (endpoint, isExtra = false) => {
    const setR = isExtra ? setRunningExtra : setRunning
    const setRes = isExtra ? setResultExtra : setResult
    setR(true)
    setRes(null)
    try {
      let body = undefined
      if ((scraper.id === 'principal' || scraper.id === 'faltantes') && !isExtra) {
        body = JSON.stringify({ maxPages })
      } else if (scraper.id === 'alertas' && !isExtra) {
        body = JSON.stringify({ horasAtras })
      } else if (scraper.id === 'detectarExtensiones' && !isExtra) {
        body = JSON.stringify({
          ventanaDias: 7,
          maxPaginas: 100,
          dryRun: false,
          skipNotify: false
        })
      }

      // Algunos scrapers viven en licitaciones-back en vez del scraper-service
      // y sobreescriben la baseUrl (ej. detector de prórrogas).
      const base = scraper.baseUrl || SCRAPER_URL
      const r = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body
      })
      const d = await r.json()
      setRes({ success: d.success !== false, message: d.message || (d.success !== false ? 'Ejecutado correctamente' : 'Error') })
    } catch (e) {
      setRes({ success: false, message: e.message })
    }
    setR(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl ${colorMap[scraper.color]} border flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">{scraper.name}</h3>
              {status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  status.running ? 'bg-blue-500/15 text-blue-400' :
                  status.enabled ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                  {status.running ? 'Ejecutando' : status.enabled ? 'Activo' : 'Inactivo'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-3">{scraper.desc}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {scraper.features.map((f, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded">{f}</span>
              ))}
            </div>

            {status?.cron && (
              <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Cron: <code className="text-gray-500">{status.cron}</code>
              </p>
            )}
            {status?.lastExecution && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Última: {new Date(status.lastExecution).toLocaleString('es')}
              </p>
            )}

            {result && (
              <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {result.success ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                {result.message}
              </div>
            )}
            {resultExtra && (
              <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${resultExtra.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {resultExtra.success ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                {resultExtra.message}
              </div>
            )}

            {(scraper.id === 'principal' || scraper.id === 'faltantes') && (
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-400">Páginas:</label>
                <input type="number" min={1} max={100} value={maxPages} onChange={e => setMaxPages(parseInt(e.target.value) || (scraper.id === 'principal' ? 5 : 25))}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center" />
              </div>
            )}
            {scraper.id === 'alertas' && (
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-400">Horas atrás:</label>
                <input type="number" min={1} max={720} value={horasAtras} onChange={e => setHorasAtras(parseInt(e.target.value) || 8)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => execute(scraper.endpoint)}
                disabled={running}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 ${btnColorMap[scraper.color]}`}
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? 'Ejecutando...' : `Ejecutar`}
              </button>
              {scraper.extraButton && (
                <button
                  onClick={() => execute(scraper.extraButton.endpoint, true)}
                  disabled={runningExtra}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {runningExtra ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {runningExtra ? 'Ejecutando...' : scraper.extraButton.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChainExecution({ onChainComplete }) {
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [stepResults, setStepResults] = useState({})

  const runChain = async () => {
    setRunning(true)
    setStepResults({})

    for (let i = 0; i < CHAIN_STEPS.length; i++) {
      const step = CHAIN_STEPS[i]
      setCurrentStep(i)
      try {
        const r = await fetch(`${SCRAPER_URL}${step.endpoint}`, { method: 'POST' })
        const d = await r.json()
        setStepResults(prev => ({ ...prev, [step.id]: { success: d.success !== false, message: d.message || 'OK' } }))
      } catch (e) {
        setStepResults(prev => ({ ...prev, [step.id]: { success: false, message: e.message } }))
        // Continue chain even on error
      }
    }

    setCurrentStep(CHAIN_STEPS.length)
    setRunning(false)
    if (onChainComplete) onChainComplete()
  }

  return (
    <div className="bg-gradient-to-r from-violet-500/5 to-amber-500/5 border border-violet-500/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-violet-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Cadena de Ejecución</h3>
            <p className="text-xs text-gray-400">Faltantes → Códigos Productos → Códigos Clasificación → Alertas (preview) · Cron: 12:00 y 18:00 CR</p>
          </div>
        </div>
        <button
          onClick={runChain}
          disabled={running}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-amber-600 hover:from-violet-700 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {running ? 'Ejecutando cadena...' : 'Ejecutar Cadena'}
        </button>
      </div>

      {(running || currentStep >= 0) && (
        <div className="space-y-2 mt-3">
          {CHAIN_STEPS.map((step, i) => {
            const result = stepResults[step.id]
            const isCurrent = i === currentStep && running
            const isDone = result !== undefined
            const isPending = i > currentStep

            return (
              <div key={step.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                isCurrent ? 'bg-blue-500/10 border border-blue-500/20' :
                isDone && result.success ? 'bg-green-500/5 border border-green-500/10' :
                isDone && !result.success ? 'bg-red-500/5 border border-red-500/10' :
                'bg-gray-800/30 border border-transparent'
              }`}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                  {isDone && result.success && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {isDone && !result.success && <XCircle className="w-4 h-4 text-red-400" />}
                  {isPending && <div className="w-2 h-2 rounded-full bg-gray-600" />}
                </div>
                <span className={`font-medium flex-1 ${isCurrent ? 'text-blue-400' : isDone ? (result.success ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
                  {step.name}
                </span>
                {isDone && <span className="text-gray-500 truncate max-w-[200px]">{result.message}</span>}
                {isCurrent && <span className="text-blue-400 animate-pulse">Ejecutando...</span>}
              </div>
            )
          })}
          {currentStep >= CHAIN_STEPS.length && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              ¡Cadena completada! Revisá Preview Alertas para enviar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ExtractSpecific() {
  const [numeros, setNumeros] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const ejecutar = async () => {
    const lista = numeros.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean)
    if (lista.length === 0) return
    if (lista.length > 20) { setResult({ success: false, message: 'Máximo 20 licitaciones por solicitud' }); return }
    
    setRunning(true)
    setResult(null)
    try {
      const r = await fetch(`${SCRAPER_URL}/api/scrapers/especifico/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeros: lista })
      })
      const d = await r.json()
      setResult({ success: d.success !== false, message: d.message || (d.success !== false ? `Scraper iniciado para ${lista.length} licitaciones` : 'Error') })
    } catch (e) {
      setResult({ success: false, message: e.message })
    }
    setRunning(false)
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">Extraer Licitación Específica</h3>
          <p className="text-xs text-gray-400 mb-3">Ingresá uno o más números de procedimiento para extraerlos de SICOP y guardarlos en la base de datos.</p>
          
          <textarea
            value={numeros}
            onChange={e => setNumeros(e.target.value)}
            placeholder="Ej: 2025LY-000007-0006100001&#10;2025CD-000123-0001200001&#10;(uno por línea o separados por coma)"
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-emerald-500/50 mb-3 resize-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={ejecutar}
              disabled={running || !numeros.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {running ? 'Extrayendo...' : 'Extraer de SICOP'}
            </button>
            <span className="text-xs text-gray-500">
              {numeros.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean).length} licitaciones
            </span>
          </div>

          {result && (
            <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {result.success ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ScraperPrincipal() {
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(() => {
    fetch(`${SCRAPER_URL}/api/status`)
      .then(r => r.json())
      .then(d => { setServerStatus(d.data || null); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const handleChainComplete = () => {
    // Signal to App.jsx that there are pending alerts
    window.dispatchEvent(new CustomEvent('alertas-pending'))
  }

  const stats = serverStatus?.stats || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scraper Principal</h1>
          <p className="text-gray-400 text-sm mt-1">Panel de control del servidor de scraping SICOP</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStatus} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refrescar
          </button>
          <button onClick={async () => {
            if (!window.confirm('¿Reiniciar todos los scrapers? Esto libera procesos trabados.')) return
            try {
              const r = await fetch(`${SCRAPER_URL}/api/scrapers/reset`, { method: 'POST' })
              const d = await r.json()
              alert(d.message || 'Reiniciado')
              fetchStatus()
            } catch(e) { alert('Error: ' + e.message) }
          }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-300 bg-red-900/30 hover:bg-red-900/50 border border-red-700 transition-colors">
            <Zap className="w-3.5 h-3.5" /> Reset Scrapers
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Extraer licitación específica */}
          <ExtractSpecific />

          {/* Chain execution */}
          <ChainExecution onChainComplete={handleChainComplete} />

          {/* 🧪 Test auto-envío Ivan ← Arboleda */}
          <TestIvanCard />

          {/* Server stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Estado</p>
              <p className="text-lg font-bold text-green-400">{serverStatus?.server?.isRunning ? 'Online' : 'Offline'}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Play className="w-3 h-3" /> Ejecuciones totales</p>
              <p className="text-2xl font-bold">{stats.totalExecutions || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Exitosas</p>
              <p className="text-2xl font-bold text-green-400">{stats.successfulExecutions || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> Fallidas</p>
              <p className="text-2xl font-bold text-red-400">{stats.failedExecutions || 0}</p>
            </div>
          </div>

          {/* Scraper cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SCRAPERS.map(s => (
              <ScraperCard key={s.id} scraper={s} serverStatus={serverStatus} />
            ))}
          </div>

          {/* Live Logs */}
          <LogsPanel />
        </>
      )}
    </div>
  )
}

// 🧪 Card del experimento "auto-envío de alta confianza" en cuenta de Ivan
function TestIvanCard() {
  const [estado, setEstado] = useState(null)
  const [busy, setBusy] = useState('')
  const [output, setOutput] = useState('')
  const [horasAtras, setHorasAtras] = useState(24)
  const [diasComparar, setDiasComparar] = useState(7)

  const refrescar = useCallback(async () => {
    setBusy('estado')
    try {
      const r = await fetch(`${SCRAPER_URL}/api/test-ivan/estado`)
      const d = await r.json()
      if (d.success) setEstado(d)
      else setOutput('No se pudo cargar estado: ' + (d.error || ''))
    } catch (e) {
      setOutput('Error: ' + e.message)
    } finally {
      setBusy('')
    }
  }, [])

  useEffect(() => { refrescar() }, [refrescar])

  const ejecutar = async (label, key, path, body) => {
    setBusy(key)
    setOutput(`▶ ${label}\n…`)
    try {
      const r = await fetch(`${SCRAPER_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {})
      })
      const d = await r.json()
      const out = (d.output || '').slice(-20000)
      setOutput(out + `\n──── exit=${d.code ?? '?'} ${d.success ? '✅' : '❌'} ────`)
    } catch (e) {
      setOutput('Error de conexión: ' + e.message)
    } finally {
      setBusy('')
      refrescar()
    }
  }

  const Btn = ({ id, onClick, color, icon: Icon, children, danger }) => (
    <button
      onClick={onClick}
      disabled={!!busy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 ${color}`}
    >
      {busy === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  )

  return (
    <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/30 border-2 border-dashed border-amber-600/50 rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">🧪 Test Auto-Envío (Ivan ← Arboleda)</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Experimental</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Experimento aislado del auto-envío de alta confianza usando alertas de
              <code className="mx-1 text-amber-400">cr.arboledaserena@gmail.com</code> clonadas en
              <code className="mx-1 text-amber-400">ivankolariki1990@gmail.com</code>.
              Cuando la cobertura supere el 90% pasamos a producción.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              <div className="bg-black/30 border border-amber-700/30 rounded-lg p-2">
                <p className="text-[10px] text-gray-500 uppercase">📥 Origen</p>
                <p className="text-sm font-bold text-white">{estado?.from?.alertas ?? '–'} alertas · {estado?.from?.perfiles ?? '–'} perfiles</p>
                <p className="text-[10px] text-gray-500">{estado?.from?.enviadas7d ?? '–'} envíos 7d</p>
              </div>
              <div className="bg-black/30 border border-amber-700/30 rounded-lg p-2">
                <p className="text-[10px] text-gray-500 uppercase">📤 Destino</p>
                <p className="text-sm font-bold text-white">{estado?.to?.alertas ?? '–'} alertas <span className="text-amber-400">({estado?.to?.alertasClonadas ?? '–'} clones)</span></p>
                <p className="text-[10px] text-gray-500">{estado?.to?.perfiles ?? '–'} perfiles <span className="text-amber-400">({estado?.to?.perfilesClonados ?? '–'} clones)</span> · {estado?.to?.enviadas7d ?? '–'} env 7d</p>
              </div>
              <div className="bg-black/30 border border-amber-700/30 rounded-lg p-2">
                <p className="text-[10px] text-gray-500 uppercase">📦 Payloads pendientes</p>
                <p className="text-sm font-bold text-white">{estado?.payloadsPendientes?.archivos ?? '–'} archivos · {estado?.payloadsPendientes?.total ?? '–'} lics</p>
                <p className="text-[10px] text-amber-400">🚦 alta {estado?.payloadsPendientes?.altas ?? '–'} · media {estado?.payloadsPendientes?.medias ?? '–'}</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
              <label className="flex items-center gap-2">
                <span className="text-gray-400">Horas atrás (verificar):</span>
                <input type="number" min={1} max={720} value={horasAtras}
                  onChange={e => setHorasAtras(parseInt(e.target.value) || 24)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-center" />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-gray-400">Días (comparar):</span>
                <input type="number" min={1} max={30} value={diasComparar}
                  onChange={e => setDiasComparar(parseInt(e.target.value) || 7)}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-center" />
              </label>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-2">
              <Btn id="estado" onClick={refrescar} color="bg-gray-700 hover:bg-gray-600" icon={RefreshCw}>Refrescar</Btn>
              <Btn id="clonar" onClick={() => ejecutar('Clonar alertas', 'clonar', '/api/test-ivan/clonar', {})} color="bg-blue-600 hover:bg-blue-700" icon={Copy}>Clonar alertas</Btn>
              <Btn id="reset" onClick={() => {
                if (!window.confirm('Borra todas las alertas con tag [CLONE-FROM-ARBOLEDA] de Ivan y las vuelve a clonar. ¿Continuar?')) return
                ejecutar('Reset y clonar', 'reset', '/api/test-ivan/clonar', { reset: true })
              }} color="bg-red-600 hover:bg-red-700" icon={Trash2}>Reset y clonar</Btn>
              <Btn id="verificar" onClick={() => ejecutar(`Verificar ${horasAtras}h`, 'verificar', '/api/test-ivan/verificar', { horasAtras })} color="bg-amber-600 hover:bg-amber-700" icon={Search}>Verificar ({horasAtras}h)</Btn>
              <Btn id="dry" onClick={() => ejecutar('Auto-enviar DRY', 'dry', '/api/test-ivan/auto-enviar', { dry: true })} color="bg-purple-600 hover:bg-purple-700" icon={Eye}>Auto-enviar DRY</Btn>
              <Btn id="real" onClick={() => {
                if (!window.confirm('Esto va a enviar emails REALES a ivankolariki1990@gmail.com con todas las licitaciones de alta confianza. ¿Continuar?')) return
                ejecutar('Auto-enviar REAL', 'real', '/api/test-ivan/auto-enviar', { dry: false })
              }} color="bg-emerald-600 hover:bg-emerald-700" icon={Send}>Auto-enviar REAL</Btn>
              <Btn id="comparar" onClick={() => ejecutar(`Comparar ${diasComparar}d`, 'comparar', '/api/test-ivan/comparar', { dias: diasComparar })} color="bg-cyan-600 hover:bg-cyan-700" icon={GitCompare}>Comparar ({diasComparar}d)</Btn>
            </div>

            {/* Output */}
            {output && (
              <pre className="mt-3 bg-black/60 text-gray-300 text-[11px] leading-relaxed rounded-lg p-3 max-h-80 overflow-auto whitespace-pre-wrap">
{output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LogsPanel() {
  const [logs, setLogs] = useState([])
  const [open, setOpen] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState('')
  const logRef = useRef(null)
  const intervalRef = useRef(null)

  const fetchLogs = useCallback(() => {
    fetch(`${SCRAPER_URL}/api/scrapers/logs?limit=100`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLogs(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      fetchLogs()
      intervalRef.current = setInterval(fetchLogs, 5000)
      return () => clearInterval(intervalRef.current)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [open, fetchLogs])

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filteredLogs = filter
    ? logs.filter(l => l.toLowerCase().includes(filter.toLowerCase()))
    : logs

  const getLogColor = (line) => {
    if (line.includes('[ERROR]') || line.includes('❌')) return 'text-red-400'
    if (line.includes('[WARN]') || line.includes('⚠')) return 'text-amber-400'
    if (line.includes('✅')) return 'text-green-400'
    if (line.includes('📊') || line.includes('📋')) return 'text-blue-400'
    return 'text-gray-400'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-800/30 transition-colors"
      >
        <Terminal className="w-5 h-5 text-green-400" />
        <span className="text-sm font-semibold text-white flex-1 text-left">Logs del Servidor</span>
        <span className="text-xs text-gray-500">{logs.length} líneas</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="border-t border-gray-800">
          <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-800/50">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="w-3 h-3 rounded" />
              Auto-scroll
            </label>
            <button onClick={fetchLogs} className="text-xs text-gray-500 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div ref={logRef} className="h-80 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
            {filteredLogs.length === 0 && (
              <p className="text-gray-600 text-center py-8">Sin logs disponibles</p>
            )}
            {filteredLogs.map((line, i) => (
              <div key={i} className={`${getLogColor(line)} leading-relaxed break-all`}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
