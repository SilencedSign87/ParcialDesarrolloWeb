import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Briefcase, GraduationCap, Plus, Award, Trash2, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCertificates } from '../hooks/useCertificates'
import { useCurriculum } from '../hooks/useCurriculum'
import CurriculumEditor from '../components/curriculum/CurriculumEditor'
import type { CurriculumEntry } from '../types'

export default function CurriculumPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { users, currentUser } = useAuth()
  const { getUserCertificates } = useCertificates()
  const { workEntries, educationEntries, addEntry, removeEntry } = useCurriculum(userId ?? '')

  const [editorOpen, setEditorOpen] = useState(false)

  const profile = users.find(u => u.id === userId)
  const isOwner = currentUser?.id === userId
  const certificates = userId ? getUserCertificates(userId) : []

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-gray-500">Usuario no encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  const initials = profile.fullName
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const formatDate = (iso?: string) => {
    if (!iso) return 'Actualidad'
    const d = new Date(iso)
    return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800">{profile.fullName}</h1>
              <p className="text-sm text-gray-500">{profile.specialty}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {profile.email}
              </p>
            </div>
          </div>
        </div>

        <Section
          icon={<Award className="w-4 h-4 text-amber-600" />}
          title="Certificaciones obtenidas"
          count={certificates.length}
        >
          {certificates.length === 0 ? (
            <Empty text="Aún no hay certificados emitidos." />
          ) : (
            <div className="grid gap-3">
              {certificates.map(c => (
                <div key={c.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:border-gray-300 transition">
                  <div>
                    <p className="font-semibold text-slate-800">{c.examTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Puntaje {c.score}% · {new Date(c.issuedAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <Link
                    to={`/certificate/${c.hash}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          icon={<Briefcase className="w-4 h-4 text-blue-600" />}
          title="Experiencia laboral"
          count={workEntries.length}
          action={isOwner && (
            <button
              onClick={() => setEditorOpen(true)}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          )}
        >
          {workEntries.length === 0 ? (
            <Empty text="Sin experiencias registradas." />
          ) : (
            <EntryList entries={workEntries} isOwner={isOwner} onRemove={removeEntry} formatDate={formatDate} />
          )}
        </Section>

        <Section
          icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
          title="Formación académica"
          count={educationEntries.length}
          action={isOwner && (
            <button
              onClick={() => setEditorOpen(true)}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          )}
        >
          {educationEntries.length === 0 ? (
            <Empty text="Sin formación registrada." />
          ) : (
            <EntryList entries={educationEntries} isOwner={isOwner} onRemove={removeEntry} formatDate={formatDate} />
          )}
        </Section>

        {editorOpen && (
          <CurriculumEditor
            onSave={data => addEntry(data)}
            onClose={() => setEditorOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

function Section({
  icon, title, count, action, children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-slate-700">{title}</h2>
          <span className="text-xs text-gray-400">({count})</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 text-center py-4">{text}</p>
}

function EntryList({
  entries, isOwner, onRemove, formatDate,
}: {
  entries: CurriculumEntry[]
  isOwner: boolean
  onRemove: (id: string) => void
  formatDate: (iso?: string) => string
}) {
  return (
    <div className="space-y-3">
      {entries.map(e => (
        <div key={e.id} className="border-l-2 border-blue-200 pl-4 py-1 group relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-800">{e.title}</p>
              <p className="text-sm text-gray-500">{e.institution}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(e.startDate)} — {formatDate(e.endDate)}
              </p>
              {e.description && (
                <p className="text-sm text-gray-600 mt-2">{e.description}</p>
              )}
            </div>
            {isOwner && (
              <button
                onClick={() => onRemove(e.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
