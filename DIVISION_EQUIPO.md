# Sistema de Certificación en Línea
### Evaluación Parcial — Desarrollo de Aplicaciones Web IX
**Stack:** React + Vite + TypeScript + TailwindCSS + LocalStorage  
**Tiempo:** 120 minutos | **Equipo:** 4 personas | **Total:** 20 puntos

---

## Stack Tecnológico Completo

```bash
npm create vite@latest cert-app -- --template react-ts
cd cert-app
npm install react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install framer-motion
npm install react-hot-toast
npm install jspdf html2canvas
npm install qrcode.react
npm install lucide-react
npm install zustand
```

---

## Estructura de Carpetas

```
src/
├── components/
│   ├── auth/          → Login, Register, ProtectedRoute
│   ├── admin/         → ExamEditor, QuestionForm, ExamList
│   ├── exam/          → ExamSelector, ExamTaker, Timer, Results
│   ├── certificate/   → CertificateCard, CertificateView
│   ├── curriculum/    → CurriculumPage, CurriculumEditor
│   └── ui/            → Button, Input, Modal, Badge, Skeleton, Toast
├── context/
│   ├── AuthContext.tsx
│   └── AppContext.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useAuth.ts
│   └── useExams.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── AdminPage.tsx
│   ├── ExamPage.tsx
│   ├── ResultsPage.tsx
│   ├── CertificatePage.tsx
│   └── CurriculumPage.tsx
├── types/
│   └── index.ts           ← TODOS los tipos aquí
├── utils/
│   ├── storage.ts
│   ├── hash.ts
│   └── pdf.ts
├── data/
│   └── seed.ts            ← datos de prueba iniciales
└── App.tsx
```

---

## Tipos TypeScript Compartidos (`src/types/index.ts`)
> **Persona 1 los define al inicio, todos los usan**

```ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  documentNumber: string;
  specialty: string;
  role: 'admin' | 'user';
  password: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple' | 'open';
  options?: string[];
  correctAnswer?: string | number;
}

export interface Exam {
  id: string;
  title: string;
  area: string;
  type: 'multiple' | 'open' | 'mixed';
  questions: Question[];
  minPassPercentage: number;
  createdAt: string;
  createdBy: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface Certificate {
  id: string;
  hash: string;
  userId: string;
  examId: string;
  userName: string;
  examTitle: string;
  score: number;
  issuedAt: string;
  publicUrl: string;
}

export interface CurriculumEntry {
  id: string;
  userId: string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
```

---

---

# PERSONA 1 — Arquitecto del Proyecto + Auth + Usuarios
**Responsable de:** Setup completo, autenticación, gestión de usuarios, contexto global, navegación

## Paso 1 — Inicializar el proyecto (primero que todos)

```bash
npm create vite@latest cert-app -- --template react-ts
cd cert-app
npm install react-router-dom tailwindcss @tailwindcss/vite framer-motion react-hot-toast jspdf html2canvas qrcode.react lucide-react zustand
```

