import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('icarus_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('icarus_user')) } catch { return null }
  })

  function login(tokenValue, userData) {
    localStorage.setItem('icarus_token', tokenValue)
    localStorage.setItem('icarus_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('icarus_token')
    localStorage.removeItem('icarus_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)