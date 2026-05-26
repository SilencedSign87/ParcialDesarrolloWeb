import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
    const { currentUser } = useAuth()
    if (!currentUser) return <Navigate to="/login" />
    if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/dashboard" />
    return <>{children}</>
}