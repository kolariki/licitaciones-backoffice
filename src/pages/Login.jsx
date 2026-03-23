import React, { useState, useRef } from 'react'
import { Layers, LogIn, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { API_URL } from '../config'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('credentials') // 'credentials' | '2fa'
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/backoffice/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStep('2fa')
        setCode(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else {
        setError(data.message || 'Error de autenticación')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setCode(paste.split(''))
      inputRefs.current[5]?.focus()
      e.preventDefault()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Ingresá el código de 6 dígitos')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/backoffice/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        localStorage.setItem('bo_token', data.token)
        localStorage.setItem('bo_user', JSON.stringify(data.usuario))
        window.location.href = '/dashboard'
      } else {
        setError(data.message || 'Código inválido')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  if (step === '2fa') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/elevum-logo.png" alt="Elevum" className="h-10 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Verificación 2FA</h1>
            <p className="text-gray-500 text-sm mt-1">Ingresá el código enviado a tu email</p>
          </div>

          <form onSubmit={handleVerify} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className="w-11 h-14 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center">El código expira en 5 minutos</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Verificando...' : 'Verificar'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setError('') }}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/elevum-logo.png" alt="Elevum" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Elevum Backoffice</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="admin@elevumg.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          <p className="text-xs text-gray-600 text-center">Acceso restringido con verificación 2FA</p>
        </form>
      </div>
    </div>
  )
}
