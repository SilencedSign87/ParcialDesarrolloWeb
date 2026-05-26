import { motion } from 'framer-motion'
import type { Question } from '../../types'

interface QuestionCardProps {
  question: Question
  index: number
  answer: string
  onChange: (value: string) => void
}

export default function QuestionCard({ question, index, answer, onChange }: QuestionCardProps) {
  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl shadow-md p-6 space-y-5"
    >
      <p className="text-gray-800 font-medium text-lg leading-relaxed">
        <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
        {question.text}
      </p>

      {question.type === 'multiple' && question.options ? (
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onChange(String(i))}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium
                ${answer === String(i)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <span className={`inline-block w-7 h-7 rounded-full text-sm font-bold mr-3 text-center leading-7
                ${answer === String(i) ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {optionLabels[i]}
              </span>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={answer}
          onChange={e => onChange(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none text-gray-700"
        />
      )}
    </motion.div>
  )
}
