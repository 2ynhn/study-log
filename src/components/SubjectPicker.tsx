import { useState } from 'react'
import { SUBJECT_GROUPS } from '../data/subjects'
import type { SelectedSubjects } from '../types'

interface SubjectPickerProps {
  value: SelectedSubjects
  onChange: (value: SelectedSubjects) => void
}

function CheckLabel({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} className="visually-hidden" />
      <span className={`check-box${checked ? ' checked' : ''}`} aria-hidden="true">
        {checked ? '✓' : ''}
      </span>
      {children}
    </label>
  )
}

export function SubjectPicker({ value, onChange }: SubjectPickerProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggleGroup(name: string) {
    const has = value.대표과목.includes(name)
    const 대표과목 = has ? value.대표과목.filter((n) => n !== name) : [...value.대표과목, name]
    const group = SUBJECT_GROUPS.find((g) => g.name === name)
    const 상세과목 = has && group ? value.상세과목.filter((d) => !group.detail.includes(d)) : value.상세과목
    onChange({ 대표과목, 상세과목 })
  }

  function toggleDetail(groupName: string, detail: string) {
    const has = value.상세과목.includes(detail)
    const 상세과목 = has ? value.상세과목.filter((d) => d !== detail) : [...value.상세과목, detail]
    const 대표과목 = value.대표과목.includes(groupName) ? value.대표과목 : [...value.대표과목, groupName]
    onChange({ 대표과목, 상세과목 })
  }

  return (
    <ul className="card-list">
      {SUBJECT_GROUPS.map((group) => (
        <li key={group.name} className="card">
          <div className="check-row">
            <CheckLabel checked={value.대표과목.includes(group.name)} onChange={() => toggleGroup(group.name)}>
              {group.name}
            </CheckLabel>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(expanded === group.name ? null : group.name)}
            >
              {expanded === group.name ? '접기' : '상세 선택'}
            </button>
          </div>
          {expanded === group.name && (
            <ul className="detail-list">
              {group.detail.map((detail) => (
                <li key={detail} className="check-row">
                  <CheckLabel
                    checked={value.상세과목.includes(detail)}
                    onChange={() => toggleDetail(group.name, detail)}
                  >
                    {detail}
                  </CheckLabel>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
