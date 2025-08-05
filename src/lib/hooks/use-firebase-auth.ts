'use client'

import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const signUp = async (email: string, password: string, companyName: string, mobileNumber: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password)
      const user = userCredential.user

      // Send email verification
      await sendEmailVerification(user)

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        companyName,
        mobileNumber,
        createdAt: new Date().toISOString(),
        emailVerified: false
      })

      // Sign out the user immediately after creating account
      // They need to verify email before they can sign in
      await signOut(auth)

      setSuccess('Account created successfully! Please check your email and verify your account before signing in.')
      return { success: true }
    } catch (error: unknown) {
      let errorMessage = 'Failed to create account'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address'
      }
      
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password)
      const user = userCredential.user

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth)
        setError('Please verify your email address before signing in. Check your inbox for the verification link.')
        return { success: false, error: 'Email not verified' }
      }

      setSuccess('Signed in successfully!')
      return { success: true, user }
    } catch (error: unknown) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else {
        setError('Failed to sign in. Please try again.')
      }
      
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
      setSuccess('Signed out successfully!')
    } catch (error: unknown) {
      setError('Failed to sign out.')
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await sendPasswordResetEmail(auth!, email)
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (error: unknown) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else {
        setError('Failed to send password reset email.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      setError('No user is currently signed in.')
      return
    }

    try {
      await sendEmailVerification(auth.currentUser)
      setSuccess('Verification email sent! Check your inbox.')
    } catch (error: unknown) {
      setError('Failed to send verification email.')
    }
  }

  return {
    signUp,
    signIn,
    signOut: signOutUser,
    resetPassword,
    resendVerificationEmail,
    loading,
    error,
    success
  }
} 