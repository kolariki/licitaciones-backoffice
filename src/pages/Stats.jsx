import { useState, useEffect } from 'react';
import { apiFetch } from '../config';
import { BarChart3, TrendingUp, Users, Crown, Globe, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Spinner from '../components/Spinner';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Stats() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/dashboard/usuarios')
      .then(d => setUsers(d?.usuarios || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  const total = users.length;
  const premium = users.filter(u => u.rol === 'premium').length;
  const free = total - premium;
  const activos = users.filter(u => u.activo !== false).length;
  const inactivos = total - activos;
  const conversionRate = total > 0 ? ((premium / total) * 100).toFixed(1) : 0;

  // Country data
  const countryMap = {};
  users.forEach(u => { const p = u.pais || 'Otro'; countryMap[p] = (countryMap[p] || 0) + 1; });
  const countryData = Object.entries(countryMap).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  // Premium vs Free
  const planData = [{ name: 'Premium', value: premium }, { name: 'Free', value: free }];

  // Active vs Inactive
  const statusData = [{ name: 'Activos', value: activos }, { name: 'Inactivos', value: inactivos }];

  // Growth over time
  const monthMap = {};
  users.forEach(u => {
    if (u.fechaRegistro) {
      const d = new Date(u.fechaRegistro);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
  });
  const growthData = Object.entries(monthMap).sort().map(([mes, nuevos]) => ({ mes, nuevos }));
  // Cumulative
  let cum = 0;
  growthData.forEach(d => { cum += d.nuevos; d.total = cum; });

  const stats = [
    { label: 'Total usuarios', value: total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Premium', value: premium, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Tasa de conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Activos', value: activos, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Estadisticas</h1>
        <p className="text-gray-500 text-sm mt-1">Metricas de la plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
            <div className={`p-2.5 rounded-xl ${bg} w-fit mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Crecimiento de usuarios</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#greenGradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Premium vs Free */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Premium vs Free</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#f59e0b" />
                <Cell fill="#6b7280" />
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Country dist */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Distribucion por pais</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active vs Inactive */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Activos vs Inactivos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
