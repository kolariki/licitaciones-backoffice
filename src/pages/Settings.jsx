import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Shield, Bell, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-gray-500 text-sm mt-1">Ajustes del panel de administracion</p>
      </div>

      {/* Account */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold">Cuenta</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email del administrador</label>
            <input value={user?.email || ''} readOnly className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rol</label>
            <input value="Administrador" readOnly className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-green-500/10 rounded-xl">
            <Bell className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">Notificaciones</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notificaciones por email</p>
            <p className="text-xs text-gray-500 mt-1">Recibir alertas de nuevos usuarios y actividad</p>
          </div>
          <button onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-green-500' : 'bg-gray-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-500/10 rounded-xl">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold">Apariencia</h3>
        </div>
        <p className="text-sm text-gray-400">Tema oscuro activado por defecto. Mas opciones proximamente.</p>
      </div>

      <button onClick={() => toast.success('Configuracion guardada')}
        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20">
        <Save className="w-4 h-4" /> Guardar configuracion
      </button>
    </div>
  );
}
