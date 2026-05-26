import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CurriculumEntry } from '../../types'

interface CurriculumEditorProps {
  onSave: (data: Omit<CurriculumEntry, 'id' | 'userId'>) => void
  onClose: () => void
}

export default function CurriculumEditor({ onSave, onClose }: CurriculumEditorProps) {
  const [type, setType] = useState<'work' | 'education'>('work')
  const [title, setTitle] = useState('')
  const [institution, setInstitution] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [current, setCurrent] = useState(false)
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !institution.trim() || !startDate) {
      toast.error('Completa los campos obligatorios')
      return
    }
    onSave({
      type,
      title: title.trim(),
      institution: institution.trim(),
      startDate,
      endDate: current ? undefined : endDate || undefined,
      description: description.trim() || undefined,
    })
    toast.success('Entrada guardada')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800">Nueva entrada</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'work' | 'education')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="work">Experiencia laboral</option>
              <option value="education">Formación académica</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {type === 'work' ? 'Cargo' : 'Título / grado'}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {type === 'work' ? 'Empresa' : 'Institución'}
            </label>
            <input
              type="text"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                disabled={current}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={current}
              onChange={e => setCurrent(e.target.checked)}
            />
            Actualmente
          </label>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
