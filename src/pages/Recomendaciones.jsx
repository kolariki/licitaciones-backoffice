import React, { useState } from 'react'
import { Send, Plus, X, Mail, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { API_URL } from '../config'
import { useAuth } from '../hooks/useAuth'

export default function Recomendaciones() {
  const { token } = useAuth()
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [licitaciones, setLicitaciones] = useState([''])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const addField = () => setLicitaciones([...licitaciones, ''])
  const removeField = (i) => setLicitaciones(licitaciones.filter((_, j) => j !== i))
  const updateField = (i, val) => {
    const copy = [...licitaciones]
    copy[i] = val
    setLicitaciones(copy)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const nums = licitaciones.map(l => l.trim()).filter(Boolean)
    if (!nums.length || !email) return

    setSending(true)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/api/recomendaciones/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-auth-token': token } : {})
        },
        body: JSON.stringify({
          numerosLicitaciones: nums,
          email,
          nombre: nombre || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        setResult({ type: 'success', text: `Recomendaciones enviadas a ${email}` })
        setHistory(prev => [{ email, nombre, licitaciones: nums, date: new Date() }, ...prev])
        setEmail('')
        setNombre('')
        setLicitaciones([''])
      } else {
        setResult({ type: 'error', text: data.error || data.mensaje || 'Error al enviar' })
      }
    } catch (e) {
      setResult({ type: 'error', text: 'Error de conexión' })
    }
    setSending(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Recomendaciones</h1>
        <p className="text-gray-400 text-sm mt-1">Enviar recomendaciones de licitaciones por email</p>
      </div>

      <form onSubmit={handleSend} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        {result && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            result.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {result.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email destino *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="usuario@empresa.com"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Números de licitaciones *</label>
          <div className="space-y-2">
            {licitaciones.map((val, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={val}
                  onChange={e => updateField(i, e.target.value)}
                  placeholder="2025LD-000111-0001102304"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                />
                {licitaciones.length > 1 && (
                  <button type="button" onClick={() => removeField(i)} className="px-2 text-gray-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {licitaciones.length < 10 && (
            <button type="button" onClick={addField} className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3.5 h-3.5" /> Agregar otra licitación
            </button>
          )}
          <p className="text-xs text-gray-600 mt-1">Máximo 10 licitaciones por envío</p>
        </div>

        <button
          type="submit"
          disabled={sending || !email || !licitaciones.some(l => l.trim())}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Enviando...' : 'Enviar Recomendaciones'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="font-semibold text-sm">Enviados en esta sesión</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {history.map((h, i) => (
              <div key={i} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{h.email} {h.nombre && <span className="text-gray-500">({h.nombre})</span>}</span>
                  <span className="text-xs text-gray-500">{h.date.toLocaleTimeString('es')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {h.licitaciones.map((l, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
