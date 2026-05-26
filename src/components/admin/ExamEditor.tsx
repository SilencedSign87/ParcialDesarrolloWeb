import { useEffect, useState } from "react";
import type { Exam, Question } from "../../types";

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
                        <button className="text-indigo-600 text-sm font-medium">
                            + Agregar Pregunta
                        </button>
                    </div>
                    {form.questions.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay preguntas aún.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {form.questions.map((q) => (
                                <li key={q.id} className="p-2 bg-gray-50 rounded">
                                    {q.text}
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
        </div>
    )
}