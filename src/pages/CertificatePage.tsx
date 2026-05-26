import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Award, Download, Copy, ArrowLeft, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCertificates } from '../hooks/useCertificates'
import { downloadCertificateAsPDF } from '../utils/pdf'

export default function CertificatePage() {
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()
  const { getCertificateByHash } = useCertificates()

  const cert = hash ? getCertificateByHash(hash) : undefined

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-800 mb-1">Certificado no encontrado</p>
          <p className="text-sm text-gray-400 mb-5">El código no corresponde a un certificado emitido.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cert.publicUrl)
    toast.success('Enlace copiado')
  }

  const handleDownload = () => {
    downloadCertificateAsPDF('certificate-card', `certificado-${cert.hash}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>

        <div
          id="certificate-card"
          className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-8 border-double border-indigo-200 rounded-2xl p-10 relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            <BadgeCheck className="w-4 h-4" /> VERIFICADO
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-4">
              <Award className="w-9 h-9 text-white" />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 font-semibold">
              Certificado de aprobación
            </p>
            <h1 className="text-3xl font-bold text-slate-800 mt-2">CertApp</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Certificación en Línea</p>

            <div className="w-24 h-px bg-indigo-200 my-6" />

            <p className="text-gray-600">Se certifica que</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cert.userName}</p>

            <p className="text-gray-600 mt-4">ha aprobado exitosamente el examen</p>
            <p className="text-xl font-semibold text-indigo-700 mt-1">{cert.examTitle}</p>

            <p className="text-gray-600 mt-4">
              con un puntaje de <strong className="text-slate-900">{cert.score}%</strong>
            </p>

            <p className="text-sm text-gray-400 mt-6">Emitido el {issuedDate}</p>

            <div className="flex items-end justify-between w-full mt-10 gap-6">
              <div className="text-left">
                <p className="text-xs text-gray-400 mb-1">Código de verificación</p>
                <p className="font-mono text-sm font-bold text-slate-700">{cert.hash}</p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={cert.publicUrl}
                  size={88}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                />
              </div>

              <div className="text-right">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p className="text-xs text-gray-500">Comité Técnico</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
          <button
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Copy className="w-4 h-4" /> Copiar enlace
          </button>
        </div>
      </div>
    </div>
  )
}
