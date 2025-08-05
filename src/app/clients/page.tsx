'use client'

import { useState } from 'react'
import { useClients } from '@/lib/hooks/use-clients'
import { 
  Building2, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

// Client interface
interface Client {
  id: string
  name: string
  industry: string
  email: string
  phone: string
  website?: string
  location: string
  status: string
  isDemo?: boolean
}

// Single sample client for demonstration
const sampleClient = {
  id: 'demo-1',
  name: 'TechCorp Solutions',
  industry: 'Technology',
  email: 'contact@techcorp.com',
  phone: '+1 (555) 123-4567',
  website: 'www.techcorp.com',
  location: 'San Francisco, CA',
  status: 'Active',
  employees: '250-500',
  revenue: '$10M-50M',
  jobsPosted: 8,
  lastContact: '2024-01-15',
  rating: 4.8,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  isDemo: true
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' }
    case 'Warm': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' }
    case 'Cold': return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' }
    default: return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' }
  }
}

export default function ClientsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showDemoClient, setShowDemoClient] = useState(true)
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    status: 'Active',
    employees: '',
    revenue: ''
  })

  const { clients, loading, error, createClient, updateClient, deleteClient } = useClients()

  const handleAddClient = async () => {
    if (!newClient.name) {
      alert('Please fill in the company name')
      return
    }

    try {
      const result = await createClient({
        name: newClient.name,
        industry: newClient.industry,
        email: newClient.email,
        phone: newClient.phone,
        website: newClient.website,
        location: newClient.location,
        status: newClient.status,
        employees_range: newClient.employees,
        revenue_range: newClient.revenue
      })
      
      if (result) {
        setShowAddModal(false)
        setNewClient({
          name: '',
          industry: '',
          email: '',
          phone: '',
          website: '',
          location: '',
          status: 'Active',
          employees: '',
          revenue: ''
        })
        alert('Client added successfully!')
      }
    } catch (_error) {
      console.error('Failed to add client:', error)
      alert('Failed to add client. Please try again.')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const clientToDelete = allClients.find(client => client.id === clientId)
    const isDemo = (clientToDelete as Client & { isDemo?: boolean })?.isDemo
    
    const confirmMessage = isDemo 
      ? 'Are you sure you want to delete this demo client? This action cannot be undone.'
      : 'Are you sure you want to delete this client? This action cannot be undone.'
    
    if (confirm(confirmMessage)) {
      try {
        if (isDemo) {
          // For demo client, just remove from display
          setShowDemoClient(false)
          alert('Demo client removed successfully!')
          return
        }
        
        const success = await deleteClient(clientId)
        if (success) {
          alert('Client deleted successfully!')
        } else {
          alert('Failed to delete client. Please try again.')
        }
      } catch (_error) {
        console.error('Error deleting client:', error)
        alert('Failed to delete client. Please try again.')
      }
    }
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setShowEditModal(true)
  }

  const handleViewClient = (client: any) => {
    setSelectedClient(client)
    setShowViewModal(true)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading clients...
      </div>
    )
  }

  // Combine real clients with sample client
  const allClients = clients ? (showDemoClient ? [sampleClient, ...clients] : clients) : (showDemoClient ? [sampleClient] : [])
  
  // Filter clients based on search term and status filter
  const filteredClients = allClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ 
      padding: '1.5rem',
      minHeight: '100%'
    }}>
      <style jsx>{`
        input::placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input::-webkit-input-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input::-moz-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
        input:-ms-input-placeholder {
          color: white !important;
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                <Building2 size={32} style={{ marginRight: '0.75rem', display: 'inline' }} />
                Clients
              </h1>
              <p style={{ 
                fontSize: '1rem', 
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Manage your client relationships and business partnerships
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
              Add Client
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
                placeholder="Search clients..." 
                style={{ 
                  paddingLeft: '2.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  if (target.value) {
                    target.style.color = 'white'
                  } else {
                    target.style.color = 'white'
                  }
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
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <option value="All" style={{ background: '#1f2937', color: 'white' }}>All Status</option>
                <option value="Active" style={{ background: '#1f2937', color: 'white' }}>Active</option>
                <option value="Warm" style={{ background: '#1f2937', color: 'white' }}>Warm</option>
                <option value="Cold" style={{ background: '#1f2937', color: 'white' }}>Cold</option>
              </select>
            </div>
          </div>
        </div>



        {/* Clients List */}
        <div style={{ 
          display: 'grid', 
          gap: '0.75rem'
        }}>
          {filteredClients.map((client) => {
            const statusColors = getStatusColor(client.status || 'Active')
            return (
              <div key={client.id} style={{ 
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
                      <Building2 style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {client.name}
                        </h3>
                        {(client as Client & { isDemo?: boolean })?.isDemo && (
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.625rem',
                            fontWeight: '500',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            Demo
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: '0.25rem' }}>
                        {client.industry} • {client.location}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: '#718096' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail style={{ width: '12px', height: '12px' }} />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone style={{ width: '12px', height: '12px' }} />
                            {client.phone}
                          </div>
                        )}
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
                        {client.status}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button 
                        onClick={() => handleViewClient(client)}
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
                        onClick={() => handleEditClient(client)}
                        style={{ 
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#22c55e',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
                        }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        onClick={() => {
                          if (client.id) {
                            handleDeleteClient(client.id)
                          }
                        }}
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

      {/* Add Client Modal */}
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
              Add New Client
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Company Name *
              </label>
              <input
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="Enter company name"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Industry
              </label>
              <input
                value={newClient.industry}
                onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="contact@company.com"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Phone
              </label>
              <input
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Website
              </label>
              <input
                value={newClient.website}
                onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="www.company.com"
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
                value={newClient.location}
                onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="City, State"
              />
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
                value={newClient.status}
                onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                style={{
                  width: 'calc(100% - 24px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="Active" style={{ background: '#1f2937', color: 'white' }}>Active</option>
                <option value="Warm" style={{ background: '#1f2937', color: 'white' }}>Warm</option>
                <option value="Cold" style={{ background: '#1f2937', color: 'white' }}>Cold</option>
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
                  setNewClient({
                    name: '',
                    industry: '',
                    email: '',
                    phone: '',
                    website: '',
                    location: '',
                    status: 'Active',
                    employees: '',
                    revenue: ''
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
                onClick={handleAddClient}
                disabled={!newClient.name}
                style={{
                  background: newClient.name 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: newClient.name 
                    ? '1px solid rgba(34, 197, 94, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: newClient.name ? 'pointer' : 'not-allowed',
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

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
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
              {selectedClient.name}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Industry</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.industry}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Status</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.status}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Email</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.email}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Phone</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.phone}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Website</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.website}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Location</label>
                <p style={{ color: 'white', fontSize: '14px', marginTop: '4px' }}>{selectedClient.location}</p>
              </div>
            </div>

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

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
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
              Edit Client - {selectedClient.name}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Company Name *
                </label>
                <input
                  value={selectedClient.name || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Enter company name"
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
                  Industry
                </label>
                <input
                  value={selectedClient.industry || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, industry: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Technology, Healthcare"
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
                  Email
                </label>
                <input
                  type="email"
                  value={selectedClient.email || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="contact@company.com"
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
                  Phone
                </label>
                <input
                  value={selectedClient.phone || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="+1 (555) 123-4567"
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
                  Website
                </label>
                <input
                  value={selectedClient.website || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, website: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="www.company.com"
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
                  Location
                </label>
                <input
                  value={selectedClient.location || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, location: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="City, State"
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
                  Status
                </label>
                <select
                  value={selectedClient.status || 'Active'}
                  onChange={(e) => setSelectedClient({ ...selectedClient, status: e.target.value })}
                  style={{
                    width: 'calc(100% - 24px)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="Active" style={{ background: '#1f2937', color: 'white' }}>Active</option>
                  <option value="Warm" style={{ background: '#1f2937', color: 'white' }}>Warm</option>
                  <option value="Cold" style={{ background: '#1f2937', color: 'white' }}>Cold</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
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
                    if (!selectedClient.name) {
                      alert('Please fill in the company name')
                      return
                    }
                    
                    const result = await updateClient(selectedClient.id, {
                      name: selectedClient.name,
                      industry: selectedClient.industry,
                      email: selectedClient.email,
                      phone: selectedClient.phone,
                      website: selectedClient.website,
                      location: selectedClient.location,
                      status: selectedClient.status
                    })
                    
                    if (result) {
                      alert('Client updated successfully!')
                      setShowEditModal(false)
                    } else {
                      alert('Failed to update client. Please try again.')
                    }
                  } catch (_error) {
                    console.error('Error updating client:', error)
                    alert('Failed to update client. Please try again.')
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
                Update Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 