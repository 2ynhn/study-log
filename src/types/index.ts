export type UserRole = 'student' | 'parent'

export interface SelectedSubjects {
  대표과목: string[]
  상세과목: string[]
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly'

export type SubjectGoals = Record<string, number>

export interface UserGoals {
  daily: SubjectGoals
  weekly: SubjectGoals
  monthly: SubjectGoals
}

export interface AppUser {
  uid: string
  role: UserRole
  selectedSubjects?: SelectedSubjects
  goals?: UserGoals
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
}

export interface StudyRecord {
  date: string
  subject: string
  parentSubject: string
  minutes: number
  updatedAt: number
}
