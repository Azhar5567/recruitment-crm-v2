'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'

export function Header() {
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 40, 
      display: 'flex', 
      height: '64px', 
      alignItems: 'center', 
      gap: '1rem', 
      borderBottom: '1px solid rgba(226, 232, 240, 0.5)', 
      background: 'rgba(255, 255, 255, 0.95)', 
      backdropFilter: 'blur(20px)',
      padding: '0 1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Button
        variant="ghost"
        size="icon"
        className="mobile-menu-button"
        style={{ 
          margin: '-0.5rem', 
          padding: '0.5rem', 
          color: '#4a5568'
        }}
        onClick={toggleSidebar}
      >
        <Menu style={{ width: '24px', height: '24px' }} />
      </Button>

      {/* Company Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginRight: 'auto'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#2d3748',
          margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Omperra
        </h1>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '1rem', alignSelf: 'stretch' }}>
        <div style={{ display: 'flex', flex: 1 }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            height: '24px', 
            width: '1px', 
            background: 'rgba(226, 232, 240, 0.5)'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem' }}>
              <span style={{ color: '#718096' }}>Signed in as</span>
              <span style={{ marginLeft: '0.25rem', fontWeight: '500', color: '#2d3748' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 