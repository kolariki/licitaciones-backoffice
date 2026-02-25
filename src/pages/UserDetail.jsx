import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Crown, Bell, Calendar, Shield, Edit, Save, X, Trash2, Clock } from 'lucide-react'
import { API_URL } from '../config'

export default function UserDetail() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/dashboard/usuarios`).then(r => r.json()),
      fetch(`${API_URL}/api/dashboard/usuarios/${userId}/alertas`).then(r => r.json()).catch(() => ({ alertas: [] }))
    ]).then(([usersData, alertsData]) => {
      const u = (usersData.users || []).find(u => u._id === userId)
      setUser(u || null)
      setAlerts(alertsData.alertas || [])
      if (u) setEditForm({ nombre: u.nombre, email: u.email, pais: u.pais, suscripcion: u.nivelSuscripcion || u.rol })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/dashboard/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const d = await res.json()
      if (d.success) {
        setUser({ ...user, ...editForm })
        setEditing(false)
        setMsg({ type: 'success', text: 'Usuario actualizado' })
      } else {
        setMsg({ type: 'error', text: d.mensaje || 'Error' })
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de conexión' })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <div className="text-center py-20 text-gray-500">Usuario no encontrado</div>

  const isPremium = user.nivelSuscripcion === 'premium' || user.rol === 'premium'

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a usuarios
      </Link>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      {/* User Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isPremium ? 'bg-purple-600/30 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
              {user.nombre?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              {editing ? (
                <input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="text-xl font-bold bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              ) : (
                <h2 className="text-xl font-bold">{user.nombre}</h2>
              )}
              <p className="text-gray-400 flex items-center gap-1 mt-1"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> País</p>
            {editing ? (
              <select value={editForm.pais} onChange={e => setEditForm({...editForm, pais: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                <option value="costa_rica">Costa Rica</option>
                <option value="argentina">Argentina</option>
              </select>
            ) : (
              <p className="text-sm font-medium">{user.pais === 'costa_rica' ? 'Costa Rica' : user.pais === 'argentina' ? 'Argentina' : user.pais}</p>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Crown className="w-3 h-3" /> Plan</p>
            {editing ? (
              <select value={editForm.suscripcion} onChange={e => setEditForm({...editForm, suscripcion: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            ) : (
              <p className={`text-sm font-medium ${isPremium ? 'text-purple-400' : ''}`}>{isPremium ? '★ Premium' : 'Free'}</p>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Bell className="w-3 h-3" /> Alertas</p>
            <p className="text-sm font-medium">{user.alertasCount || 0} configuradas</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Registro</p>
            <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> Alertas del usuario</h3>
          <span className="text-xs text-gray-500">{alerts.length} alertas</span>
        </div>
        <div className="divide-y divide-gray-800">
          {alerts.map((a, i) => (
            <div key={a._id || i} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{a.nombre || 'Alerta sin nombre'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.activa ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  {a.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.palabrasClaveArray?.map((kw, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded">{kw}</span>
                ))}
                {a.codigos?.map((c, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded font-mono">{c}</span>
                ))}
              </div>
              {a.frecuencia && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Frecuencia: {a.frecuencia}</p>}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-center text-gray-500 py-8">Este usuario no tiene alertas configuradas</p>
          )}
        </div>
      </div>
    </div>
  )
}
