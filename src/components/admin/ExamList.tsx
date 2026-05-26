import type { Exam, ExamAttempt } from "../../types";

interface ExamListProps {
    exams: Exam[]
    onEdit: (exam: Exam) => void
    onDelete: (id: string) => void
    attempts?: ExamAttempt[]
    onPreview?: (exam: Exam) => void
}
const typeStyles: Record<Exam['type'], string> = {
    multiple: 'bg-blue-100 text-blue-700',
    open: 'bg-amber-100 text-amber-700',
    mixed: 'bg-purple-100 text-purple-700',
}
const difficultyStyles = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
}
export default function ExamList({ exams, onEdit, onDelete, attempts, onPreview }: ExamListProps) {
    const handleDelete = (id: string) => {
        const ok = window.confirm('¿Seguro que deseas eliminar este examen?')
        if (ok) onDelete(id)
    }
    const getDifficulty = (minPassPercentage: number) => {
        if (minPassPercentage >= 80) return 'hard'
        if (minPassPercentage >= 60) return 'medium'
        return 'easy'
    }
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="text-left p-3">Título</th>
                        <th className="text-left p-3">Área</th>
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-left p-3">Preguntas</th>
                        <th className="text-left p-3">Dificultad</th>
                        <th className="text-left p-3">Intentos</th>
                        <th className="text-left p-3">% Mínimo</th>
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-right p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map((exam) => (
                        <tr key={exam.id} className="border-t">
                            <td className="p-3 font-medium">{exam.title}</td>
                            <td className="p-3">{exam.area}</td>
                            <td className="p-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${typeStyles[exam.type]}`}
                                >
                                    {exam.type}
                                </span>
                            </td>
                            <td className="p-3">{exam.questions.length}</td>
                            <td className="p-3">
                                {(() => {
                                    const level = getDifficulty(exam.minPassPercentage)
                                    const label = level === 'hard' ? 'Difícil' : level === 'medium' ? 'Medio' : 'Fácil'
                                    return (
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyStyles[level]}`}
                                        >
                                            {label}
                                        </span>
                                    )
                                })()}
                            </td>
                            <td className="p-3">
                                {attempts ? attempts.filter(a => a.examId === exam.id).length : 0}
                            </td>
                            <td className="p-3">{exam.minPassPercentage}%</td>
                            <td className="p-3">
                                {new Date(exam.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right space-x-2">
                                {onPreview && (
                                    <button
                                        className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs"
                                        onClick={() => onPreview(exam)}
                                    >
                                        Preview
                                    </button>
                                )}
                                <button
                                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs"
                                    onClick={() => onEdit(exam)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                                    onClick={() => handleDelete(exam.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {exams.length === 0 && (
                        <tr>
                            <td className="p-4 text-center text-gray-500" colSpan={7}>
                                No hay exámenes registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
