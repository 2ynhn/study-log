import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserDoc } from '../firebase/users'

export interface AuthContextValue {
  user: User | null
  userDoc: UserDoc | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}
