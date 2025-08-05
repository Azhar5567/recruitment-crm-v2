'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  Users, Briefcase, Building2, ArrowRight, 
  Mail, BarChart3, Shield, Zap, User, Lock, Eye, EyeOff
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/hooks/use-firebase-auth'

export default function HomePage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Sign up form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signUp } = useFirebaseAuth()

  // Handle redirect in useEffect to avoid render-time navigation
  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/dashboard')
    }
  }, [user, router, isRedirecting])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !companyName || !mobileNumber) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await signUp(email, password, companyName, mobileNumber)
      
      if (result.success) {
        setSuccess('Account created successfully! Please check your email and click the verification link to activate your account.')
        // Clear form
        setEmail('')
        setPassword('')
        setCompanyName('')
        setMobileNumber('')
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (error: unknown) {
      setError((error as Error)?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Users,
      title: "Candidate Management",
      description: "Organize and track candidates efficiently with comprehensive management tools"
    },
    {
      icon: Building2,
      title: "Client Management", 
      description: "Manage client relationships and track job requirements efficiently"
    },
    {
      icon: Briefcase,
      title: "Job Tracking",
      description: "Create and manage job postings with advanced filtering options"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into your recruitment performance with detailed analytics"
    }
  ]

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
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      {/* Header */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'white',
          fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
          fontWeight: '700',
          letterSpacing: '-0.025em',
          flexWrap: 'wrap'
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
        
        {/* Sign In Button */}
        <button
          onClick={() => {
            console.log('Sign In button clicked')
            alert('Button clicked!')
            router.push('/signin')
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <User size={18} />
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        padding: '1rem 2rem',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 120px)',
        position: 'relative',
        zIndex: 10,
        paddingTop: '1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Left Side - Hero Content */}
        <div style={{ color: 'white', paddingTop: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '0.75rem 1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontWeight: '500'
          }}>
            <Zap size={18} color="#fbbf24" />
            <span style={{ fontSize: '0.95rem', letterSpacing: '0.01em' }}>Modern Recruitment CRM</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '1.75rem',
            letterSpacing: '-0.025em'
          }}>
            <span style={{ color: 'white' }}>Recruit Smarter.</span>
            <br />
            <span style={{ color: '#fbbf24' }}>Grow Faster.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2.5rem',
            lineHeight: '1.7',
            fontWeight: '400',
            letterSpacing: '0.01em'
          }}>
            Omperra helps freelance recruiters and recruitment agencies manage candidates, 
            track jobs, and streamline outreach with modern tools.
          </p>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '0.95rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}>
                <feature.icon size={18} color="#10b981" />
                {feature.title}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(25px)',
            borderRadius: '28px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em'
              }}>
                Get Started Today
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '1.05rem',
                fontWeight: '400',
                letterSpacing: '0.01em',
                marginBottom: '2rem'
              }}>
                Join the future of recruitment
              </p>
              
              {/* Sign Up Form */}
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User style={{ width: '16px', height: '16px' }} />
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
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
                    <User style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
                  </div>
                </div>

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

                {/* Company Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase style={{ width: '16px', height: '16px' }} />
                    Company Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
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
                    <Briefcase style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
                  </div>
                </div>

                {/* Mobile Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield style={{ width: '16px', height: '16px' }} />
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter your mobile number"
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
                    <Shield style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4a5568' }} />
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

                {/* Sign Up Button */}
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
                      Signing Up...
                    </>
                  ) : (
                    <>
                      <User size={18} />
                      Sign Up
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
