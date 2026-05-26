import { useState } from 'react'
import type { CurriculumEntry } from '../types'

const storageKey = (userId: string) => `curriculum-${userId}`

export function useCurriculum(userId: string) {
  const [entries, setEntries] = useState<CurriculumEntry[]>(() => {
    const stored = localStorage.getItem(storageKey(userId))
    return stored ? JSON.parse(stored) : []
  })

  const persist = (updated: CurriculumEntry[]) => {
    setEntries(updated)
    localStorage.setItem(storageKey(userId), JSON.stringify(updated))
  }

  const addEntry = (data: Omit<CurriculumEntry, 'id' | 'userId'>) => {
    const entry: CurriculumEntry = {
      ...data,
      id: `cv-${Date.now()}`,
      userId,
    }
    persist([entry, ...entries])
    return entry
  }

  const removeEntry = (id: string) => {
    persist(entries.filter(e => e.id !== id))
  }

  const workEntries = entries.filter(e => e.type === 'work')
  const educationEntries = entries.filter(e => e.type === 'education')

  return { entries, workEntries, educationEntries, addEntry, removeEntry }
}
