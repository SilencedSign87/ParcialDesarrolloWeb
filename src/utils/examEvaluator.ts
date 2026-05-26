import type { Exam } from '../types'

export function evaluateExam(exam: Exam, answers: Record<string, string>): number {
  let correct = 0
  exam.questions.forEach(q => {
    if (q.type === 'multiple') {
      if (answers[q.id] === String(q.correctAnswer)) correct++
    } else if (q.type === 'open') {
      if (answers[q.id]?.trim().length > 0) correct++
    }
  })
  return Math.round((correct / exam.questions.length) * 100)
}

export function getCorrectCount(exam: Exam, answers: Record<string, string>): number {
  return exam.questions.filter(q => {
    if (q.type === 'multiple') return answers[q.id] === String(q.correctAnswer)
    return answers[q.id]?.trim().length > 0
  }).length
}
