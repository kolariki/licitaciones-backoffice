import React, { useState, useEffect, useCallback } from 'react'
import { Play, Loader2, CheckCircle2, XCircle, Clock, Server, Search, Bell, Calendar, Star, FileText, Download, BarChart3, Hash, Database, RefreshCw, Activity } from 'lucide-react'

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
    id: 'completarDatos',
    name: 'Completar Datos de Licitaciones Incompletas',
    desc: 'Busca licitaciones con datos faltantes y las completa consultando SICOP directamente vía proxy.',
    icon: Database,
    features: ['Detecta TITULO_NO_DISPONIBLE, fechas nulas, etc.', 'Consulta SICOP proxy por cada licitación', 'Extrae título, entidad, fechas, monto, estado', 'Actualiza los registros en la BD'],
    endpoint: '/api/licitaciones/completar-datos',
    color: 'lime'
  }
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
}

function ScraperCard({ scraper, serverStatus, onRun }) {
  const [running, setRunning] = useState(false)
  const [runningExtra, setRunningExtra] = useState(false)
  const [result, setResult] = useState(null)
  const [resultExtra, setResultExtra] = useState(null)

  const status = scraper.statusKey ? serverStatus?.scrapers?.[scraper.statusKey] : null
  const Icon = scraper.icon

  const execute = async (endpoint, isExtra = false) => {
    const setR = isExtra ? setRunningExtra : setRunning
    const setRes = isExtra ? setResultExtra : setResult
    setR(true)
    setRes(null)
    try {
      const r = await fetch(`${SCRAPER_URL}${endpoint}`, { method: 'POST' })
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

            {/* Results */}
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
    const interval = setInterval(fetchStatus, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchStatus])

  const stats = serverStatus?.stats || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scraper Principal</h1>
          <p className="text-gray-400 text-sm mt-1">Panel de control del servidor de scraping SICOP</p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refrescar
        </button>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
