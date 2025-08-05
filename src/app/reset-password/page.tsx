'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  Lock, Eye, EyeOff, ArrowRight, CheckCircle, XCircle
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/hooks/use-firebase-auth'

function ResetPasswordContent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const firebaseAuth = useFirebaseAuth()

  
  // Password reset state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetStep, setResetStep] = useState<'verifying' | 'setting-password' | 'complete'>('verifying')



  // Handle password reset flow
  useEffect(() => {
    const handlePasswordReset = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setError(`Password reset failed: ${errorDescription || error}`)
        setResetStep('complete')
        return
      }

      if (code) {
        setLoading(true)
        setError('')

        try {
          // Firebase handles password reset differently
          // For now, just proceed to password setting step
          setResetStep('setting-password')
        } catch (error) {
          console.error('Password reset exception:', error)
          setError('An unexpected error occurred during password reset')
          setResetStep('complete')
        } finally {
          setLoading(false)
        }
      } else {
        setError('Invalid reset link. Please request a new password reset.')
        setResetStep('complete')
      }
    }

    handlePasswordReset()
  }, [searchParams])

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const result = await firebaseAuth.updatePassword(newPassword)

      if (result.success) {
        await firebaseAuth.signOut()
        setSuccess('Password updated successfully! You can now sign in with your new password.')
        setResetStep('complete')
      } else {
        setError(result.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password update exception:', error)
      setError('An unexpected error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  // If user is authenticated and we're not in password reset mode, redirect
  if (user && resetStep === 'verifying') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3730a3 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Redirecting to Dashboard...</div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3730a3 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(25px)',
        borderRadius: '28px',
        padding: '3rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: '700',
            letterSpacing: '-0.025em',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Lock size={26} />
            </div>
            <span style={{ letterSpacing: '-0.02em' }}>Reset Password</span>
          </div>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            {resetStep === 'verifying' && 'Verifying your reset link...'}
            {resetStep === 'setting-password' && 'Set your new password'}
            {resetStep === 'complete' && 'Password reset complete'}
          </p>
        </div>

        {/* Loading State */}
        {resetStep === 'verifying' && loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid transparent', 
              borderTop: '3px solid #fbbf24', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Verifying reset link...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '8px',
            borderLeft: '4px solid #ef4444',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={16} color="#ef4444" />
              <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            borderRadius: '8px',
            borderLeft: '4px solid #22c55e',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#22c55e" />
              <p style={{ fontSize: '0.875rem', color: '#bbf7d0', margin: 0 }}>{success}</p>
            </div>
          </div>
        )}

        {/* Password Reset Form */}
        {resetStep === 'setting-password' && (
          <form onSubmit={handleSetNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock style={{ width: '16px', height: '16px' }} />
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  style={{
                    width: 'calc(100% - 2px)',
                    padding: '0.5rem 2rem 0.5rem 2rem',
                    height: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#1a202c',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4a5568',
                    transition: 'color 0.2s'
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock style={{ width: '16px', height: '16px' }} />
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  style={{
                    width: 'calc(100% - 2px)',
                    padding: '0.5rem 2rem 0.5rem 2rem',
                    height: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#1a202c',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4a5568',
                    transition: 'color 0.2s'
                  }}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </div>

            {/* Update Password Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                color: '#1a202c',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(251, 191, 36, 0.3)'
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid transparent', 
                    borderTop: '2px solid #1a202c', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }}></div>
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Sign In */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => router.push('/signin')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <ArrowRight size={16} />
            Back to Sign In
          </button>
        </div>

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

export default function ResetPasswordPage() {
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
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid transparent',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Loading...
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 