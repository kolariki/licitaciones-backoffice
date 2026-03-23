import { useState, useEffect, createContext, useContext } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('bo_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Validate token by fetching user profile
      fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { 'x-auth-token': token }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
          const u = d.usuario || d
          if (u.rol === 'elevum') {
            setUser(u)
          } else {
            setToken(null)
            localStorage.removeItem('bo_token')
          }
          setLoading(false)
        })
        .catch(() => {
          setToken(null)
          localStorage.removeItem('bo_token')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async () => {
    // Login is handled by Login.jsx via 2FA flow
    // This just triggers a re-check of the token
    const t = localStorage.getItem('bo_token')
    if (t) setToken(t)
    return { success: !!t }
  }

  const logout = () => {
    localStorage.removeItem('bo_token')
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
