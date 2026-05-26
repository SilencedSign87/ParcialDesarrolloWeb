import { motion } from "framer-motion";
import { UserPlusIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const { register } = useAuth();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        specialty: '',
        documentNumber: '',
        role: 'user',
        password: '',
    });
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await register({
            email: form.email,
            documentNumber: form.documentNumber,
            fullName: form.fullName,
            password: form.password,
            specialty: form.specialty,
        })) {
            toast.success('Registro exitoso, ya puedes iniciar sesión')
            navigate('/login');
        } else {
            toast.error('Error al registrar, intenta con otro correo o número de documento')
        }

    }
    return (
        <div className="min-h-screen bg-blue-500/20 flex items-center flex-col gap-8 justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlusIcon className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">CertApp</h1>
                    <p className="text-gray-500 text-sm">Registrato</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Número de documento"
                        value={form.documentNumber}
                        onChange={e => setForm({ ...form, documentNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <hr className="border-t mb-4 opacity-30" />
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        Registrarse
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
