import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
            {/* <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} /> */}
            {/* <Route path="/exam/:examId" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} /> */}
            {/* <Route path="/results/:attemptId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} /> */}
            {/* <Route path="/certificate/:hash" element={<CertificatePage />} /> */}
            {/* <Route path="/curriculum/:userId" element={<CurriculumPage />} /> */}
        </Routes>
    )
}