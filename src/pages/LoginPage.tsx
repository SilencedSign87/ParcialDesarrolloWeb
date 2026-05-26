import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from 'lucide-react'
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

/*
    Admin: admin@cert.pe / admin123
*/
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const ok = login(form.email, form.password);
        setLoading(false);
        if (ok) {
            toast.success('¡Bienvenido de nuevo!')
            navigate('/dashboard');
        } else {
            toast.error('Credenciales incorrectas')
        }
    }

    return (
        <div className="min-h-screen bg-blue-500/20 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">CertApp</h1>
                    <p className="text-gray-500 text-sm">Sistema de Certificación en Línea</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
