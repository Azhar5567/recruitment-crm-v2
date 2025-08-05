'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  User, 
  LogOut,
  Save
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  })

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Update profile logic would go here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Profile updated successfully!')
    } catch (_error) {
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await auth?.signOut()
      router.push('/signin')
    } catch (_error) {
      console.error('Logout error:', _error)
      setMessage('Failed to logout. Please try again.')
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100%',
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Settings size={28} />
              Settings
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Profile Settings */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <User size={20} style={{ color: 'rgb(59, 130, 246)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                Profile Settings
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                Update your personal information
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '8px', 
                display: 'block' 
              }}>
                Display Name
              </label>
              <Input 
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter your display name" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '8px', 
                display: 'block' 
              }}>
                Email Address
              </label>
              <Input 
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '8px', 
                display: 'block' 
              }}>
                Phone Number
              </label>
              <Input 
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter your phone number" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                background: message.includes('success') 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                color: message.includes('success') ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                border: `1px solid ${message.includes('success') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {message}
              </div>
            )}

            <Button
              onClick={handleProfileUpdate}
              disabled={loading}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Account Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <LogOut size={20} style={{ color: 'rgb(239, 68, 68)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                Account Actions
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                Manage your account
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
                Sign Out
              </h4>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 16px 0' }}>
                Sign out of your account and return to the login page.
              </p>
              <Button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'rgb(239, 68, 68)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <LogOut size={16} />
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
                Account Information
              </h4>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>User ID:</strong> {user.uid}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email:</strong> {user.email}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Account Created:</strong> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 