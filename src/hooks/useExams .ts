import { useState } from "react";
import type { Exam } from "../types";

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