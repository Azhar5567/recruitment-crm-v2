'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  Users, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/hooks/use-firebase-auth'

export default function SignInPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Sign in form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('')

  const { signIn, resetPassword } = useFirebaseAuth()

  // Handle redirect in useEffect to avoid render-time navigation
  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/dashboard')
    }
  }, [user, router, isRedirecting])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        setSuccess('Signed in successfully!')
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to sign in')
      }
    } catch (error: unknown) {
      setError((error as Error)?.message || 'An error occurred during sign-in')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setError('')
    setForgotPasswordSuccess('')

    if (!email) {
      setError('Please enter your email address')
      setForgotPasswordLoading(false)
      return
    }

    try {
      await resetPassword(email)
      setForgotPasswordSuccess('Password reset email sent! Check your inbox.')
      setShowForgotPassword(false)
    } catch (error: unknown) {
      setError((error as Error)?.message || 'Failed to send reset email')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
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
              <Users size={26} />
            </div>
            <span style={{ letterSpacing: '-0.02em' }}>Omperra</span>
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '1.05rem',
            fontWeight: '400',
            letterSpacing: '0.01em'
          }}>
            Sign in to your account
          </p>
        </div>
        
        {/* Sign In Form */}
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ width: '16px', height: '16px' }} />
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                style={{
                  width: 'calc(100% - 2px)',
                  padding: '0.5rem 0.75rem 0.5rem 2rem',
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
              <Mail style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock style={{ width: '16px', height: '16px' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.2s',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Forgot your password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '8px',
              borderLeft: '4px solid #ef4444'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              border: '1px solid rgba(34, 197, 94, 0.3)', 
              borderRadius: '8px',
              borderLeft: '4px solid #22c55e'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#bbf7d0', margin: 0 }}>{success}</p>
            </div>
          )}

          {/* Sign In Button */}
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
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1a202c',
                  margin: '0 0 0.5rem 0'
                }}>
                  Reset Password
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#4a5568',
                  margin: 0
                }}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#1a202c',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                      color: '#1a202c',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {error && (
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                {forgotPasswordSuccess && (
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>{forgotPasswordSuccess}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#4a5568',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f7fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#fbbf24',
                      color: '#1a202c',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: forgotPasswordLoading ? 0.7 : 1
                    }}
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => router.push('/')}
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
            <ArrowLeft size={16} />
            Back to Home
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