**Configurar Tailwind** en `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Agregar en `src/index.css`:
```css
@import "tailwindcss";
```

## Paso 2 — Definir todos los tipos (`src/types/index.ts`)
Copiar los tipos del bloque de arriba. **Todos los compañeros importarán desde aquí.**

## Paso 3 — Hook `useLocalStorage` (`src/hooks/useLocalStorage.ts`)

```ts
import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}
```

## Paso 4 — AuthContext (`src/context/AuthContext.tsx`)

```tsx
import { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'

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
```

## Paso 5 — Configurar Rutas (`src/App.tsx`)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ExamPage from './pages/ExamPage'
import ResultsPage from './pages/ResultsPage'
import CertificatePage from './pages/CertificatePage'
import CurriculumPage from './pages/CurriculumPage'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" />
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/dashboard" />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      <Route path="/exam/:examId" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
      <Route path="/results/:attemptId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
      <Route path="/certificate/:hash" element={<CertificatePage />} />
      <Route path="/curriculum/:userId" element={<CurriculumPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## Paso 6 — LoginPage (`src/pages/LoginPage.tsx`)

```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // simula carga
    const ok = login(form.email, form.password)
    setLoading(false)
    if (ok) {
      toast.success('Bienvenido!')
      navigate('/dashboard')
    } else {
      toast.error('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">CertApp</h1>
          <p className="text-gray-500 text-sm">Sistema de Certificación en Línea</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Admin: admin@cert.pe / admin123
        </p>
      </motion.div>
    </div>
  )
}
```

## Paso 7 — RegisterPage (`src/pages/RegisterPage.tsx`)
- Formulario con: nombre completo, email, N° documento, especialidad, contraseña
- Validar que email y documento no existan (usando `register()` del contexto)
- Toast de éxito/error
- Redirigir a login al registrar

## Paso 8 — DashboardPage (`src/pages/DashboardPage.tsx`)
- Navbar con nombre del usuario y botón logout
- Cards de estadísticas: exámenes disponibles, intentos realizados, certificados obtenidos
- Listado de exámenes disponibles con botón "Rendir"
- Botón "Mi Currículum" que va a `/curriculum/:userId`
- Si es admin, botón "Panel Admin"

**EXTRAS PERSONA 1:**
- Toggle Dark Mode (guardar preferencia en localStorage)
- Navbar responsiva con menú hamburguesa en móvil
- Avatar generado con iniciales del usuario

---

---

# PERSONA 2 — Módulo Admin / Gestión de Exámenes
**Responsable de:** Panel admin completo, CRUD de exámenes, formulario de preguntas, hook de exámenes

## Paso 1 — Hook `useExams` (`src/hooks/useExams.ts`)

```ts
import { useState } from 'react'
import { Exam } from '../types'

export function useExams() {
  const [exams, setExams] = useState<Exam[]>(() => {
    const stored = localStorage.getItem('exams')
    return stored ? JSON.parse(stored) : []
  })

  const save = (updated: Exam[]) => {
    setExams(updated)
    localStorage.setItem('exams', JSON.stringify(updated))
  }

  const createExam = (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    save([...exams, newExam])
    return newExam
  }

  const updateExam = (id: string, data: Partial<Exam>) => {
    save(exams.map(e => e.id === id ? { ...e, ...data } : e))
  }

  const deleteExam = (id: string) => {
    save(exams.filter(e => e.id !== id))
  }

  return { exams, createExam, updateExam, deleteExam }
}
```

## Paso 2 — AdminPage (`src/pages/AdminPage.tsx`)
- Tabs: "Exámenes" | "Usuarios registrados"
- En tab Exámenes: lista de exámenes + botón "Nuevo Examen"
- Mostrar estadísticas: total exámenes, total usuarios, total certificados emitidos
- Tabla de usuarios con columnas: nombre, email, documento, especialidad, fecha registro

## Paso 3 — ExamEditor (`src/components/admin/ExamEditor.tsx`)

Modal o página para crear/editar un examen:
- Input: título del examen
- Input: área temática (ej. Redes, Programación, BD)
- Select: tipo (opción múltiple / preguntas abiertas / mixto)
- Input número: porcentaje mínimo de aprobación (0-100)
- Sección de preguntas: lista de preguntas agregadas
- Botón "Agregar Pregunta" → abre `QuestionForm`
- Validación: mínimo 1 pregunta para guardar
- Botón guardar con toast de confirmación

```tsx
// Estructura base del componente
interface ExamEditorProps {
  exam?: Exam           // si viene, es edición; si no, es creación
  onSave: () => void
  onCancel: () => void
}
```

## Paso 4 — QuestionForm (`src/components/admin/QuestionForm.tsx`)

Modal para agregar/editar preguntas:
- Textarea: texto de la pregunta
- Select: tipo (múltiple opción / abierta)
- Si es múltiple opción:
  - 4 inputs para las opciones A, B, C, D
  - Select: cuál es la respuesta correcta (A/B/C/D)
- Si es abierta: solo texto libre como respuesta esperada
- Botón agregar/guardar

## Paso 5 — ExamList (`src/components/admin/ExamList.tsx`)

Tabla o cards de exámenes con:
- Título, área, tipo, N° preguntas, % mínimo
- Fecha de creación
- Botones: Editar (lápiz) | Eliminar (basurero con confirmación)
- Badge de color según tipo de examen
- Confirmación antes de eliminar: modal o window.confirm

## Paso 6 — Datos de prueba (`src/data/seed.ts`)

```ts
import { Exam } from '../types'

export function seedExams(): void {
  const existing = localStorage.getItem('exams')
  if (existing && JSON.parse(existing).length > 0) return

  const sampleExams: Exam[] = [
    {
      id: 'exam-001',
      title: 'Fundamentos de Redes',
      area: 'Redes',
      type: 'multiple',
      minPassPercentage: 70,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          text: '¿Qué significa IP?',
          type: 'multiple',
          options: ['Internet Protocol', 'Internal Process', 'Input Port', 'Indexed Page'],
          correctAnswer: 0,
        },
        {
          id: 'q2',
          text: '¿Cuántos bits tiene una dirección IPv4?',
          type: 'multiple',
          options: ['16', '32', '64', '128'],
          correctAnswer: 1,
        },
        {
          id: 'q3',
          text: '¿Qué capa del modelo OSI maneja el enrutamiento?',
          type: 'multiple',
          options: ['Física', 'Enlace', 'Red', 'Transporte'],
          correctAnswer: 2,
        },
      ],
    },
    {
      id: 'exam-002',
      title: 'Programación en Python',
      area: 'Programación',
      type: 'multiple',
      minPassPercentage: 60,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          text: '¿Cómo se define una función en Python?',
          type: 'multiple',
          options: ['function nombre():', 'def nombre():', 'fn nombre():', 'func nombre():'],
          correctAnswer: 1,
        },
        {
          id: 'q2',
          text: '¿Qué tipo de dato retorna len("hola")?',
          type: 'multiple',
          options: ['str', 'float', 'int', 'bool'],
          correctAnswer: 2,
        },
      ],
    },
  ]

  localStorage.setItem('exams', JSON.stringify(sampleExams))
}
```

Llamar `seedExams()` en `main.tsx` antes de renderizar.

**EXTRAS PERSONA 2:**
- Buscador/filtro de exámenes por área o título
- Indicador visual de dificultad (fácil/medio/difícil según % mínimo)
- Preview del examen antes de publicarlo
- Contador de cuántos usuarios han rendido cada examen
- Ordenar tabla por fecha, título o área

---

---

# PERSONA 3 — Módulo Usuario / Rendir Exámenes + Resultados
**Responsable de:** Selección de examen, interfaz de rendición, evaluación automática, resultados

## Paso 1 — Hook `useExamAttempt` (`src/hooks/useExamAttempt.ts`)

```ts
import { useState } from 'react'
import { ExamAttempt } from '../types'

