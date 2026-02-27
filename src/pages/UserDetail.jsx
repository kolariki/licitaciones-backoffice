import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Crown, Bell, Calendar, Edit, Save, X, Trash2, Clock, Plus, Search, Tag, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { API_URL } from '../config'

// Toast component
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-slide pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-medium ${
            t.type === 'success'
              ? 'bg-green-500/15 border-green-500/30 text-green-400 shadow-green-500/10'
              : 'bg-red-500/15 border-red-500/30 text-red-400 shadow-red-500/10'
          }`}
        >
          {t.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {t.text}
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function UserDetail() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((type, text) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, text }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  // Alert form state
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState(null)
  const [alertForm, setAlertForm] = useState({ nombre: '', tipo: 'keywords', palabrasClaveArray: [''], codigos: [''], activa: true, frecuencia: 'daily' })
  const [savingAlert, setSavingAlert] = useState(false)
  const [deletingAlert, setDeletingAlert] = useState(null)

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Chip input state
  const [kwInput, setKwInput] = useState('')
  const [codeInput, setCodeInput] = useState('')

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
        addToast('success', 'Usuario actualizado')
      } else {
        addToast('error', d.mensaje || 'Error')
      }
    } catch {
      addToast('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const resetAlertForm = () => {
    setAlertForm({ nombre: '', tipo: 'keywords', palabrasClaveArray: [''], codigos: [''], activa: true, frecuencia: 'daily' })
    setEditingAlert(null)
    setShowAlertForm(false)
    setKwInput('')
    setCodeInput('')
  }

  const openNewAlert = () => {
    resetAlertForm()
    setAlertForm({ nombre: '', tipo: 'keywords', palabrasClaveArray: [], codigos: [], activa: true, frecuencia: 'daily' })
    setShowAlertForm(true)
  }

  const openEditAlert = (alert) => {
    setEditingAlert(alert._id)
    setAlertForm({
      nombre: alert.nombre || '',
      tipo: alert.palabrasClaveArray?.length > 0 ? 'keywords' : 'codes',
      palabrasClaveArray: alert.palabrasClaveArray?.length > 0 ? [...alert.palabrasClaveArray] : [],
      codigos: alert.codigos?.length > 0 ? [...alert.codigos] : [],
      activa: alert.activa !== false,
      frecuencia: alert.frecuencia || 'daily'
    })
    setKwInput('')
    setCodeInput('')
    setShowAlertForm(true)
  }

  const handleSaveAlert = async () => {
    if (!alertForm.nombre.trim()) return addToast('error', 'Nombre es requerido')
    const kws = alertForm.palabrasClaveArray.filter(k => k.trim())
    const codes = alertForm.codigos.filter(c => c.trim())
    if (alertForm.tipo === 'keywords' && kws.length === 0) return addToast('error', 'Agrega al menos una palabra clave')
    if (alertForm.tipo === 'codes' && codes.length === 0) return addToast('error', 'Agrega al menos un código')

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
        addToast('success', editingAlert ? 'Alerta actualizada' : 'Alerta creada')
        resetAlertForm()
        fetchAlerts()
      } else {
        addToast('error', d.mensaje || 'Error guardando alerta')
      }
    } catch {
      addToast('error', 'Error de conexión')
    }
    setSavingAlert(false)
  }

  const handleDeleteAlert = async (alertId) => {
    setDeletingAlert(alertId)
    try {
      const res = await fetch(`${API_URL}/api/dashboard/alertas/${alertId}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) {
        addToast('success', 'Alerta eliminada')
        setAlerts(prev => prev.filter(a => a._id !== alertId))
      } else {
        addToast('error', d.mensaje || 'Error')
      }
    } catch {
      addToast('error', 'Error de conexión')
    }
    setDeletingAlert(null)
    setDeleteConfirm(null)
  }

  const addChip = (field, value) => {
    if (!value.trim()) return
    setAlertForm(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
  }

  const removeChip = (field, idx) => {
    setAlertForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))
  }

  const handleChipKeyDown = (e, field, inputValue, setInputValue) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addChip(field, inputValue)
        setInputValue('')
      }
    }
    if (e.key === 'Backspace' && !inputValue && alertForm[field].length > 0) {
      removeChip(field, alertForm[field].length - 1)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <div className="text-center py-20 text-gray-500">Usuario no encontrado</div>

  const isPremium = user.nivelSuscripcion === 'premium' || user.rol === 'premium'

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes toastSlide { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .anim-fade { animation: fadeIn 0.5s ease-out both; }
        .anim-slide { animation: slideUp 0.5s ease-out both; }
        .anim-scale { animation: scaleIn 0.25s ease-out both; }
        .toast-slide { animation: toastSlide 0.3s ease-out both; }
        .toggle-track { transition: background-color 0.2s ease; }
        .toggle-thumb { transition: transform 0.2s ease; }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="anim-scale relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/15 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">¿Eliminar alerta?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteAlert(deleteConfirm)}
                disabled={deletingAlert === deleteConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-xl text-sm font-medium text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
              >
                {deletingAlert === deleteConfirm ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={resetAlertForm}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="anim-scale relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                {editingAlert ? 'Editar alerta' : 'Nueva alerta'}
              </h3>
              <button onClick={resetAlertForm} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Nombre de la alerta *</label>
                <input
                  value={alertForm.nombre}
                  onChange={e => setAlertForm({...alertForm, nombre: e.target.value})}
                  placeholder="Ej: Licitaciones de software"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Tipo de alerta</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlertForm({...alertForm, tipo: 'keywords'})}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      alertForm.tipo === 'keywords'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Search className="w-4 h-4" /> Palabras clave
                  </button>
                  <button
                    onClick={() => setAlertForm({...alertForm, tipo: 'codes'})}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      alertForm.tipo === 'codes'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Tag className="w-4 h-4" /> Códigos
                  </button>
                </div>
              </div>

              {/* Keywords chip input */}
              {alertForm.tipo === 'keywords' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Palabras clave * <span className="text-gray-600">(Enter o coma para agregar)</span></label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 transition-colors min-h-[44px]">
                    {alertForm.palabrasClaveArray.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 text-blue-400 rounded-lg text-xs border border-blue-500/20">
                        {kw}
                        <button onClick={() => removeChip('palabrasClaveArray', i)} className="hover:text-blue-200 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={kwInput}
                      onChange={e => setKwInput(e.target.value)}
                      onKeyDown={e => handleChipKeyDown(e, 'palabrasClaveArray', kwInput, setKwInput)}
                      onBlur={() => { if (kwInput.trim()) { addChip('palabrasClaveArray', kwInput); setKwInput('') } }}
                      placeholder={alertForm.palabrasClaveArray.length === 0 ? 'Ej: software, computadoras...' : ''}
                      className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Codes chip input */}
              {alertForm.tipo === 'codes' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Códigos * <span className="text-gray-600">(Enter o coma para agregar)</span></label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-500/50 transition-colors min-h-[44px]">
                    {alertForm.codigos.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-mono border border-amber-500/20">
                        {c}
                        <button onClick={() => removeChip('codigos', i)} className="hover:text-amber-200 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value)}
                      onKeyDown={e => handleChipKeyDown(e, 'codigos', codeInput, setCodeInput)}
                      onBlur={() => { if (codeInput.trim()) { addChip('codigos', codeInput); setCodeInput('') } }}
                      placeholder={alertForm.codigos.length === 0 ? 'Ej: 89744556252' : ''}
                      className="flex-1 min-w-[100px] bg-transparent text-sm text-white font-mono placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Frequency + Active */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Frecuencia</label>
                  <select
                    value={alertForm.frecuencia}
                    onChange={e => setAlertForm({...alertForm, frecuencia: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="realtime">Tiempo real</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Estado</label>
                  <button
                    onClick={() => setAlertForm({...alertForm, activa: !alertForm.activa})}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
                  >
                    <div className={`toggle-track w-11 h-6 rounded-full relative ${alertForm.activa ? 'bg-green-500' : 'bg-gray-700'}`}>
                      <div className={`toggle-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow ${alertForm.activa ? 'transform translate-x-5' : ''}`} />
                    </div>
                    <span className={alertForm.activa ? 'text-green-400' : 'text-gray-500'}>{alertForm.activa ? 'Activa' : 'Inactiva'}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveAlert}
                  disabled={savingAlert}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl text-sm font-medium shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingAlert ? 'Guardando...' : editingAlert ? 'Actualizar' : 'Crear alerta'}
                </button>
                <button onClick={resetAlertForm} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {/* Back */}
        <Link to="/users" className="anim-fade inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a usuarios
        </Link>

        {/* User Card */}
        <div className="anim-slide bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                isPremium
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/20'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/20'
              }`}>
                {user.nombre?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                {editing ? (
                  <input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:border-blue-500/50 focus:outline-none transition-colors" />
                ) : (
                  <h2 className="text-xl font-bold">{user.nombre}</h2>
                )}
                <p className="text-gray-400 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
                {(user.cedulaEmpresa || user.entidad) && (
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1 font-mono text-sm">Cédula: {user.cedulaEmpresa || user.entidad}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25 transition-all disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all">
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: MapPin, label: 'País',
                content: editing ? (
                  <select value={editForm.pais} onChange={e => setEditForm({...editForm, pais: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors">
                    <option value="costa_rica">Costa Rica</option>
                    <option value="argentina">Argentina</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium">{user.pais === 'costa_rica' ? 'Costa Rica' : user.pais === 'argentina' ? 'Argentina' : user.pais}</p>
                )
              },
              {
                icon: Crown, label: 'Plan',
                content: editing ? (
                  <select value={editForm.suscripcion} onChange={e => setEditForm({...editForm, suscripcion: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                ) : (
                  <p className={`text-sm font-medium ${isPremium ? 'text-purple-400' : ''}`}>{isPremium ? '★ Premium' : 'Free'}</p>
                )
              },
              { icon: Bell, label: 'Alertas', content: <p className="text-sm font-medium">{alerts.length} configuradas</p> },
              { icon: Calendar, label: 'Registro', content: <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</p> },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all duration-200">
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><item.icon className="w-3 h-3" /> {item.label}</p>
                {item.content}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="anim-slide bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl" style={{ animationDelay: '100ms' }}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              Alertas del usuario
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">{alerts.length} alertas</span>
              <button onClick={openNewAlert} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl text-sm font-medium shadow-lg shadow-amber-500/25 transition-all">
                <Plus className="w-3.5 h-3.5" /> Nueva alerta
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="divide-y divide-white/5">
            {alerts.map((a, i) => (
              <div key={a._id} className="anim-slide px-5 py-4 hover:bg-white/[0.02] transition-all duration-200" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {a.nombre || 'Alerta sin nombre'}
                    {a.activa && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.activa ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                      {a.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    <button onClick={() => openEditAlert(a)} className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Editar">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(a._id)}
                      disabled={deletingAlert === a._id}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.palabrasClaveArray?.map((kw, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10 shadow-sm shadow-blue-500/5">{kw}</span>
                  ))}
                  {a.codigos?.map((c, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10 shadow-sm shadow-amber-500/5 font-mono">{c}</span>
                  ))}
                </div>
                {a.frecuencia && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.frecuencia === 'daily' ? 'Diaria' : a.frecuencia === 'weekly' ? 'Semanal' : a.frecuencia === 'realtime' ? 'Tiempo real' : a.frecuencia}
                  </p>
                )}
              </div>
            ))}
            {alerts.length === 0 && !showAlertForm && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Sin alertas configuradas</p>
                <p className="text-gray-600 text-xs mb-4">Creá la primera alerta para este usuario</p>
                <button onClick={openNewAlert} className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1.5 mx-auto bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 hover:border-amber-500/30 transition-all">
                  <Plus className="w-4 h-4" /> Crear primera alerta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
