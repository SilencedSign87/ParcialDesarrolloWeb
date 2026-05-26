import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Award, Home, RotateCcw } from 'lucide-react'
import { useExamAttempt } from '../hooks/useExamAttempt'
import type { Exam, Certificate } from '../types'

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { getAttemptById } = useExamAttempt()

  const attempt = getAttemptById(attemptId ?? '')

  const exam: Exam | undefined = (() => {
    if (!attempt) return undefined
    const stored = localStorage.getItem('exams')
    if (!stored) return undefined
    return (JSON.parse(stored) as Exam[]).find(e => e.id === attempt.examId)
  })()

  const certificate: Certificate | undefined = (() => {
    if (!attempt?.passed) return undefined
    const stored = localStorage.getItem('certificates')
    if (!stored) return undefined
    return (JSON.parse(stored) as Certificate[]).find(
      c => c.userId === attempt.userId && c.examId === attempt.examId
    )
  })()

  if (!attempt || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-gray-500">Resultado no encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  const correctCount = exam.questions.filter(q => {
    if (q.type === 'multiple') return attempt.answers[q.id] === String(q.correctAnswer)
    return attempt.answers[q.id]?.trim().length > 0
  }).length

  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (attempt.score / 100) * circumference

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Resultado principal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
        >
          {/* Estado */}
          <div className={`px-6 py-4 flex items-center gap-3 ${attempt.passed ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
            {attempt.passed
              ? <CheckCircle className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-500" />
            }
            <div>
              <p className={`font-bold ${attempt.passed ? 'text-green-700' : 'text-red-600'}`}>
                {attempt.passed ? 'Aprobado' : 'Desaprobado'}
              </p>
              <p className="text-xs text-gray-400">{exam.title}</p>
            </div>
          </div>

          {/* Score y stats */}
          <div className="px-6 py-6 flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" strokeWidth="8" strokeLinecap="round"
                  stroke={attempt.passed ? '#22c55e' : '#ef4444'}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-black ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {attempt.score}%
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Correctas</span>
                <span className="font-semibold text-gray-700">{correctCount} / {exam.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mínimo requerido</span>
                <span className="font-semibold text-gray-700">{exam.minPassPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tu puntaje</span>
                <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {attempt.score}%
                </span>
              </div>
            </div>
          </div>

          {/* Certificado o mensaje */}
          {attempt.passed && certificate ? (
            <div className="px-6 pb-6">
              <Link to={`/certificate/${certificate.hash}`}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <Award className="w-4 h-4" /> Ver certificado
              </Link>
            </div>
          ) : !attempt.passed ? (
            <div className="px-6 pb-5">
              <p className="text-sm text-gray-400 text-center">Sigue practicando, puedes lograrlo.</p>
            </div>
          ) : null}
        </motion.div>

        {/* Revisión */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <p className="text-sm font-semibold text-gray-700 mb-4">Revisión de respuestas</p>
          <div className="space-y-3">
            {exam.questions.map((q, i) => {
              const userAnswer = attempt.answers[q.id]
              const isCorrect = q.type === 'multiple'
                ? userAnswer === String(q.correctAnswer)
                : userAnswer?.trim().length > 0

              return (
                <div key={q.id}
                  className={`rounded-xl p-4 text-sm border-l-2 ${
                    isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                  }`}
                >
                  <p className="font-medium text-gray-800 mb-1.5">
                    <span className="text-gray-400 mr-1">{i + 1}.</span>{q.text}
                  </p>
                  {q.type === 'multiple' && q.options && (
                    <div className="space-y-0.5">
                      <p className={isCorrect ? 'text-green-700' : 'text-red-600'}>
                        Tu respuesta: <strong>{userAnswer !== undefined ? q.options[Number(userAnswer)] : 'Sin responder'}</strong>
                      </p>
                      {!isCorrect && (
                        <p className="text-green-700">
                          Correcta: <strong>{q.options[Number(q.correctAnswer)]}</strong>
                        </p>
                      )}
                    </div>
                  )}
                  {q.type === 'open' && (
                    <p className="text-gray-500 italic">"{userAnswer || 'Sin responder'}"</p>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Acciones */}
        <div className="flex gap-3 pb-6">
          <button onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition text-sm font-medium"
          >
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" /> Otros exámenes
          </button>
        </div>
      </div>
    </div>
  )
}
