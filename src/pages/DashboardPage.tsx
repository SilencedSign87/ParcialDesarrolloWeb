import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Exam } from '../types'

export default function DashboardPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const exams: Exam[] = (() => {
    const stored = localStorage.getItem('exams')
    return stored ? JSON.parse(stored) : []
  })()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">CertApp</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{currentUser?.fullName}</span>
          {currentUser?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
              Panel Admin
            </button>
          )}
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">Salir</button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-base font-semibold text-slate-600 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
          Exámenes disponibles
        </h2>
        {exams.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No hay exámenes disponibles aún.</p>
        ) : (
          <div className="grid gap-3">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="font-semibold text-slate-800">{exam.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{exam.area} · {exam.questions.length} preguntas · Mín. {exam.minPassPercentage}%</p>
                </div>
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Rendir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
