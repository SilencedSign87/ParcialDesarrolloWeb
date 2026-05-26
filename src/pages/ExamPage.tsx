import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Send, BookOpen, Clock, Target, ArrowLeft } from 'lucide-react'
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

  const submitExam = useCallback(() => {
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
    setTimeout(() => navigate(`/results/${attempt.id}`), 900)
  }, [currentUser, exam, answers, saveAttempt, navigate])

  const handleTimeUp = useCallback(() => {
    toast.error('Tiempo agotado')
    submitExam()
  }, [submitExam])

  const handleSubmitClick = () => {
    const unanswered = exam ? exam.questions.length - answeredCount : 0
    if (unanswered > 0) toast(`${unanswered} pregunta(s) sin responder`, { icon: '⚠️' })
    submitExam()
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-gray-500">Examen no encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  if (alreadyAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-sm w-full text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">Ya rendiste este examen</p>
          <p className="text-sm text-gray-400 mb-6">Solo se permite un intento por examen.</p>
          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-medium transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  /* ── INTRO ── */
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="mb-6">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-widest">{exam.area}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{exam.title}</h1>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <BookOpen className="w-4 h-4" />, value: exam.questions.length, label: 'Preguntas' },
              { icon: <Clock className="w-4 h-4" />, value: `${EXAM_MINUTES} min`, label: 'Tiempo' },
              { icon: <Target className="w-4 h-4" />, value: `${exam.minPassPercentage}%`, label: 'Para aprobar' },
            ].map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 text-center">
                <div className="text-gray-400 flex justify-center mb-1">{item.icon}</div>
                <p className="text-lg font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-6">
            Solo tienes <strong className="text-gray-700">un intento</strong>. El tiempo inicia al presionar comenzar.
          </p>

          <button onClick={() => setPhase('taking')}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Comenzar examen
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="w-full mt-2 flex items-center justify-center gap-1 text-gray-400 hover:text-gray-600 py-2 text-sm transition"
          >
            <ArrowLeft className="w-3 h-3" /> Cancelar
          </button>
        </motion.div>
      </div>
    )
  }

  /* ── SUBMITTING ── */
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Evaluando respuestas...</p>
        </div>
      </div>
    )
  }

  /* ── TAKING ── */
  const currentQuestion = exam.questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === exam.questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">{exam.title}</p>
            <ExamProgress current={currentIndex + 1} total={exam.questions.length} answeredCount={answeredCount} />
          </div>
          <Timer minutes={EXAM_MINUTES} onTimeUp={handleTimeUp} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Dots */}
        <div className="flex gap-1.5 flex-wrap">
          {exam.questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrentIndex(i)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                i === currentIndex
                  ? 'bg-gray-900 text-white'
                  : answers[q.id]?.trim()
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            answer={answers[currentQuestion.id] ?? ''}
            onChange={handleAnswer}
          />
        </AnimatePresence>

        {/* Navegación */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {isLast ? (
            <button onClick={handleSubmitClick}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold transition"
            >
              <Send className="w-4 h-4" /> Enviar examen
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(i => i + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold transition"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
