import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from './use-firebase-auth'

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore()
  const router = useRouter()
  const firebaseAuth = useFirebaseAuth()

  // Use Firebase auth state
  useEffect(() => {
    setUser(firebaseAuth.user)
    setLoading(firebaseAuth.loading)
  }, [firebaseAuth.user, firebaseAuth.loading, setUser, setLoading])

  // Handle navigation on auth state changes
  useEffect(() => {
    if (!firebaseAuth.loading) {
      if (firebaseAuth.user) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [firebaseAuth.user, firebaseAuth.loading, router])

  // Delegate auth methods to Firebase
  const signUp = async (email: string, password: string, fullName?: string, companyName?: string, mobileNumber?: string) => {
    return firebaseAuth.signUp(email, password, { fullName, companyName, mobileNumber })
  }

  const signIn = async (email: string, password: string) => {
    return firebaseAuth.signIn(email, password)
  }

  const signOut = async () => {
    return firebaseAuth.signOut()
  }

  const resetPassword = async (email: string) => {
    return firebaseAuth.resetPassword(email)
  }

  const updatePassword = async (password: string) => {
    return firebaseAuth.updatePassword(password)
  }

  return {
    user: firebaseAuth.user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading: firebaseAuth.loading,
    error: firebaseAuth.error,
    clearError: firebaseAuth.clearError
  }
} 