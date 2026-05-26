import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Exam, Question } from "../../types";
import QuestionForm from "./QuestionForm";

interface ExamEditorProps {
    open: boolean
    exam?: Exam
    onSave: (data: Omit<Exam, 'id' | 'createdAt'>) => void
    onCancel: () => void
}
const initialForm = {
    title: '',
    area: '',
    type: 'multiple' as Exam['type'],
    minPassPercentage: 60,
    questions: [] as Question[],
    createdBy: '',
}
export default function ExamEditor({
    open,
    exam,
    onSave,
    onCancel,
}: ExamEditorProps) {
    const [openQuestion, setOpenQuestion] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined)
    const [form, setForm] = useState(initialForm)
    const [error, setError] = useState('')
    useEffect(() => {
        if (exam) {
            setForm({
                title: exam.title,
                area: exam.area,
                type: exam.type,
                minPassPercentage: exam.minPassPercentage,
                questions: exam.questions,
                createdBy: exam.createdBy,
            })
        } else {
            setForm(initialForm)
        }
    }, [exam, open])
    if (!open) return null
    const handleSave = () => {
        if (form.questions.length === 0) {
            setError('Debes agregar al menos 1 pregunta.')
            return
        }
        setError('')
        onSave(form)
        toast.success(exam ? 'Examen actualizado' : 'Examen creado')
    }
    const handleAddQuestion = () => {
        setEditingQuestion(undefined)
        setOpenQuestion(true)
    }
    const handleEditQuestion = (q: Question) => {
        setEditingQuestion(q)
        setOpenQuestion(true)
    }
    const handleSaveQuestion = (q: Question) => {
        setForm(prev => {
            const exists = prev.questions.find(x => x.id === q.id)
            const updated = exists
                ? prev.questions.map(x => (x.id === q.id ? q : x))
                : [...prev.questions, q]
            return { ...prev, questions: updated }
        })
        setOpenQuestion(false)
    }
    const handleDeleteQuestion = (id: string) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id),
        }))
    }
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="text-xl font-bold">
                    {exam ? 'Editar examen' : 'Nuevo examen'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="border rounded-lg px-3 py-2"
                        placeholder="Título"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <input
                        className="border rounded-lg px-3 py-2"
                        placeholder="Área temática"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                    />
                    <select
                        className="border rounded-lg px-3 py-2"
                        value={form.type}
                        onChange={(e) =>
                            setForm({ ...form, type: e.target.value as Exam['type'] })
                        }
                    >
                        <option value="multiple">Opción múltiple</option>
                        <option value="open">Preguntas abiertas</option>
                        <option value="mixed">Mixto</option>
                    </select>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="border rounded-lg px-3 py-2"
                        placeholder="% mínimo"
                        value={form.minPassPercentage}
                        onChange={(e) =>
                            setForm({ ...form, minPassPercentage: Number(e.target.value) })
                        }
                    />
                </div>
                {/* Lista de preguntas */}
                <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">Preguntas</p>
                        <button
                            onClick={handleAddQuestion}
                            className="text-indigo-600 text-sm font-medium"
                        >
                            + Agregar Pregunta
                        </button>
                    </div>
                    {form.questions.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay preguntas aún.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {form.questions.map((q) => (
                                <li key={q.id} className="p-2 bg-gray-50 rounded flex items-start justify-between gap-3">
                                    <span>{q.text}</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="text-xs text-indigo-600 whitespace-nowrap"
                                            onClick={() => handleEditQuestion(q)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-red-600 whitespace-nowrap"
                                            onClick={() => handleDeleteQuestion(q.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-100"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                        onClick={handleSave}
                    >
                        Guardar
                    </button>
                </div>
            </div>
            <QuestionForm 
                open={openQuestion}
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => setOpenQuestion(false)}
            />
        </div>
    )
}
