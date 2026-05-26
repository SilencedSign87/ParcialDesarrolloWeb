import { createContext, useContext, useState } from 'react'
import type { User } from '../types'


interface AuthContextType {
  currentUser: User | null
  users: User[]
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (data: Omit<User, 'id' | 'createdAt' | 'role'>) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('users')
    if (stored) return JSON.parse(stored)
    // Admin por defecto
    const defaultAdmin: User = {
      id: 'admin-001',
      fullName: 'Comité Técnico',
      email: 'admin@cert.pe',
      documentNumber: '00000000',
      specialty: 'Administración',
      role: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('users', JSON.stringify([defaultAdmin]))
    return [defaultAdmin]
  })

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const register = (data: Omit<User, 'id' | 'createdAt' | 'role'>): boolean => {
    const exists = users.some(
      u => u.email === data.email || u.documentNumber === data.documentNumber
    )
    if (exists) return false

    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    const updated = [...users, newUser]
    setUsers(updated)
    localStorage.setItem('users', JSON.stringify(updated))
    return true
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}