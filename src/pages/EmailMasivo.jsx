import React, { useState, useEffect, useRef } from 'react'
import { Mail, Send, Loader2, Users, CheckCircle, XCircle, Eye, AlertTriangle, Upload, Image } from 'lucide-react'
import { API_URL } from '../config'

const EMAIL_TEMPLATES = {
  nuevasFuncionalidades: {
    nombre: 'Nuevas Funcionalidades - Precios + Recomendaciones',
    asunto: 'Nuevas Funcionalidades en Elevum Licitaciones',
    generarHTML: (logoUrl) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0C74B4 0%, #1a3a5c 100%); padding: 32px 40px 28px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.15); border-radius: 10px; padding: 8px;">
                    <img src="${logoUrl}" alt="Elevum" width="28" height="28" style="display: block;">
                  </td>
                  <td style="padding-left: 10px; font-size: 15px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                    ELEVUM LICITACIONES
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0 0 6px; font-size: 26px; font-weight: 800; color: #ffffff;">
                Nuevas Funcionalidades
              </h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.75);">
                Elevum Licitaciones sigue mejorando para vos
              </p>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding: 32px 40px 24px;">
              <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.6;">Hola,</p>
              <p style="margin: 12px 0 0; font-size: 15px; color: #555; line-height: 1.6;">
                Te contamos las <strong style="color: #1a3a5c;">nuevas funcionalidades</strong> que agregamos a la plataforma para que puedas sacarle el mayor provecho a tus licitaciones.
              </p>
            </td>
          </tr>

          <!-- FEATURE 1: PRECIOS -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0C74B4, #1a3a5c); color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px;">
                    NUEVA FUNCIONALIDAD
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a3a5c;">
                Precios Hist&oacute;ricos y &Uacute;ltima Oferta Ganadora
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; color: #666; line-height: 1.6;">
                Ahora al ver los <strong>productos de una licitaci&oacute;n</strong>, pod&eacute;s consultar directamente los precios hist&oacute;ricos de cada c&oacute;digo de producto y analizar la &uacute;ltima oferta ganadora.
              </p>
              <div id="screenshot-precios-placeholder" style="background: #f0f6fb; border-radius: 12px; padding: 24px; text-align: center; color: #0C74B4; font-size: 13px;">
                [Imagen: Precios Hist&oacute;ricos - se adjuntar&aacute; al enviar]
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Precio promedio, m&iacute;nimo y m&aacute;ximo</strong> de contratos anteriores</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>&Uacute;ltimo precio pagado</strong> para tener referencia actualizada</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Analizar la &uacute;ltima oferta ganadora</strong> para entender c&oacute;mo gan&oacute;</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Crear alertas directamente</strong> desde el c&oacute;digo de producto</td>
                </tr></table></td></tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding: 0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top: 2px solid #f0f2f5; height: 1px;">&nbsp;</td></tr></table></td></tr>

          <!-- FEATURE 2: RECOMENDACIONES -->
          <tr>
            <td style="padding: 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0C74B4, #1a3a5c); color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px;">
                    NUEVA FUNCIONALIDAD
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a3a5c;">
                Recomendaciones de Licitaciones
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; color: #666; line-height: 1.6;">
                Una nueva secci&oacute;n que te muestra autom&aacute;ticamente <strong>licitaciones abiertas que coinciden con tus alertas configuradas</strong>. No ten&eacute;s que buscar m&aacute;s: las oportunidades llegan a vos.
              </p>
              <div id="screenshot-recomendaciones-placeholder" style="background: #f0f6fb; border-radius: 12px; padding: 24px; text-align: center; color: #0C74B4; font-size: 13px;">
                [Imagen: Recomendaciones - se adjuntar&aacute; al enviar]
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Basado en tus alertas:</strong> usa tus palabras clave y c&oacute;digos configurados</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Agrupado por alerta:</strong> licitaciones organizadas por cada alerta</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Acci&oacute;n directa:</strong> guard&aacute; favoritos, ve detalles o gener&aacute; informes</td>
                </tr></table></td></tr>
                <tr><td style="padding: 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td style="vertical-align: top; padding-right: 10px; color: #0C74B4; font-size: 16px;">&#10003;</td>
                  <td style="font-size: 13.5px; color: #444; line-height: 1.5;"><strong>Actualizaci&oacute;n diaria:</strong> se refresca autom&aacute;ticamente cada 24 horas</td>
                </tr></table></td></tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 8px 40px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0C74B4 0%, #1a3a5c 100%); border-radius: 12px; padding: 16px 48px;">
                    <a href="https://elevum-licitaciones.web.app/recomendaciones" target="_blank" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Probar Recomendaciones &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background: #1a3a5c; padding: 32px 40px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.15); border-radius: 8px; padding: 6px;">
                    <img src="${logoUrl}" alt="Elevum" width="22" height="22" style="display: block;">
                  </td>
                  <td style="padding-left: 8px; font-size: 14px; font-weight: 700; color: #ffffff;">
                    Elevum Licitaciones
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; font-size: 12px; color: rgba(255,255,255,0.5);">
                Inteligencia para licitaciones p&uacute;blicas
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;">
                <tr>
                  <td style="padding: 0 8px;"><a href="https://elevum-licitaciones.web.app" target="_blank" style="color: rgba(255,255,255,0.6); text-decoration: none; font-size: 12px;">Plataforma</a></td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;"><a href="https://elevum-licitaciones.web.app/alertas" target="_blank" style="color: rgba(255,255,255,0.6); text-decoration: none; font-size: 12px;">Mis Alertas</a></td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;"><a href="https://elevum-licitaciones.web.app/recomendaciones" target="_blank" style="color: rgba(255,255,255,0.6); text-decoration: none; font-size: 12px;">Recomendaciones</a></td>
                </tr>
              </table>
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.5;">
                Recibiste este email porque ten&eacute;s una cuenta en Elevum Licitaciones.<br>
                &copy; 2025 Elevum. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
}

