interface ExamProgressProps {
  current: number
  total: number
  answeredCount: number
}

export default function ExamProgress({ current, total, answeredCount }: ExamProgressProps) {
  const progress = Math.round((current / total) * 100)

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Pregunta {current} de {total}</span>
        <span>{answeredCount} respondidas</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
