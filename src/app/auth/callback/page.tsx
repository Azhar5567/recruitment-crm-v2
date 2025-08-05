'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useFirebaseAuth } from '@/lib/hooks/use-firebase-auth'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const { user } = useFirebaseAuth()

  useEffect(() => {
    // Firebase handles email verification automatically
    // This page is mainly for display purposes now
    const handleAuthCallback = async () => {
      try {
        if (user) {
          setStatus('success')
          setMessage('Email confirmed successfully! Redirecting to dashboard...')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Wait a bit for Firebase auth to load
          setTimeout(() => {
            if (!user) {
              setStatus('error')
              setMessage('Authentication failed. Please try signing in again.')
            }
          }, 3000)
        }
      } catch (_error) {
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleAuthCallback()
  }, [router, searchParams, user])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {status === 'loading' && (
          <>
            <Loader2 style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
              color: '#667eea'
            }} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1a202c',
              marginBottom: '0.5rem'
            }}>
              Verifying Email...
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#4a5568',
              margin: 0
            }}>
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem',
              color: '#38a169'
            }} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1a202c',
              marginBottom: '0.5rem'
            }}>
              Email Confirmed!
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#4a5568',
              margin: 0
            }}>
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem',
              color: '#e53e3e'
            }} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1a202c',
              marginBottom: '0.5rem'
            }}>
              Verification Failed
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#4a5568',
              marginBottom: '1.5rem'
            }}>
              {message}
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Go Back to Sign In
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <Loader2 style={{ 
            width: '48px', 
            height: '48px', 
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite',
            color: '#667eea'
          }} />
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1a202c',
            marginBottom: '0.5rem'
          }}>
            Loading...
          </h2>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#4a5568',
            margin: 0
          }}>
            Please wait while we verify your email.
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 