import { useState } from "react";
import type { Certificate } from "../types";
import { useExams } from "../hooks/useExams";
import { useAuth } from "../context/AuthContext";

type Tab = 'exams' | 'users';

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('exams');
    const { users } = useAuth();
    const { exams } = useExams();
    const certificates: Certificate[] = (() => {
        const stored = localStorage.getItem('certificates')
        return stored ? JSON.parse(stored) : []
    })();

    return (
        <div className="p-6 space-y-6">
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
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                            Nuevo Examen
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-600">
                        Total: {exams.length} exámenes
                    </div>
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
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700'
                }`}
        >
            {children}
        </button>
    )
}
