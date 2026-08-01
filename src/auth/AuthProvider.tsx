import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase/config'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [docLoading, setDocLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthLoading(false)
      if (!nextUser) {
        setUserDoc(null)
        setDocLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    setDocLoading(true)
    return subscribeUserDoc(user.uid, (doc) => {
      setUserDoc(doc)
      setDocLoading(false)
    })
  }, [user])

  return (
    <AuthContext.Provider value={{ user, userDoc, loading: authLoading || docLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
