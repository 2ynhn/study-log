import type { SelectedSubjects } from '../types'

export interface SubjectGroup {
  name: string
  detail: string[]
}

export const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    name: '국어',
    detail: ['화법과 언어', '독서와 작문', '문학', '주제 탐구 독서', '문학과 영상', '매체 의사소통'],
  },
  {
    name: '수학',
    detail: ['대수', '미적분Ⅰ', '미적분Ⅱ', '확률과 통계', '기하', '인공지능 수학', '경제 수학', '수학과제 탐구'],
  },
  {
    name: '영어',
    detail: ['영어Ⅰ', '영어Ⅱ', '영어 독해와 작문', '영미 문학 읽기', '심화 영어'],
  },
  {
    name: '한국사',
    detail: ['한국사1', '한국사2'],
  },
  {
    name: '통합사회',
    detail: ['통합사회1', '통합사회2'],
  },
  {
    name: '통합과학',
    detail: ['통합과학1', '통합과학2', '과학탐구실험1', '과학탐구실험2'],
  },
  {
    name: '사회',
    detail: [
      '세계시민과 지리',
      '세계사',
      '한국지리 탐구',
      '동아시아 역사 기행',
      '정치',
      '법과 사회',
      '경제',
      '윤리와 사상',
      '인문학과 윤리',
      '사회와 문화',
      '국제 관계의 이해',
    ],
  },
  {
    name: '과학',
    detail: [
      '물리학',
      '화학',
      '생명과학',
      '지구과학',
      '역학과 에너지',
      '전자기와 양자',
      '물질과 에너지',
      '화학 반응의 세계',
      '세포와 물질대사',
      '생물의 유전',
      '지구시스템과학',
      '행성우주과학',
    ],
  },
  {
    name: '체육',
    detail: ['체육1', '체육2', '운동과 건강', '스포츠 문화', '스포츠 과학'],
  },
  {
    name: '예술',
    detail: ['음악', '미술', '연극', '음악 연주와 창작', '미술 창작'],
  },
  {
    name: '기술·가정/정보',
    detail: ['기술·가정', '정보', '인공지능 기초', '데이터 과학'],
  },
  {
    name: '제2외국어/한문',
    detail: ['독일어', '프랑스어', '스페인어', '중국어', '일본어', '러시아어', '아랍어', '베트남어', '한문'],
  },
  {
    name: '교양',
    detail: ['진로와 직업', '생태와 환경', '논리와 사고', '철학', '심리학', '교육학', '논술'],
  },
]

export interface StudyItem {
  subject: string
  parentSubject: string
  label: string
}

export function buildStudyItems(selected: SelectedSubjects | undefined): StudyItem[] {
  if (!selected) return []
  const items: StudyItem[] = []
  for (const groupName of selected.대표과목) {
    const group = SUBJECT_GROUPS.find((g) => g.name === groupName)
    const details = group ? selected.상세과목.filter((d) => group.detail.includes(d)) : []
    if (details.length === 0) {
      items.push({ subject: groupName, parentSubject: groupName, label: groupName })
    } else {
      for (const detail of details) {
        items.push({ subject: detail, parentSubject: groupName, label: `${groupName} · ${detail}` })
      }
    }
  }
  return items
}
