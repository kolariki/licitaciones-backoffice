import { useState, useEffect, createContext, useContext } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('bo_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Try to validate token - first check localStorage for cached user
      const cachedUser = localStorage.getItem('bo_user')
      if (cachedUser) {
        try {
          const u = JSON.parse(cachedUser)
          if (u.rol === 'elevum') {
            setUser(u)
            setLoading(false)
            return
          }
        } catch {}
      }

      // Fallback: validate via API
      fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { 'x-auth-token': token }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          const u = d.usuario || d
          if (u.rol === 'elevum') {
            setUser(u)
            localStorage.setItem('bo_user', JSON.stringify(u))
          } else {
            setToken(null)
            localStorage.removeItem('bo_token')
            localStorage.removeItem('bo_user')
          }
          setLoading(false)
        })
        .catch(() => {
          // Token might be from 2FA with different secret - check cached user
          const cached = localStorage.getItem('bo_user')
          if (cached) {
            try {
              const u = JSON.parse(cached)
              if (u.rol === 'elevum') {
                setUser(u)
                setLoading(false)
                return
              }
            } catch {}
          }
          setToken(null)
          localStorage.removeItem('bo_token')
          localStorage.removeItem('bo_user')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async () => {
    const t = localStorage.getItem('bo_token')
    if (t) {
      setToken(t)
      const cached = localStorage.getItem('bo_user')
      if (cached) {
        try { setUser(JSON.parse(cached)) } catch {}
      }
    }
    return { success: !!t }
  }

  const logout = () => {
    localStorage.removeItem('bo_token')
    localStorage.removeItem('bo_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
