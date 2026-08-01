import { collectionGroup, doc, getDocs, query, runTransaction, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from './config'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동되는 0/O, 1/I 제외
const CODE_LENGTH = 6
const EXPIRY_MS = 72 * 60 * 60 * 1000

function randomCode() {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return out
}

export async function generateInviteCode(studentUid: string): Promise<string> {
  const code = randomCode()
  const ref = doc(db, 'users', studentUid, 'inviteCodes', code)
  const now = Date.now()
  await setDoc(ref, {
    code,
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    used: false,
    usedByParentUid: null,
  })
  return code
}

export type RedeemErrorReason = 'invalid' | 'used' | 'expired'

export class RedeemInviteCodeError extends Error {
  reason: RedeemErrorReason
  constructor(reason: RedeemErrorReason) {
    super(reason)
    this.reason = reason
  }
}

export async function redeemInviteCode(parentUid: string, codeInput: string): Promise<{ studentUid: string }> {
  const code = codeInput.trim().toUpperCase()
  const snap = await getDocs(query(collectionGroup(db, 'inviteCodes'), where('code', '==', code)))
  if (snap.empty) {
    throw new RedeemInviteCodeError('invalid')
  }

  const codeDocRef = snap.docs[0].ref
  const studentUid = codeDocRef.parent.parent!.id
  const linkRef = doc(db, 'links', `${studentUid}_${parentUid}`)

  await runTransaction(db, async (tx) => {
    const codeSnap = await tx.get(codeDocRef)
    const data = codeSnap.data()
    if (!data) throw new RedeemInviteCodeError('invalid')
    if (data.used) throw new RedeemInviteCodeError('used')
    if (data.expiresAt < Date.now()) throw new RedeemInviteCodeError('expired')

    tx.update(codeDocRef, { used: true, usedByParentUid: parentUid })
    tx.set(linkRef, { studentUid, parentUid, createdAt: serverTimestamp() })
  })

  return { studentUid }
}
