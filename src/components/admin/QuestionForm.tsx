import { useEffect, useState } from "react";
import type { Question } from "../../types";

interface QuestionFormProps {
    open: boolean
    question?: Question
    onSave: (q: Question) => void
    onCancel: () => void
}
const emptyQuestion: Question = {
    id: '',
    text: '',
    type: 'multiple',
    options: ['', '', '', ''],
    correctAnswer: 0,
}
export default function QuestionForm({
    open,
    question,
    onSave,
    onCancel,
}: QuestionFormProps) {
    const [form, setForm] = useState<Question>(emptyQuestion)
    const [error, setError] = useState('')
    useEffect(() => {
        if (question) {
            setForm(question)
        } else {
            setForm(emptyQuestion)
        }
    }, [question, open])
    if (!open) return null
    const handleSave = () => {
        if (!form.text.trim()) {
            setError('La pregunta no puede estar vacía.')
            return
        }
        if (form.type === 'multiple') {
            const opts = form.options ?? []
            if (opts.some(o => !o.trim())) {
                setError('Todas las opciones deben tener texto.')
                return
            }
        }
        setError('')
        const finalQuestion: Question = {
            ...form,
            id: form.id || `q-${Date.now()}`,
        }
        onSave(finalQuestion)
    }
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="text-xl font-bold">
                    {question ? 'Editar pregunta' : 'Nueva pregunta'}
                </h2>
                <textarea
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="Texto de la pregunta"
                    rows={3}
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                />
                <select
                    className="border rounded-lg px-3 py-2 w-full"
                    value={form.type}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            type: e.target.value as Question['type'],
                            // resetea campos según tipo
                            options: e.target.value === 'multiple' ? ['', '', '', ''] : undefined,
                            correctAnswer: e.target.value === 'multiple' ? 0 : '',
                        })
                    }
                >
                    <option value="multiple">Opción múltiple</option>
                    <option value="open">Abierta</option>
                </select>
                {form.type === 'multiple' ? (
                    <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((label, idx) => (
                            <input
                                key={label}
                                className="border rounded-lg px-3 py-2 w-full"
                                placeholder={`Opción ${label}`}
                                value={form.options?.[idx] ?? ''}
                                onChange={(e) => {
                                    const updated = [...(form.options ?? [])]
                                    updated[idx] = e.target.value
                                    setForm({ ...form, options: updated })
                                }}
                            />
                        ))}
                        <select
                            className="border rounded-lg px-3 py-2 w-full"
                            value={Number(form.correctAnswer ?? 0)}
                            onChange={(e) =>
                                setForm({ ...form, correctAnswer: Number(e.target.value) })
                            }
                        >
                            <option value={0}>Correcta: A</option>
                            <option value={1}>Correcta: B</option>
                            <option value={2}>Correcta: C</option>
                            <option value={3}>Correcta: D</option>
                        </select>
                    </div>
                ) : (
                    <input
                        className="border rounded-lg px-3 py-2 w-full"
                        placeholder="Respuesta esperada (opcional)"
                        value={String(form.correctAnswer ?? '')}
                        onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    />
                )}
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