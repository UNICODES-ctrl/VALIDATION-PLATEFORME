"use client"
import { UserProfil } from "@/Utils/VAE.type"

import { useState, useEffect, ReactNode, Dispatch, SetStateAction, createContext, useContext } from "react"

type UserContextType = {
  user: UserProfil | null
  setUser: Dispatch<SetStateAction<UserProfil | null>>  
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfil | null>(null)

  const refreshUser = async () => {
    const res = await fetch("/api/profil")
    const data = await res.json()
    if (data.user) setUser(data.user)
  }

  useEffect(() => { 
  const load = async () => { await refreshUser() }
  load()
}, [])

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser doit être dans UserProvider")
  return ctx
}