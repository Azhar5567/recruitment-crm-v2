'use client'

import { useState } from 'react'
import { useJobs } from '@/lib/hooks/use-jobs'
import { useClients } from '@/lib/hooks/use-clients'
import { useAuthStore } from '@/lib/store'
import { 
  Briefcase, 
  Search, 
  Plus, 
  DollarSign,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,

} from 'lucide-react'

// Job interface
interface Job {
  id: string
  title: string
  description: string
  location: string
  type: string
  status: string
  client_id: string
  salary_min?: number | string
  salary_max?: number | string
  deadline?: string
  user_id?: string
  userId?: string
  applications_count?: number
  posted_date?: string
}

// Client interface
interface Client {
  id: string
  name: string
  industry: string
  status: string
}

// Single sample job for demonstration
const sampleJob = {
  id: 'sample-1',
  title: 'Senior Software Engineer',
  client_id: 'sample-client-1',
  description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing and maintaining our web applications.',
  location: 'San Francisco, CA',
  type: 'Full-time',
  salary_min: 120000,
  salary_max: 180000,
  status: 'Open',
  applications_count: 24,
  posted_date: '2024-01-15',
  deadline: '2024-02-15',
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z',
  clients: {
    id: 'sample-client-1',
    name: 'TechCorp Solutions',
    industry: 'Technology'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' }
    case 'Interviewing': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' }
    case 'On Hold': return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' }
    case 'Filled': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' }
    case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' }
    case 'Closed': return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' }
    default: return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' }
  }
}