export function useExamAttempt() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    const stored = localStorage.getItem('attempts')
    return stored ? JSON.parse(stored) : []
  })

  const saveAttempt = (attempt: Omit<ExamAttempt, 'id'>) => {
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
    }
    const updated = [...attempts, newAttempt]
    setAttempts(updated)
    localStorage.setItem('attempts', JSON.stringify(updated))
    return newAttempt
  }

  const hasAttempted = (userId: string, examId: string): boolean => {
    return attempts.some(a => a.userId === userId && a.examId === examId)
  }

  const getUserAttempts = (userId: string): ExamAttempt[] => {
    return attempts.filter(a => a.userId === userId)
  }

  return { attempts, saveAttempt, hasAttempted, getUserAttempts }
}
```

## Paso 2 — ExamPage (`src/pages/ExamPage.tsx`)

Recibe el `examId` por params. Estructura:
1. **Pantalla de inicio del examen**: título, área, N° preguntas, tiempo límite, % aprobación → botón "Comenzar"
2. **Pantalla de examen**: preguntas una por una o todas a la vez
3. Al enviar: calcular puntaje y guardar intento

```tsx
// Lógica de evaluación automática
function evaluateExam(exam: Exam, answers: Record<string, string>): number {
  let correct = 0
  exam.questions.forEach(q => {
    if (q.type === 'multiple') {
      if (answers[q.id] === String(q.correctAnswer)) correct++
    }
    // Las abiertas se cuentan como correctas si se respondieron (revisión manual futura)
    if (q.type === 'open' && answers[q.id]?.trim().length > 0) correct++
  })
  return Math.round((correct / exam.questions.length) * 100)
}
```

## Paso 3 — Timer (`src/components/exam/Timer.tsx`)

```tsx
import { useState, useEffect } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

interface TimerProps {
  minutes: number
  onTimeUp: () => void
}

