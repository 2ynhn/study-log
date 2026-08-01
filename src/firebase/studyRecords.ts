import { collection, doc, increment, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from './config'
import type { StudyRecord } from '../types'

function studyRecordId(date: string, subject: string) {
  return `${date}_${subject}`
}

export async function addStudyMinutes(
  studentUid: string,
  date: string,
  subject: string,
  parentSubject: string,
  minutesDelta: number,
) {
  const ref = doc(db, 'users', studentUid, 'studyRecords', studyRecordId(date, subject))
  await setDoc(
    ref,
    {
      date,
      subject,
      parentSubject,
      minutes: increment(minutesDelta),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export function subscribeRecordsForDate(studentUid: string, date: string, cb: (records: StudyRecord[]) => void) {
  const q = query(collection(db, 'users', studentUid, 'studyRecords'), where('date', '==', date))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as StudyRecord)))
}

export function subscribeRecordsForRange(
  studentUid: string,
  startDate: string,
  endDate: string,
  cb: (records: StudyRecord[]) => void,
) {
  const q = query(
    collection(db, 'users', studentUid, 'studyRecords'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as StudyRecord)))
}
