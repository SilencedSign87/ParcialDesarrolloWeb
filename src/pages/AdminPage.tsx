import { useState } from "react";
import type { Certificate, Exam, ExamAttempt } from "../types";
import { useExams } from "../hooks/useExams";
import { useAuth } from "../context/AuthContext";
import ExamEditor from "../components/admin/ExamEditor";
import ExamList from "../components/admin/ExamList";

type Tab = 'exams' | 'users';

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('exams');
    const { users, currentUser } = useAuth();
    const [openEditor, setOpenEditor] = useState(false)
    const [editingExam, setEditingExam] = useState<Exam | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'area'>('createdAt')
    const [previewExam, setPreviewExam] = useState<Exam | undefined>(undefined)
    const { exams, createExam, updateExam, deleteExam } = useExams()
    const handleNew = () => {
        setEditingExam(undefined)
        setOpenEditor(true)
    }
    const handleEdit = (exam: Exam) => {
        setEditingExam(exam)
        setOpenEditor(true)
    }
    const handleSave = (data: Omit<Exam, 'id' | 'createdAt'>) => {
        if (!currentUser) return
        if (editingExam) {
            updateExam(editingExam.id, data)
        } else {
            createExam({ ...data, createdBy: currentUser.id })
        }
        setOpenEditor(false)
    }

    const certificates: Certificate[] = (() => {
        const stored = localStorage.getItem('certificates')
        return stored ? JSON.parse(stored) : []
    })();

    const attempts: ExamAttempt[] = (() => {
        const stored = localStorage.getItem('attempts')
        return stored ? JSON.parse(stored) : []
    })()

    const filteredExams = exams.filter(exam => {
        const term = search.trim().toLowerCase()
        if (!term) return true
        return (
            exam.title.toLowerCase().includes(term) ||
            exam.area.toLowerCase().includes(term)
        )
    })

    const sortedExams = [...filteredExams].sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        if (sortBy === 'area') return a.area.localeCompare(b.area)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return (
        <div className="p-6 space-y-6">
            {/* modal */}
            <ExamEditor
                open={openEditor}
                exam={editingExam}
                onSave={handleSave}
                onCancel={() => setOpenEditor(false)}
            />
            <PreviewModal exam={previewExam} onClose={() => setPreviewExam(undefined)} />
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel Administrador</h1>
                <p className="text-sm text-gray-500">Gestión de exámenes y usuarios</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Exámenes" value={exams.length} />
                <StatCard label="Usuarios" value={users.length} />
                <StatCard label="Certificados" value={certificates.length} />
            </div>
            {/* Tabs */}
            <div className="flex gap-2">
                <TabButton active={tab === 'exams'} onClick={() => setTab('exams')}>
                    Exámenes
                </TabButton>
                <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
                    Usuarios registrados
                </TabButton>
            </div>
            {/* Content */}
            {tab === 'exams' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Exámenes</h2>
                        <button onClick={handleNew} className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm transition">
                            Nuevo Examen
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="Buscar por título o área"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="border rounded-lg px-3 py-2 text-sm"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'title' | 'area')}
                        >
                            <option value="createdAt">Orden: Fecha</option>
                            <option value="title">Orden: Título</option>
                            <option value="area">Orden: Área</option>
                        </select>
                    </div>
                    <ExamList
                        exams={sortedExams}
                        attempts={attempts}
                        onEdit={handleEdit}
                        onDelete={deleteExam}
                        onPreview={(exam) => setPreviewExam(exam)}
                    />
                </div>
            )}
            {tab === 'users' && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left p-3">Nombre</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Documento</th>
                                <th className="text-left p-3">Especialidad</th>
                                <th className="text-left p-3">Fecha registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-t">
                                    <td className="p-3">{u.fullName}</td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">{u.documentNumber}</td>
                                    <td className="p-3">{u.specialty}</td>
                                    <td className="p-3">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function PreviewModal({ exam, onClose }: { exam?: Exam; onClose: () => void }) {
    if (!exam) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Preview del examen</h3>
                    <button className="text-sm text-gray-500" onClick={onClose}>Cerrar</button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Título:</strong> {exam.title}</p>
                    <p><strong>Área:</strong> {exam.area}</p>
                    <p><strong>Tipo:</strong> {exam.type}</p>
                    <p><strong>% mínimo:</strong> {exam.minPassPercentage}%</p>
                    <p><strong>Preguntas:</strong> {exam.questions.length}</p>
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                    {exam.questions.map((q, idx) => (
                        <div key={q.id} className="text-sm">
                            <p className="font-medium">{idx + 1}. {q.text}</p>
                            {q.type === 'multiple' && q.options && (
                                <ul className="pl-4 text-gray-600 list-disc">
                                    {q.options.map((opt, i) => (
                                        <li key={`${q.id}-opt-${i}`}>{opt}</li>
                                    ))}
                                </ul>
                            )}
                            {q.type === 'open' && (
                                <p className="text-gray-500">Respuesta abierta</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${active
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {children}
        </button>
    )
}