// Logo de Elevum como data URI (blanco para fondos oscuros)
const ELEVUM_LOGO_URL = 'https://elevum-licitaciones.web.app/images/elevum.png'

export default function EmailMasivo() {
  const [destinatarios, setDestinatarios] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState(['premium', 'max', 'elevum'])
  const [emailTest, setEmailTest] = useState('ivankolariki1990@gmail.com')
  const [selectedTemplate, setSelectedTemplate] = useState('nuevasFuncionalidades')
  const [asuntoCustom, setAsuntoCustom] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [screenshotPrecios, setScreenshotPrecios] = useState(null)
  const [screenshotRecomendaciones, setScreenshotRecomendaciones] = useState(null)
  const preciosInputRef = useRef(null)
  const recomendacionesInputRef = useRef(null)

  useEffect(() => {
    fetchDestinatarios()
  }, [])

  const fetchDestinatarios = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/email-masivo/destinatarios`)
      const data = await res.json()
      if (data.success) setDestinatarios(data)
    } catch (e) {
      console.error('Error:', e)
    }
    setLoading(false)
  }

  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setter(ev.target.result)
    reader.readAsDataURL(file)
  }

  const getHTMLContent = () => {
    const template = EMAIL_TEMPLATES[selectedTemplate]
    let html = template.generarHTML(ELEVUM_LOGO_URL)

    // Reemplazar placeholders con imágenes subidas
    if (screenshotPrecios) {
      html = html.replace(
        /<div id="screenshot-precios-placeholder"[^>]*>[\s\S]*?<\/div>/,
        `<img src="${screenshotPrecios}" alt="Precios Históricos" width="100%" style="display: block; border-radius: 8px; border: 1px solid #e0e4e8;">`
      )
    }
    if (screenshotRecomendaciones) {
      html = html.replace(
        /<div id="screenshot-recomendaciones-placeholder"[^>]*>[\s\S]*?<\/div>/,
        `<img src="${screenshotRecomendaciones}" alt="Recomendaciones" width="100%" style="display: block; border-radius: 8px; border: 1px solid #e0e4e8;">`
      )
    }

    return html
  }

  const getAsunto = () => asuntoCustom || EMAIL_TEMPLATES[selectedTemplate].asunto

  const enviarTest = async () => {
    setSendingTest(true)
    setResultado(null)
    try {
      const res = await fetch(`${API_URL}/api/email-masivo/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asunto: getAsunto(),
          htmlContent: getHTMLContent(),
          emailTest,
        }),
      })
      const data = await res.json()
      setResultado({ tipo: 'test', ...data })
    } catch (e) {
      setResultado({ tipo: 'test', success: false, error: e.message })
    }
    setSendingTest(false)
  }

  const enviarMasivo = async () => {
    if (!window.confirm(`¿Enviar email a todos los usuarios con rol: ${selectedRoles.join(', ')}?`)) return
    setSending(true)
    setResultado(null)
    try {
      const res = await fetch(`${API_URL}/api/email-masivo/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asunto: getAsunto(),
          htmlContent: getHTMLContent(),
          roles: selectedRoles,
        }),
      })
      const data = await res.json()
      setResultado({ tipo: 'masivo', ...data })
    } catch (e) {
      setResultado({ tipo: 'masivo', success: false, error: e.message })
    }
    setSending(false)
  }

  const toggleRole = (rol) => {
    setSelectedRoles(prev =>
      prev.includes(rol) ? prev.filter(r => r !== rol) : [...prev, rol]
    )
  }

  const totalSeleccionados = selectedRoles.reduce((sum, rol) => {
    const grupo = destinatarios?.porRol?.[rol]
    return sum + (grupo?.length || 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Mail className="w-7 h-7 text-blue-500" />
          Email Masivo
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Enviar emails de novedades y funcionalidades a usuarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Template & Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template selector */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Template</h3>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm"
            >
              {Object.entries(EMAIL_TEMPLATES).map(([key, tmpl]) => (
                <option key={key} value={key}>{tmpl.nombre}</option>
              ))}
            </select>

            <div className="mt-3">
              <label className="text-xs text-gray-400">Asunto (dejar vacío para usar el del template)</label>
              <input
                type="text"
                value={asuntoCustom}
                onChange={(e) => setAsuntoCustom(e.target.value)}
                placeholder={EMAIL_TEMPLATES[selectedTemplate].asunto}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500"
              />
            </div>
          </div>

          {/* Image uploads */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Capturas de Pantalla
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Screenshot Precios */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Precios Históricos</label>
                <input
                  ref={preciosInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setScreenshotPrecios)}
                  className="hidden"
                />
                {screenshotPrecios ? (
                  <div className="relative group">
                    <img src={screenshotPrecios} alt="Precios" className="rounded-lg border border-gray-600 w-full" />
                    <button
                      onClick={() => setScreenshotPrecios(null)}
                      className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => preciosInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <span className="text-sm text-gray-400">Subir captura</span>
                  </button>
                )}
              </div>

              {/* Screenshot Recomendaciones */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Recomendaciones</label>
                <input
                  ref={recomendacionesInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setScreenshotRecomendaciones)}
                  className="hidden"
                />
                {screenshotRecomendaciones ? (
                  <div className="relative group">
                    <img src={screenshotRecomendaciones} alt="Recomendaciones" className="rounded-lg border border-gray-600 w-full" />
                    <button
                      onClick={() => setScreenshotRecomendaciones(null)}
                      className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => recomendacionesInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <span className="text-sm text-gray-400">Subir captura</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview button */}
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            {previewOpen ? 'Ocultar Preview' : 'Ver Preview'}
          </button>

          {previewOpen && (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-600">
              <div
                dangerouslySetInnerHTML={{ __html: getHTMLContent() }}
                style={{ maxHeight: '600px', overflowY: 'auto' }}
              />
            </div>
          )}
        </div>

        {/* Column 2: Destinatarios & Enviar */}
        <div className="space-y-4">
          {/* Roles */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Destinatarios por Rol
            </h3>
            <div className="space-y-2">
              {destinatarios?.roles?.map(({ rol, cantidad }) => (
                <label key={rol} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(rol)}
                    onChange={() => toggleRole(rol)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-sm text-gray-300 flex-1 capitalize">{rol}</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">{cantidad}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Total seleccionados: <span className="text-white font-semibold">{totalSeleccionados}</span>
              </p>
            </div>
          </div>

          {/* Test email */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Email de Prueba</h3>
            <input
              type="email"
              value={emailTest}
              onChange={(e) => setEmailTest(e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 mb-3"
            />
            <button
              onClick={enviarTest}
              disabled={sendingTest || !emailTest}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar Prueba
            </button>
          </div>

          {/* Enviar masivo */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <button
              onClick={enviarMasivo}
              disabled={sending || totalSeleccionados === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar a {totalSeleccionados} usuarios
                </>
              )}
            </button>
            {totalSeleccionados > 10 && (
              <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Emails masivos pueden demorar (~0.5s por email)
              </p>
            )}
          </div>

          {/* Resultado */}
          {resultado && (
            <div className={`rounded-xl p-4 border ${resultado.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {resultado.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold text-sm ${resultado.success ? 'text-green-400' : 'text-red-400'}`}>
                  {resultado.success ? 'Enviado' : 'Error'}
                </span>
              </div>
              {resultado.tipo === 'test' && (
                <p className="text-sm text-gray-300">{resultado.message || resultado.error}</p>
              )}
              {resultado.tipo === 'masivo' && resultado.success && (
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Enviados: {resultado.enviados}/{resultado.totalDestinatarios}</p>
                  {resultado.fallidos > 0 && <p className="text-red-400">Fallidos: {resultado.fallidos}</p>}
                </div>
              )}
              {resultado.error && resultado.tipo === 'masivo' && (
                <p className="text-sm text-red-400">{resultado.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