export default function Timer({ minutes, onTimeUp }: TimerProps) {
  const [seconds, setSeconds] = useState(minutes * 60)

  useEffect(() => {
    if (seconds <= 0) { onTimeUp(); return }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isWarning = seconds < 60

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-full
      ${isWarning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
      <TimerIcon className="w-5 h-5" />
      {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
    </div>
  )
}
```

## Paso 4 — ProgressBar durante el examen

```tsx
// src/components/exam/ExamProgress.tsx
interface ExamProgressProps {
  current: number
  total: number
}

export default function ExamProgress({ current, total }: ExamProgressProps) {
  const percentage = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Pregunta {current} de {total}</span>
        <span>{percentage}% completado</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

## Paso 5 — Interfaz de Pregunta (`src/components/exam/QuestionCard.tsx`)

- Mostrar texto de la pregunta con número
- Si es opción múltiple: 4 opciones como botones radio estilizados
- Si es abierta: textarea para respuesta libre
- Al seleccionar opción múltiple: resaltar la seleccionada en azul
- Navegación: botón "Anterior" / "Siguiente" / "Finalizar" (en la última)

## Paso 6 — ResultsPage (`src/pages/ResultsPage.tsx`)

Mostrar al finalizar:
- Puntaje obtenido (círculo animado con porcentaje)
- Estado: APROBADO (verde) / DESAPROBADO (rojo)
- Cantidad de correctas vs incorrectas
- Detalle de respuestas (revisión: correcta vs la que dio el usuario)
- Si aprobó: botón "Ver Certificado" → navega a `/certificate/:hash`
- Si no aprobó: mensaje motivador + botón "Volver al Dashboard"

```tsx
// Animación del círculo de puntaje
// Usar un SVG circle con strokeDashoffset animado
// O simplemente un div con transition de width
```

**EXTRAS PERSONA 3:**
- Examen con preguntas navegables (índice lateral con estado respondida/sin responder)
- Alerta si intenta salir del examen sin terminar (beforeunload)
- Confeti con `canvas-confetti` si aprueba
- Modo revisión post-examen: ver qué respondió vs respuesta correcta resaltada
- Tiempo usado mostrado en resultados

---

---

# PERSONA 4 — Certificados + Currículum Digital
**Responsable de:** Generación de certificados PDF, URL pública, perfil currículum, QR Code

## Paso 1 — Utilidades (`src/utils/hash.ts`)

```ts
export function generateHash(userId: string, examId: string): string {
  const raw = `${userId}-${examId}-${Date.now()}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
}

export function generatePublicUrl(hash: string): string {
  return `${window.location.origin}/certificate/${hash}`
}
```

## Paso 2 — Hook de Certificados (`src/hooks/useCertificates.ts`)

```ts
import { useState } from 'react'
import { Certificate } from '../types'
import { generateHash, generatePublicUrl } from '../utils/hash'

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const stored = localStorage.getItem('certificates')
    return stored ? JSON.parse(stored) : []
  })

  const issueCertificate = (
    userId: string, examId: string, userName: string,
    examTitle: string, score: number
  ): Certificate => {
    // Evitar duplicados
    const existing = certificates.find(c => c.userId === userId && c.examId === examId)
    if (existing) return existing

    const hash = generateHash(userId, examId)
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      hash,
      userId,
      examId,
      userName,
      examTitle,
      score,
      issuedAt: new Date().toISOString(),
      publicUrl: generatePublicUrl(hash),
    }

    const updated = [...certificates, cert]
    setCertificates(updated)
    localStorage.setItem('certificates', JSON.stringify(updated))
    return cert
  }

  const getCertificateByHash = (hash: string) =>
    certificates.find(c => c.hash === hash)

  const getUserCertificates = (userId: string) =>
    certificates.filter(c => c.userId === userId)

  return { certificates, issueCertificate, getCertificateByHash, getUserCertificates }
}
```

## Paso 3 — CertificatePage (`src/pages/CertificatePage.tsx`)

Diseño visual del certificado (accesible por URL pública sin login):

```tsx
// Diseño sugerido del certificado
// - Fondo con gradiente o imagen de fondo elegante
// - Logo/ícono de la institución
// - "CERTIFICADO DE APROBACIÓN"
// - "Se certifica que [NOMBRE] ha aprobado exitosamente"
// - "[NOMBRE DEL EXAMEN]"
// - "Con un puntaje de [SCORE]%"
// - "Emitido el [FECHA]"
// - Código de verificación: [HASH]
// - QR Code que apunta a la misma URL
// - Firma simulada del comité técnico
// - Botón "Descargar PDF"
```

## Paso 4 — Generador PDF (`src/utils/pdf.ts`)

```ts
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function downloadCertificateAsPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`${filename}.pdf`)
}
```

## Paso 5 — QR Code en certificado

```tsx
import { QRCodeSVG } from 'qrcode.react'

