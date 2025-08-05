'use client'

import Sidebar from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3730a3 100%)',
      minHeight: '100vh',
      width: '100%',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 40%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 40%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      {/* Ensure blue background extends beyond viewport */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minWidth: '100vw',
        minHeight: '100vh',
        height: '100%',
        background: 'inherit',
        zIndex: -1
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Sidebar />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'auto'
        }}>
          {/* Header with Company Name */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              Omperra
            </h1>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
