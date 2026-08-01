import { initializeApp } from 'firebase/app'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 로컬 개발(npm run dev) 시 기본적으로 Firebase Local Emulator Suite를 사용해
// 실수로 프로덕션 Auth/Firestore를 건드리지 않도록 함.
// 실제 프로덕션 백엔드로 개발 서버를 띄워야 하면 .env에 VITE_USE_FIREBASE_EMULATOR=false 설정.
const useEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false'

export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// 에뮬레이터는 재시작 시 데이터가 초기화되므로 오프라인 영구 캐시를 쓰지 않음
export const db = useEmulator
  ? initializeFirestore(app, {})
  : initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

const AUTH_EMAIL_DOMAIN = 'study-log.local'

export function toInternalEmail(loginId: string): string {
  return `${loginId}@${AUTH_EMAIL_DOMAIN}`
}
