'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { useJobs } from '@/lib/hooks/use-jobs'
import CandidateTable from '@/components/candidates/candidate-table'

interface Client {
  id: string
  name: string
  industry: string
  email: string
  phone: string
}

interface Job {
  id: string
  title: string
  description: string
  location: string
  type: string
  status: string
}

export default function CandidatesPage() {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showAddJobModal, setShowAddJobModal] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    email: '',
    phone: ''
  })
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time'
  })

  const { user, loading: authLoading } = useAuthStore()
  const { jobs, loading: jobsLoading, createJob } = useJobs(selectedClient)

  // Fetch clients on component mount
  useEffect(() => {
    if (user && !authLoading) {
      fetchClients()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  // Reset selected job when client changes
  useEffect(() => {
    setSelectedJob('')
  }, [selectedClient])

  const fetchClients = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        console.error('Failed to fetch clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!user) {
      alert('Please sign in to add clients')
      return
    }

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      })

      if (response.ok) {
        const addedClient = await response.json()
        setClients([...clients, addedClient])
        setSelectedClient(addedClient.id)
        setShowAddClientModal(false)
        setNewClient({ name: '', industry: '', email: '', phone: '' })
      } else {
        console.error('Failed to add client')
      }
    } catch (error) {
      console.error('Error adding client:', error)
    }
  }

  const handleAddJob = async () => {
    if (!user || !selectedClient) {
      alert('Please sign in and select a client to add job roles')
      return
    }

    try {
      const result = await createJob({
        title: newJob.title,
        description: newJob.description,
        client_id: selectedClient,
        location: newJob.location,
        type: newJob.type
      })

      if (result) {
        setSelectedJob(result.id)
        setShowAddJobModal(false)
        setNewJob({ title: '', description: '', location: '', type: 'Full-time' })
      } else {
        // Show error message if createJob returns null
        alert('Failed to create job. Please try again.')
      }
    } catch (error) {
      console.error('Error adding job:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to create job: ${errorMessage}`)
    }
  }

  // Handle dropdown selections
  const handleClientChange = (value: string) => {
    if (value === 'add-new-client') {
      setShowAddClientModal(true)
      setSelectedClient('')
    } else {
      setSelectedClient(value)
    }
  }

  const handleJobChange = (value: string) => {
    if (value === 'add-new-job') {
      setShowAddJobModal(true)
      setSelectedJob('')
    } else {
      setSelectedJob(value)
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100%',
        padding: '24px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'white', fontSize: '16px' }}>Loading...</div>
        </div>
      </div>
    )
  }

  // Show sign-in message if not authenticated
  if (!user) {
    return (
      <div style={{
        minHeight: '100%',
        padding: '24px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '8px'
          }}>
            Candidates
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            marginBottom: '20px'
          }}>
            Please sign in to access the candidates page
          </p>
          <a href="/signin" style={{
            background: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100%',
      width: '100%',
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '8px'
        }}>
          Candidates
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          margin: 0
        }}>
          Manage your candidate database and track applications
        </p>
      </div>

      {/* Client and Job Selection */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          {/* Client Dropdown */}
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Select Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => handleClientChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                backdropFilter: 'blur(10px)'
              }}
              disabled={loading}
            >
              <option value="" style={{ background: '#1f2937', color: 'white' }}>Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id} style={{ background: '#1f2937', color: 'white' }}>
                  {client.name} - {client.industry}
                </option>
              ))}
              <option value="add-new-client" style={{ background: '#1f2937', color: 'white' }}>
                + Add new client
              </option>
            </select>
          </div>

          {/* Job Roles Dropdown */}
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Select Job Role
            </label>
            <select
              value={selectedJob}
              onChange={(e) => handleJobChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                backdropFilter: 'blur(10px)'
              }}
              disabled={jobsLoading || !selectedClient}
            >
              <option value="" style={{ background: '#1f2937', color: 'white' }}>Select a job role</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id} style={{ background: '#1f2937', color: 'white' }}>
                  {job.title} - {job.type}
                </option>
              ))}
              <option value="add-new-job" style={{ background: '#1f2937', color: 'white' }}>
                + Add new role
              </option>
            </select>
          </div>
        </div>
      </div>



      {/* Add Client Modal */}
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
            maxWidth: '500px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                Add New Client
              </h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Name *
              </label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter client name"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Industry
              </label>
              <input
                type="text"
                value={newClient.industry}
                onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter industry"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter email address"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Phone
              </label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter phone number"
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowAddClientModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name.trim()}
                style={{
                  background: newClient.name.trim() ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: newClient.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Role Modal */}
      {showAddJobModal && (
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                Add New Job Role
              </h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Job Title *
              </label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter job title"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Description
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter job description"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Location
              </label>
              <input
                type="text"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                placeholder="Enter job location"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Job Type
              </label>
              <select
                value={newJob.type}
                onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowAddJobModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                disabled={!newJob.title.trim()}
                style={{
                  background: newJob.title.trim() ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: newJob.title.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Job Role
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Candidate Table - Always show, but locked when client/job not selected */}
      <CandidateTable
        clientName={clients.find(c => c.id === selectedClient)?.name || ''}
        jobTitle={jobs.find(j => j.id === selectedJob)?.title || ''}
      />
    </div>
  )
}