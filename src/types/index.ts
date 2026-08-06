export type UserRole = 'student' | 'parent'
export type SchoolLevel = 'middle' | 'high'

export interface SelectedSubjects {
  대표과목: string[]
  상세과목: string[]
}

export type SubjectGoals = Record<string, number>

export interface UserGoals {
  weekly: SubjectGoals
}

export interface InviteCode {
  code: string
  createdAt: number
  expiresAt: number
  used: boolean
  usedByParentUid: string | null
}

export interface StudentParentLink {
  studentUid: string
  parentUid: string
  createdAt: number
  nickname?: string
}

export interface StudyRecord {
  date: string
  subject: string
  parentSubject: string
  minutes: number
  updatedAt: number
}

export interface CheerMessage {
  text: string
  fromParentUid: string
  createdAt: number
  read: boolean
}
