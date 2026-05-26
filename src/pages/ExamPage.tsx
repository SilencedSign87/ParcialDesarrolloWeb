import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Send, BookOpen, Clock, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useExamAttempt } from '../hooks/useExamAttempt'
import { evaluateExam } from '../utils/examEvaluator'
import Timer from '../components/exam/Timer'
import ExamProgress from '../components/exam/ExamProgress'
import QuestionCard from '../components/exam/QuestionCard'
import type { Exam } from '../types'

type Phase = 'intro' | 'taking' | 'submitting'

const EXAM_MINUTES = 20

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { hasAttempted, saveAttempt } = useExamAttempt()

  const exam: Exam | undefined = (() => {
    const stored = localStorage.getItem('exams')
    if (!stored) return undefined
    return (JSON.parse(stored) as Exam[]).find(e => e.id === examId)
  })()

  const [phase, setPhase] = useState<Phase>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const alreadyAttempted = currentUser && examId
    ? hasAttempted(currentUser.id, examId)
    : false

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length

  const handleAnswer = (value: string) => {
    if (!exam) return
    setAnswers(prev => ({ ...prev, [exam.questions[currentIndex].id]: value }))
  }

  const handleTimeUp = useCallback(() => {
    toast.error('¡Tiempo agotado! Enviando respuestas...')
    submitExam()
  }, [answers])

  const submitExam = () => {
    if (!currentUser || !exam) return
    setPhase('submitting')

    const score = evaluateExam(exam, answers)
    const passed = score >= exam.minPassPercentage

    const attempt = saveAttempt({
      userId: currentUser.id,
      examId: exam.id,
      answers,
      score,
      passed,
      completedAt: new Date().toISOString(),
    })

    setTimeout(() => {
      navigate(`/results/${attempt.id}`)
    }, 800)
  }

  const handleSubmitClick = () => {
    const unanswered = exam ? exam.questions.length - answeredCount : 0
    if (unanswered > 0) {
      toast(`Tienes ${unanswered} pregunta(s) sin responder`, { icon: '⚠️' })
    }
    submitExam()
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Examen no encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  if (alreadyAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ya rendiste este examen</h2>
          <p className="text-gray-500 mb-6">Solo se permite un intento por examen.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {exam.area}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <BookOpen className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">{exam.questions.length}</p>
              <p className="text-xs text-gray-500">Preguntas</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">{EXAM_MINUTES}</p>
              <p className="text-xs text-gray-500">Minutos</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Target className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">{exam.minPassPercentage}%</p>
              <p className="text-xs text-gray-500">Para aprobar</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <strong>Importante:</strong> Solo tienes <strong>un intento</strong>. Una vez iniciado, el tiempo corre. Asegúrate de responder todas las preguntas antes de enviar.
          </div>

          <button
            onClick={() => setPhase('taking')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-lg transition"
          >
            Comenzar Examen
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 text-gray-500 hover:text-gray-700 py-2 text-sm transition"
          >
            Cancelar
          </button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-700 font-semibold text-lg">Evaluando respuestas...</p>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === exam.questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <ExamProgress
              current={currentIndex + 1}
              total={exam.questions.length}
              answeredCount={answeredCount}
            />
          </div>
          <Timer minutes={EXAM_MINUTES} onTimeUp={handleTimeUp} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            answer={answers[currentQuestion.id] ?? ''}
            onChange={handleAnswer}
          />
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {/* Question index dots */}
          <div className="flex gap-1.5">
            {exam.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-indigo-600 scale-125' :
                  answers[q.id]?.trim() ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmitClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
            >
              <Send className="w-4 h-4" /> Enviar
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
