import { useState } from 'react'
import type { ExamAttempt } from '../types'

export function useExamAttempt() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    const stored = localStorage.getItem('attempts')
    return stored ? JSON.parse(stored) : []
  })

  const saveAttempt = (attempt: Omit<ExamAttempt, 'id'>): ExamAttempt => {
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
    }
    const updated = [...attempts, newAttempt]
    setAttempts(updated)
    localStorage.setItem('attempts', JSON.stringify(updated))
    return newAttempt
  }

  const hasAttempted = (userId: string, examId: string): boolean =>
    attempts.some(a => a.userId === userId && a.examId === examId)

  const getAttemptById = (id: string): ExamAttempt | undefined =>
    attempts.find(a => a.id === id)

  const getUserAttempts = (userId: string): ExamAttempt[] =>
    attempts.filter(a => a.userId === userId)

  return { attempts, saveAttempt, hasAttempted, getAttemptById, getUserAttempts }
}
