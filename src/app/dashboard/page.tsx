'use client'

import { useClients } from '@/lib/hooks/use-clients'
import { useJobs } from '@/lib/hooks/use-jobs'
import { 
  Building2, Briefcase, Users, Eye
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

// Job interface
interface Job {
  id: string
  title: string
  status: string
  client_id: string
}

// Client interface  
interface Client {
  id: string
  name: string
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { clients, loading: clientsLoading, error: clientsError } = useClients()
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()

  // Check authentication on component mount
  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user: User | null) => {
      if (!user) {
        router.push('/signin')
      }
    })

    return () => unsubscribe?.()
  }, [router])

  const isLoading = clientsLoading || jobsLoading
  const hasErrors = clientsError || jobsError

  // Calculate important metrics
  const metrics = useMemo(() => {
    const activeJobs = jobs?.filter((job: Job) => job.status === 'Open').length || 0
    const activeClients = clients?.filter((client) => client.status === 'Active').length || 0
    
    return {
      activeJobs,
      activeClients
    }
  }, [clients, jobs])

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading dashboard...
      </div>
    )
  }

  // Show error state
  if (hasErrors) {
    return (
      <div style={{
        minHeight: '100%',
        padding: '24px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
          Welcome to RecruitCRM
        </h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.8 }}>
          Your recruitment dashboard is ready. Start by adding your first client, job, or candidate.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          padding: '0 1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Users size={48} style={{ color: 'rgba(59, 130, 246, 0.8)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Add Candidates</h3>
            <p style={{ opacity: 0.7, marginBottom: '16px' }}>Start building your candidate database</p>
            <Link href="/candidates">
              <button style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Get Started
              </button>
            </Link>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Building2 size={48} style={{ color: 'rgba(34, 197, 94, 0.8)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Add Clients</h3>
            <p style={{ opacity: 0.7, marginBottom: '16px' }}>Manage your client relationships</p>
            <Link href="/clients">
              <button style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Get Started
              </button>
            </Link>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Briefcase size={48} style={{ color: 'rgba(249, 115, 22, 0.8)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Add Jobs</h3>
            <p style={{ opacity: 0.7, marginBottom: '16px' }}>Create job postings and requirements</p>
            <Link href="/jobs">
              <button style={{
                background: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      title: 'Active Jobs', 
      value: metrics.activeJobs, 
      icon: Briefcase, 
      color: 'rgba(249, 115, 22, 0.2)', 
      iconColor: 'rgb(249, 115, 22)',
      trend: '+5%',
      trendColor: 'rgba(34, 197, 94, 0.8)'
    },
    { 
      title: 'Active Clients', 
      value: metrics.activeClients, 
      icon: Building2, 
      color: 'rgba(34, 197, 94, 0.2)', 
      iconColor: 'rgb(34, 197, 94)',
      trend: '+8%',
      trendColor: 'rgba(34, 197, 94, 0.8)'
    },
  ]

  const quickActions = [
    { name: 'Add Candidate', href: '/candidates', icon: Users, color: 'rgba(59, 130, 246, 0.2)' },
    { name: 'Add Client', href: '/clients', icon: Building2, color: 'rgba(34, 197, 94, 0.2)' },
    { name: 'Add Job', href: '/jobs', icon: Briefcase, color: 'rgba(249, 115, 22, 0.2)' },
    { name: 'View Candidates', href: '/candidates', icon: Eye, color: 'rgba(168, 85, 247, 0.2)' },
  ]

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px'
            }}>
              Dashboard Overview
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
              Welcome back! Here&apos;s your recruitment pipeline at a glance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
        padding: '0 1rem'
      }}>
        {stats.map((stat) => (
          <div key={stat.title} style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                background: stat.color,
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={24} style={{ color: stat.iconColor }} />
              </div>
              <div style={{
                background: stat.trendColor,
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white'
              }}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '4px' }}>
                {stat.title}
              </p>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '16px'
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <button
                style={{
                  background: action.color,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = action.color
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <action.icon size={16} />
                {action.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