// Dentro del componente CertificatePage:
<QRCodeSVG
  value={certificate.publicUrl}
  size={100}
  bgColor="#ffffff"
  fgColor="#1e1b4b"
  className="rounded-lg"
/>
```

## Paso 6 — CurriculumPage (`src/pages/CurriculumPage.tsx`)

Perfil público con URL `/curriculum/:userId`:
- Header con avatar (iniciales), nombre, especialidad, email
- Sección "Certificaciones Obtenidas": cards con nombre del examen, puntaje, fecha, botón "Ver certificado"
- Sección "Experiencia Laboral": lista editable (solo si es el usuario actual)
- Sección "Formación Académica": lista editable
- Botón "Editar perfil" visible solo si `currentUser.id === userId`

## Paso 7 — CurriculumEditor (`src/components/curriculum/CurriculumEditor.tsx`)

Modal para agregar entradas de curriculum:
- Select: tipo (Experiencia laboral / Formación académica)
- Input: título del cargo/título
- Input: institución/empresa
- Input: fecha inicio
- Input: fecha fin (o checkbox "Actualmente")
- Textarea: descripción breve
- Guardar en localStorage bajo clave `curriculum-${userId}`

**EXTRAS PERSONA 4:**
- Sello de "VERIFICADO" animado en el certificado
- Compartir certificado (copiar URL al clipboard con toast)
- Vista de impresión optimizada del certificado
- Currículum exportable a PDF también
- Validación del certificado: ingresar hash y verificar autenticidad

---

---

## Coordinación del Equipo

### Orden de trabajo (primeros 15 minutos)

| Tiempo | Acción |
|--------|--------|
| 0-5 min | **Persona 1** crea el proyecto y comparte la carpeta/repositorio |
| 5-10 min | Todos instalan dependencias y verifican que corre |
| 10-15 min | **Persona 1** define los tipos, todos los importan y empiezan |

### Dependencias entre personas

```
Persona 1 (Auth/Context)
    ↓ provee useAuth, User type
Persona 2 (Admin)     Persona 3 (Examen)     Persona 4 (Certs)
    ↓ provee exams[]       ↓ provee attempts[]      ↓ provee certificates[]
                    ↑ todos importan desde types/index.ts
```

### Cómo compartir código rápido
- Usar **un solo repositorio Git** o compartir carpeta por USB/Drive
- Cada persona trabaja en su propia carpeta de componentes
- El punto de integración es `App.tsx` (rutas) — **Persona 1** lo mantiene

### Checklist final antes de presentar

- [ ] Login funciona (admin y usuario)
- [ ] Registro valida duplicados
- [ ] Admin puede crear examen con preguntas
- [ ] Usuario puede rendir examen y ver resultado
- [ ] Al aprobar se genera certificado con URL pública
- [ ] Certificado tiene QR y se puede descargar PDF
- [ ] Currículum muestra certificados del usuario
- [ ] Todo persiste al recargar la página (localStorage)
- [ ] Diseño responsivo y sin errores en consola
- [ ] Datos de prueba cargados (seedExams)

---

## Puntos Extra que marcan la diferencia

| Feature | Quién | Impacto visual |
|---------|-------|----------------|
| Dark mode toggle | Persona 1 | Alto |
| Animaciones Framer Motion | Todos | Alto |
| Confeti al aprobar | Persona 3 | Alto |
| QR en certificado | Persona 4 | Alto |
| Timer con alerta roja | Persona 3 | Medio |
| Estadísticas en dashboard | Persona 1 | Medio |
| Preview examen antes de rendir | Persona 2 | Medio |
| Copiar URL certificado | Persona 4 | Bajo |

---

*Curso: Desarrollo de Aplicaciones Web — Semestre IX*  
*Evaluación Parcial — React + Vite + TypeScript*