export default function JobsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDemoJob, setShowDemoJob] = useState(true)
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newJob, setNewJob] = useState({
    client_id: '',
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    salary_min: '',
    salary_max: '',
    status: 'Open',
    deadline: ''
  })

  const { jobs, loading: jobsLoading, createJob, updateJob, deleteJob } = useJobs()
  const { clients, loading: clientsLoading, createClient } = useClients()
  const { user } = useAuthStore()

  const handleAddJob = async () => {
    if (!newJob.client_id || !newJob.title) {
      alert('Please select a client and enter a job title')
      return
    }

    try {
      const result = await createJob({
        client_id: newJob.client_id,
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        type: newJob.type,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : undefined,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : undefined,
        status: newJob.status,
        deadline: newJob.deadline
      })
      
      if (result) {
        setShowAddModal(false)
        setNewJob({
          client_id: '',
          title: '',
          description: '',
          location: '',
          type: 'Full-time',
          salary_min: '',
          salary_max: '',
          status: 'Open',
          deadline: ''
        })
        alert('Job added successfully!')
      } else {
        alert('Failed to add job')
      }
    } catch (error) {
      console.error('Failed to add job:', error)
      alert('Failed to add job')
    }
  }

  const handleAddNewClient = async () => {
    if (!newClientName.trim()) {
      alert('Please enter a client name')
      return
    }

    try {
      const result = await createClient({
        name: newClientName.trim(),
        industry: '',
        email: '',
        phone: '',
        website: '',
        location: '',
        status: 'Active',
        employees_range: '',
        revenue_range: ''
      })
      
      if (result) {
        setShowAddClientModal(false)
        setNewClientName('')
        alert('Client added successfully! You can now select it for the job.')
      } else {
        alert('Failed to add client')
      }
    } catch (error) {
      console.error('Failed to add client:', error)
      alert('Failed to add client')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    const jobToDelete = allJobs.find(job => job.id === jobId)
    const isDemo = jobToDelete?.id === 'sample-1'
    
    const confirmMessage = isDemo 
      ? 'Are you sure you want to delete this demo job? This action cannot be undone.'
      : 'Are you sure you want to delete this job? This action cannot be undone.'
    
    if (confirm(confirmMessage)) {
      try {
        if (isDemo) {
          // For demo job, just remove from display
          setShowDemoJob(false)
          alert('Demo job removed successfully!')
          return
        }
        
        const success = await deleteJob(jobId)
        if (success) {
          alert('Job deleted successfully!')
        } else {
          alert('Failed to delete job. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('Failed to delete job. Please try again.')
      }
    }
  }

  const handleEditJob = (job: Job) => {
    console.log('Edit job clicked:', job)
    console.log('Current user:', user?.uid)
    console.log('Job user_id:', job.user_id)
    console.log('Job userId:', job.userId)
    console.log('Has user_id property:', 'user_id' in job)
    console.log('Has userId property:', 'userId' in job)
    
    // Check if user owns this job (jobs API returns user_id field)
    if (user && 'user_id' in job && job.user_id !== user.uid) {
      alert('You can only edit jobs you created. This job belongs to another user.')
      return
    }
    
    setSelectedJob(job)
    setShowEditModal(true)
  }

  const handleViewJob = (job: Job) => {
    setSelectedJob(job)
    setShowViewModal(true)
  }

  if (jobsLoading || clientsLoading) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading jobs...
      </div>
    )
  }

  // Combine real jobs with sample job and apply filters
  const allJobs = jobs ? (showDemoJob ? [sampleJob, ...jobs] : jobs) : (showDemoJob ? [sampleJob] : [])
  const filteredJobs = allJobs.filter(job => {
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.type?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div style={{
      minHeight: '100%',
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style jsx>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.9) !important;
          opacity: 1 !important;
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.9) !important;
          opacity: 1 !important;
        }
        input:focus::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        textarea:focus::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em'
              }}>
                <Briefcase size={40} style={{ marginRight: '1rem', display: 'inline' }} />
                Jobs
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Manage job postings and track application progress
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ 
                background: 'rgba(255, 255, 255, 0.12)', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Job
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '20px', 
                height: '20px', 
                color: 'rgba(255, 255, 255, 0.6)' 
              }} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs..." 
                style={{ 
                  paddingLeft: '2.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  minWidth: '150px'
                }}
              >
                <option value="All" style={{ background: '#1f2937', color: 'white' }}>All Status</option>
                <option value="Open" style={{ background: '#1f2937', color: 'white' }}>Open</option>
                <option value="Interviewing" style={{ background: '#1f2937', color: 'white' }}>Interviewing</option>
                <option value="On Hold" style={{ background: '#1f2937', color: 'white' }}>On Hold</option>
                <option value="Filled" style={{ background: '#1f2937', color: 'white' }}>Filled</option>
                <option value="Cancelled" style={{ background: '#1f2937', color: 'white' }}>Cancelled</option>
                <option value="Closed" style={{ background: '#1f2937', color: 'white' }}>Closed</option>
              </select>
            </div>
          </div>
        </div>



        {/* Jobs List */}
        <div style={{ 
          display: 'grid', 
          gap: '0.75rem'
        }}>
          {filteredJobs.map((job) => {
            const statusColors = getStatusColor(job.status)
            const salary = job.salary_min && job.salary_max 
              ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
              : job.salary_min 
                ? `$${job.salary_min.toLocaleString()}+`
                : 'Salary not specified'
            
            return (
              <div key={job.id} style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '12px', 
                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Briefcase style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.125rem' }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: '0.25rem' }}>
                        {job.client_id || 'Unknown Client'} • {job.location}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: '#718096' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <DollarSign style={{ width: '12px', height: '12px' }} />
                          {salary}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {job.type}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Users style={{ width: '12px', height: '12px' }} />
                          {job.applications_count || 0} applications
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`
                      }}>
                        {job.status}
                      </div>
                      {job.id === 'sample-1' && (
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          marginLeft: '0.5rem'
                        }}>
                          Demo
                        </div>
                      )}
                      {user && 'user_id' in job && job.user_id !== user.uid && (
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          marginLeft: '0.5rem'
                        }}>
                          Other User
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button 
                        onClick={() => handleViewJob(job)}
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                        }}
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        onClick={() => handleEditJob(job)}
                        disabled={job.id === 'sample-1' || !!(user && 'user_id' in job && job.user_id !== user.uid)}
                        style={{ 
                          background: job.id === 'sample-1' || (user && 'user_id' in job && job.user_id !== user.uid)
                            ? 'rgba(107, 114, 128, 0.1)' 
                            : 'rgba(34, 197, 94, 0.1)',
                          border: job.id === 'sample-1' || (user && 'user_id' in job && job.user_id !== user.uid)
                            ? '1px solid rgba(107, 114, 128, 0.2)' 
                            : '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: job.id === 'sample-1' || (user && 'user_id' in job && job.user_id !== user.uid)
                            ? 'not-allowed' 
                            : 'pointer',
                          color: job.id === 'sample-1' || (user && 'user_id' in job && job.user_id !== user.uid)
                            ? '#6b7280' 
                            : '#22c55e',
                          transition: 'all 0.2s ease',
                          opacity: job.id === 'sample-1' || (user && 'user_id' in job && job.user_id !== user.uid) ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (job.id !== 'sample-1' && !(user && 'user_id' in job && job.user_id !== user.uid)) {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (job.id !== 'sample-1' && !(user && 'user_id' in job && job.user_id !== user.uid)) {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
                          }
                        }}
                        title={
                          job.id === 'sample-1' 
                            ? 'Cannot edit sample job' 
                            : (user && 'user_id' in job && job.user_id !== user.uid)
                              ? 'Cannot edit job created by another user'
                              : 'Edit job'
                        }
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#ef4444',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        }}
                        title={job.id === 'sample-1' ? 'Delete demo job' : 'Delete job'}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '16px'
            }}>
              Add New Job
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Select Client *
              </label>
              <select
                value={newJob.client_id}
                onChange={(e) => {
                  if (e.target.value === 'add-new') {
                    setShowAddClientModal(true)
                  } else {
                    setNewJob({ ...newJob, client_id: e.target.value })
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="" style={{ background: '#1f2937', color: 'white' }}>Select a client...</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id} style={{ background: '#1f2937', color: 'white' }}>
                    {client.name}
                  </option>
                ))}
                <option value="add-new" style={{ background: '#1f2937', color: '#3b82f6' }}>➕ Add New Client</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Job Title *
              </label>
                              <input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Senior Software Engineer"
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Description
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Job description and requirements..."
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Location
              </label>
              <input
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="e.g., San Francisco, CA"
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Job Type
              </label>
              <select
                value={newJob.type}
                onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="Full-time" style={{ background: '#1f2937', color: 'white' }}>Full-time</option>
                <option value="Part-time" style={{ background: '#1f2937', color: 'white' }}>Part-time</option>
                <option value="Contract" style={{ background: '#1f2937', color: 'white' }}>Contract</option>
                <option value="Internship" style={{ background: '#1f2937', color: 'white' }}>Internship</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Salary Range (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={newJob.salary_min}
                  onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Min salary"
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                <input
                  type="number"
                  value={newJob.salary_max}
                  onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Max salary"
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Status
              </label>
              <select
                value={newJob.status}
                onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="Open" style={{ background: '#1f2937', color: 'white' }}>Open</option>
                <option value="Interviewing" style={{ background: '#1f2937', color: 'white' }}>Interviewing</option>
                <option value="On Hold" style={{ background: '#1f2937', color: 'white' }}>On Hold</option>
                <option value="Filled" style={{ background: '#1f2937', color: 'white' }}>Filled</option>
                <option value="Cancelled" style={{ background: '#1f2937', color: 'white' }}>Cancelled</option>
                <option value="Closed" style={{ background: '#1f2937', color: 'white' }}>Closed</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewJob({
                    client_id: '',
                    title: '',
                    description: '',
                    location: '',
                    type: 'Full-time',
                    salary_min: '',
                    salary_max: '',
                    status: 'Open',
                    deadline: ''
                  })
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                disabled={!newJob.client_id || !newJob.title}
                style={{
                  background: newJob.client_id && newJob.title 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: newJob.client_id && newJob.title 
                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: newJob.client_id && newJob.title ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '16px'
            }}>
              {selectedJob.title}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Client</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedJob.client_id}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Status</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedJob.status}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Location</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedJob.location}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Type</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedJob.type}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Applications</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedJob.applications_count || 0}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Posted Date</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{new Date(selectedJob.posted_date).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedJob.description && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Description</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px', lineHeight: '1.5' }}>{selectedJob.description}</p>
              </div>
            )}

            <button
              onClick={() => setShowViewModal(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '20px'
            }}>
              Edit Job - {selectedJob.title}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Job Title *
                </label>
                <input
                  value={selectedJob.title || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Client
                </label>
                <select
                  value={selectedJob.client_id || ''}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowAddClientModal(true)
                    } else {
                      setSelectedJob({ ...selectedJob, client_id: e.target.value })
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="" style={{ background: '#1f2937', color: 'white' }}>Select a client...</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id} style={{ background: '#1f2937', color: 'white' }}>
                      {client.name}
                    </option>
                  ))}
                  <option value="add-new" style={{ background: '#1f2937', color: '#3b82f6' }}>➕ Add New Client</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Status
                </label>
                <select
                  value={selectedJob.status || 'Open'}
                  onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Open" style={{ background: '#1f2937', color: 'white' }}>Open</option>
                  <option value="Interviewing" style={{ background: '#1f2937', color: 'white' }}>Interviewing</option>
                  <option value="On Hold" style={{ background: '#1f2937', color: 'white' }}>On Hold</option>
                  <option value="Filled" style={{ background: '#1f2937', color: 'white' }}>Filled</option>
                  <option value="Cancelled" style={{ background: '#1f2937', color: 'white' }}>Cancelled</option>
                  <option value="Closed" style={{ background: '#1f2937', color: 'white' }}>Closed</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Location
                </label>
                <input
                  value={selectedJob.location || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Job Type
                </label>
                <select
                  value={selectedJob.type || 'Full-time'}
                  onChange={(e) => setSelectedJob({ ...selectedJob, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Full-time" style={{ background: '#1f2937', color: 'white' }}>Full-time</option>
                  <option value="Part-time" style={{ background: '#1f2937', color: 'white' }}>Part-time</option>
                  <option value="Contract" style={{ background: '#1f2937', color: 'white' }}>Contract</option>
                  <option value="Internship" style={{ background: '#1f2937', color: 'white' }}>Internship</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Min Salary
                </label>
                <input
                  type="number"
                  value={selectedJob.salary_min || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, salary_min: e.target.value || '' })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Min salary"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Max Salary
                </label>
                <input
                  type="number"
                  value={selectedJob.salary_max || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, salary_max: e.target.value || '' })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Max salary"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Description
              </label>
              <textarea
                value={selectedJob.description || ''}
                onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Job description and requirements..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              position: 'sticky',
              bottom: '0',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px 0',
              borderRadius: '8px'
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!selectedJob.title) {
                      alert('Please fill in at least the job title')
                      return
                    }
                    
                    // Check if this is a sample job (doesn't exist in database)
                    if (selectedJob.id === 'sample-1') {
                      alert('Cannot edit sample job. Please create a real job first.')
                      setShowEditModal(false)
                      return
                    }
                    
                    // Check if user owns this job
                    console.log('Selected job for update:', selectedJob)
                    console.log('Current user:', user?.uid)
                    console.log('Job user_id:', selectedJob.user_id)
                    console.log('Has user_id property:', 'user_id' in selectedJob)
                    
                    if (user && 'user_id' in selectedJob && selectedJob.user_id !== user.uid) {
                      alert('You can only edit jobs you created. This job belongs to another user.')
                      setShowEditModal(false)
                      return
                    }
                    
                    console.log('Updating job:', selectedJob.id, 'User:', user?.uid, 'Job owner:', selectedJob.user_id)
                    
                    const result = await updateJob(selectedJob.id, {
                      client_id: selectedJob.client_id,
                      title: selectedJob.title,
                      description: selectedJob.description,
                      location: selectedJob.location,
                      type: selectedJob.type,
                      salary_min: selectedJob.salary_min ? parseInt(selectedJob.salary_min.toString()) : undefined,
                      salary_max: selectedJob.salary_max ? parseInt(selectedJob.salary_max.toString()) : undefined,
                      status: selectedJob.status
                    })
                    
                    if (result) {
                      alert('Job updated successfully!')
                      setShowEditModal(false)
                    } else {
                      alert('Failed to update job. Please try again.')
                    }
                  } catch (error) {
                    console.error('Error updating job:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update job. Please try again.'
                    alert(errorMessage)
                  }
                }}
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                }}
              >
                Update Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {showAddClientModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '16px'
            }}>
              Add New Client
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Client Name *
              </label>
              <input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="Enter client name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddNewClient()
                  }
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddClientModal(false)
                  setNewClientName('')
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewClient}
                disabled={!newClientName.trim()}
                style={{
                  background: newClientName.trim() 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: newClientName.trim() 
                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: newClientName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 