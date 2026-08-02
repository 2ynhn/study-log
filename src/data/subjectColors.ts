export interface SubjectColor {
  vivid: string
  muted: string
}

// 디자인 핸드오프에서 지정된 5개 색상 + 같은 톤으로 확장한 나머지 8개
export const SUBJECT_COLORS: Record<string, SubjectColor> = {
  국어: { vivid: '#8ec8ea', muted: '#d3e9f6' },
  수학: { vivid: '#f0a99f', muted: '#f9e2de' },
  영어: { vivid: '#ecd68f', muted: '#f5ebcb' },
  한국사: { vivid: '#94d7d2', muted: '#d2f0ee' },
  통합사회: { vivid: '#c3b6ef', muted: '#e8e2f9' },
  통합과학: { vivid: '#a3d9a5', muted: '#dcf0dd' },
  사회: { vivid: '#e8b088', muted: '#f8e5d5' },
  과학: { vivid: '#94b8e6', muted: '#dbe8f8' },
  체육: { vivid: '#ef9bb0', muted: '#fbe1e8' },
  예술: { vivid: '#d9a0d4', muted: '#f3e0f2' },
  '기술·가정/정보': { vivid: '#9fb5c9', muted: '#e3eaf1' },
  '제2외국어/한문': { vivid: '#c9a876', muted: '#ede2cc' },
  교양: { vivid: '#b3c17a', muted: '#e6ecd4' },
}

const FALLBACK_COLOR: SubjectColor = { vivid: '#b7b0a6', muted: '#e5e2dc' }

export function subjectColorFor(parentSubject: string): SubjectColor {
  return SUBJECT_COLORS[parentSubject] ?? FALLBACK_COLOR
}
