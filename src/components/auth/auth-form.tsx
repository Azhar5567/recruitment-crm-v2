'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, signUp, loading, error, clearError } = useAuth()

  const [signUpMessage, setSignUpMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSignUpMessage('')

    if (isLogin) {
      const result = await signIn(email, password)
      if (!result.success) {
        return
      }
    } else {
      const result = await signUp(email, password, name)
      if (!result.success) {
        return
      }
      
      // Show email confirmation message
      if (result.message) {
        setSignUpMessage(result.message)
        return
      }
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {!isLogin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ width: '16px', height: '16px' }} />
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                placeholder="Enter your full name"
                style={{
                  paddingLeft: '2.5rem',
                  height: '48px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  backgroundColor: '#f8fafc'
                }}
              />
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#a0aec0' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail style={{ width: '16px', height: '16px' }} />
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                paddingLeft: '2.5rem',
                height: '48px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1a202c',
                fontWeight: '500'
              }}
            />
            <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#4a5568' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock style={{ width: '16px', height: '16px' }} />
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                height: '48px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1a202c',
                fontWeight: '500'
              }}
            />
            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#4a5568' }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a5568',
                transition: 'color 0.2s'
              }}
            >
              {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#fed7d7', 
            border: '1px solid #feb2b2', 
            borderRadius: '8px',
            borderLeft: '4px solid #e53e3e'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#c53030', margin: 0 }}>{error}</p>
          </div>
        )}

        {signUpMessage && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#c6f6d5', 
            border: '1px solid #9ae6b4', 
            borderRadius: '8px',
            borderLeft: '4px solid #38a169'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#22543d', margin: 0 }}>{signUpMessage}</p>
          </div>
        )}

        <Button
          type="submit"
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid transparent', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              Loading...
            </>
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </>
          )}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            color: '#667eea',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"
          }
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
} 