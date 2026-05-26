import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Award, RotateCcw, Home } from 'lucide-react'
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
        <div className="text-center">
          <p className="text-gray-500 text-lg">Resultado no encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">
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

  const scoreColor = attempt.passed ? 'text-green-600' : 'text-red-500'
  const ringColor = attempt.passed ? 'stroke-green-500' : 'stroke-red-400'
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (attempt.score / 100) * circumference

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Circular score */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                strokeWidth="8" strokeLinecap="round"
                className={ringColor}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-black ${scoreColor}`}>{attempt.score}%</span>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {attempt.passed ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-7 h-7" />
                <span className="text-2xl font-bold">¡APROBADO!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                <XCircle className="w-7 h-7" />
                <span className="text-2xl font-bold">DESAPROBADO</span>
              </div>
            )}
            <p className="text-gray-500">
              {correctCount} de {exam.questions.length} correctas · Mínimo requerido: {exam.minPassPercentage}%
            </p>
          </motion.div>

          {attempt.passed && certificate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <Link
                to={`/certificate/${certificate.hash}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                <Award className="w-5 h-5" /> Ver mi Certificado
              </Link>
            </motion.div>
          )}

          {!attempt.passed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-sm text-gray-400 italic"
            >
              No te rindas — cada intento es aprendizaje. 💪
            </motion.p>
          )}
        </motion.div>

        {/* Review section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revisión de respuestas</h2>
          <div className="space-y-4">
            {exam.questions.map((q, i) => {
              const userAnswer = attempt.answers[q.id]
              const isCorrect = q.type === 'multiple'
                ? userAnswer === String(q.correctAnswer)
                : userAnswer?.trim().length > 0

              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-4 border-l-4 ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}
                >
                  <p className="font-medium text-gray-800 mb-2">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>{q.text}
                  </p>
                  {q.type === 'multiple' && q.options && (
                    <div className="text-sm space-y-1">
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
                    <p className="text-sm text-gray-600">
                      Tu respuesta: <em>{userAnswer || 'Sin responder'}</em>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition font-medium"
          >
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" /> Otros exámenes
          </button>
        </div>
      </div>
    </div>
  )
}
