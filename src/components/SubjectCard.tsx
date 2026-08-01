const PRESETS: { label: string; minutes: number }[] = [
  { label: '+15분', minutes: 15 },
  { label: '+30분', minutes: 30 },
  { label: '+1시간', minutes: 60 },
]

interface SubjectCardProps {
  label: string
  minutes: number
  readOnly?: boolean
  onAddMinutes?: (minutes: number) => void
}

export function SubjectCard({ label, minutes, readOnly = false, onAddMinutes }: SubjectCardProps) {
  return (
    <li className="card">
      <div>
        <h3>{label}</h3>
        <p className="muted">오늘 {minutes}분</p>
      </div>
      {!readOnly && (
        <div className="chip-row">
          {PRESETS.map((preset) => (
            <button key={preset.label} type="button" className="chip" onClick={() => onAddMinutes?.(preset.minutes)}>
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}
