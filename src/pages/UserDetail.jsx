import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Crown, Bell, Calendar, Edit, Save, X, Trash2, Clock, Plus, Search, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
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

  // Alert form state
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState(null)
  const [alertForm, setAlertForm] = useState({ nombre: '', tipo: 'keywords', palabrasClaveArray: [''], codigos: [''], activa: true, frecuencia: 'daily' })
  const [savingAlert, setSavingAlert] = useState(false)
  const [deletingAlert, setDeletingAlert] = useState(null)

  const fetchAlerts = () => {
    fetch(`${API_URL}/api/dashboard/usuarios/${userId}/alertas`)
      .then(r => r.json())
      .then(d => setAlerts(d.alertas || []))
      .catch(() => {})
  }

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

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

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
        showMsg('success', 'Usuario actualizado')
      } else {
        showMsg('error', d.mensaje || 'Error')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const resetAlertForm = () => {
    setAlertForm({ nombre: '', tipo: 'keywords', palabrasClaveArray: [''], codigos: [''], activa: true, frecuencia: 'daily' })
    setEditingAlert(null)
    setShowAlertForm(false)
  }

  const openNewAlert = () => {
    resetAlertForm()
    setShowAlertForm(true)
  }

  const openEditAlert = (alert) => {
    setEditingAlert(alert._id)
    setAlertForm({
      nombre: alert.nombre || '',
      tipo: alert.palabrasClaveArray?.length > 0 ? 'keywords' : 'codes',
      palabrasClaveArray: alert.palabrasClaveArray?.length > 0 ? [...alert.palabrasClaveArray] : [''],
      codigos: alert.codigos?.length > 0 ? [...alert.codigos] : [''],
      activa: alert.activa !== false,
      frecuencia: alert.frecuencia || 'daily'
    })
    setShowAlertForm(true)
  }

  const handleSaveAlert = async () => {
    if (!alertForm.nombre.trim()) return showMsg('error', 'Nombre es requerido')
    const kws = alertForm.palabrasClaveArray.filter(k => k.trim())
    const codes = alertForm.codigos.filter(c => c.trim())
    if (alertForm.tipo === 'keywords' && kws.length === 0) return showMsg('error', 'Agrega al menos una palabra clave')
    if (alertForm.tipo === 'codes' && codes.length === 0) return showMsg('error', 'Agrega al menos un código')

    setSavingAlert(true)
    try {
      const body = {
        nombre: alertForm.nombre.trim(),
        tipo: alertForm.tipo,
        activa: alertForm.activa,
        frecuencia: alertForm.frecuencia,
        palabrasClaveArray: alertForm.tipo === 'keywords' ? kws : [],
        codigos: alertForm.tipo === 'codes' ? codes : []
      }

      let res
      if (editingAlert) {
        // Update — the backend doesn't have a PUT for dashboard alerts, so delete + create
        await fetch(`${API_URL}/api/dashboard/alertas/${editingAlert}`, { method: 'DELETE' })
        res = await fetch(`${API_URL}/api/dashboard/usuarios/${userId}/alertas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      } else {
        res = await fetch(`${API_URL}/api/dashboard/usuarios/${userId}/alertas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      }

      const d = await res.json()
      if (d.success) {
        showMsg('success', editingAlert ? 'Alerta actualizada' : 'Alerta creada')
        resetAlertForm()
        fetchAlerts()
      } else {
        showMsg('error', d.mensaje || 'Error guardando alerta')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSavingAlert(false)
  }

  const handleDeleteAlert = async (alertId) => {
    if (!confirm('¿Eliminar esta alerta?')) return
    setDeletingAlert(alertId)
    try {
      const res = await fetch(`${API_URL}/api/dashboard/alertas/${alertId}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) {
        showMsg('success', 'Alerta eliminada')
        setAlerts(prev => prev.filter(a => a._id !== alertId))
      } else {
        showMsg('error', d.mensaje || 'Error')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setDeletingAlert(null)
  }

  const addField = (field) => {
    setAlertForm(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const updateField = (field, idx, value) => {
    setAlertForm(prev => {
      const arr = [...prev[field]]
      arr[idx] = value
      return { ...prev, [field]: arr }
    })
  }

  const removeField = (field, idx) => {
    setAlertForm(prev => {
      const arr = prev[field].filter((_, i) => i !== idx)
      return { ...prev, [field]: arr.length ? arr : [''] }
    })
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
            <p className="text-sm font-medium">{alerts.length} configuradas</p>
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{alerts.length} alertas</span>
            <button onClick={openNewAlert} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nueva alerta
            </button>
          </div>
        </div>

        {/* Alert Form */}
        {showAlertForm && (
          <div className="px-5 py-5 border-b border-gray-800 bg-gray-800/30">
            <h4 className="text-sm font-semibold mb-4 text-amber-400">
              {editingAlert ? 'Editar alerta' : 'Nueva alerta'}
            </h4>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre de la alerta *</label>
                <input
                  value={alertForm.nombre}
                  onChange={e => setAlertForm({...alertForm, nombre: e.target.value})}
                  placeholder="Ej: Licitaciones de software"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Tipo de alerta</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlertForm({...alertForm, tipo: 'keywords'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${alertForm.tipo === 'keywords' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  >
                    <Search className="w-3.5 h-3.5" /> Palabras clave
                  </button>
                  <button
                    onClick={() => setAlertForm({...alertForm, tipo: 'codes'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${alertForm.tipo === 'codes' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  >
                    <Tag className="w-3.5 h-3.5" /> Códigos
                  </button>
                </div>
              </div>

              {/* Keywords */}
              {alertForm.tipo === 'keywords' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Palabras clave *</label>
                  <div className="space-y-2">
                    {alertForm.palabrasClaveArray.map((kw, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={kw}
                          onChange={e => updateField('palabrasClaveArray', i, e.target.value)}
                          placeholder="Ej: software, computadoras..."
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        {alertForm.palabrasClaveArray.length > 1 && (
                          <button onClick={() => removeField('palabrasClaveArray', i)} className="px-2 text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addField('palabrasClaveArray')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Agregar palabra clave
                    </button>
                  </div>
                </div>
              )}

              {/* Codes */}
              {alertForm.tipo === 'codes' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Códigos *</label>
                  <div className="space-y-2">
                    {alertForm.codigos.map((code, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={code}
                          onChange={e => updateField('codigos', i, e.target.value)}
                          placeholder="Ej: 89744556252"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                        />
                        {alertForm.codigos.length > 1 && (
                          <button onClick={() => removeField('codigos', i)} className="px-2 text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addField('codigos')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Agregar código
                    </button>
                  </div>
                </div>
              )}

              {/* Frequency + Active */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Frecuencia</label>
                  <select
                    value={alertForm.frecuencia}
                    onChange={e => setAlertForm({...alertForm, frecuencia: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="realtime">Tiempo real</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <button
                    onClick={() => setAlertForm({...alertForm, activa: !alertForm.activa})}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${alertForm.activa ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}
                  >
                    {alertForm.activa ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {alertForm.activa ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveAlert}
                  disabled={savingAlert}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {savingAlert ? 'Guardando...' : editingAlert ? 'Actualizar' : 'Crear alerta'}
                </button>
                <button onClick={resetAlertForm} className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert List */}
        <div className="divide-y divide-gray-800">
          {alerts.map((a) => (
            <div key={a._id} className="px-5 py-4 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{a.nombre || 'Alerta sin nombre'}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.activa ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                    {a.activa ? 'Activa' : 'Inactiva'}
                  </span>
                  <button onClick={() => openEditAlert(a)} className="p-1 text-gray-500 hover:text-blue-400 transition-colors" title="Editar">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(a._id)}
                    disabled={deletingAlert === a._id}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.palabrasClaveArray?.map((kw, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded">{kw}</span>
                ))}
                {a.codigos?.map((c, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded font-mono">{c}</span>
                ))}
              </div>
              {a.frecuencia && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {a.frecuencia === 'daily' ? 'Diaria' : a.frecuencia === 'weekly' ? 'Semanal' : a.frecuencia === 'realtime' ? 'Tiempo real' : a.frecuencia}</p>}
            </div>
          ))}
          {alerts.length === 0 && !showAlertForm && (
            <div className="text-center py-12">
              <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">Este usuario no tiene alertas configuradas</p>
              <button onClick={openNewAlert} className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto">
                <Plus className="w-4 h-4" /> Crear primera alerta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
