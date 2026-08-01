import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { generateInviteCode } from '../firebase/inviteCodes'
import { removeLink, subscribeParentsOfStudent } from '../firebase/links'
import type { StudentParentLink } from '../types'

export function ParentLinksPage() {
  const { user } = useAuth()
  const [parents, setParents] = useState<StudentParentLink[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeParentsOfStudent(user.uid, setParents)
  }, [user])

  async function handleIssueCode() {
    if (!user) return
    setIssuing(true)
    const code = await generateInviteCode(user.uid)
    setInviteCode(code)
    setIssuing(false)
  }

  async function handleRemove(parentUid: string) {
    if (!user) return
    await removeLink(user.uid, parentUid)
  }

  return (
    <section>
      <h1>연결된 학부모 관리</h1>

      {parents.length === 0 ? (
        <p>연결된 학부모가 없습니다.</p>
      ) : (
        <ul>
          {parents.map((link) => (
            <li key={link.parentUid}>
              {link.parentUid}
              <button type="button" onClick={() => handleRemove(link.parentUid)}>
                연결 해제
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" disabled={issuing} onClick={handleIssueCode}>
        새 초대코드 발급
      </button>
      {inviteCode && <p>초대코드: {inviteCode} (72시간 유효, 1회용)</p>}
    </section>
  )
}
