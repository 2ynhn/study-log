import { SUBJECT_GROUPS } from '../data/subjects'

export function SubjectSetupPage() {
  return (
    <section>
      <h1>공부할 과목 선택</h1>
      <p>대표과목을 선택하고, 필요하면 펼쳐서 상세과목을 선택하세요.</p>
      <ul>
        {SUBJECT_GROUPS.map((group) => (
          <li key={group.name}>{group.name}</li>
        ))}
      </ul>
    </section>
  )
}
