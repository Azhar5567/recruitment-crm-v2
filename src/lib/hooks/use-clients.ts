import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'

interface Client {
  id: string
  name: string
  industry?: string
  email?: string
  phone?: string
  website?: string
  location?: string
  status?: string
  employees_range?: string
  revenue_range?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface CreateClientData {
  name: string
  industry?: string
  email?: string
  phone?: string
  website?: string
  location?: string
  status?: string
  employees_range?: string
  revenue_range?: string
  notes?: string
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuthStore()

  const fetchClients = async () => {
    // Don't fetch if user is not authenticated
    if (!user || authLoading) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await authenticatedFetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        throw new Error('Failed to fetch clients')
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
      setError('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: CreateClientData): Promise<Client | null> => {
    // Don't create if user is not authenticated
    if (!user) {
      setError('User not authenticated')
      return null
    }

    try {
      setError(null)
      const response = await authenticatedFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      
      if (response.ok) {
        const newClient = await response.json()
        // Add the new client to the list
        setClients(prev => [...prev, newClient])
        return newClient
      } else {
        throw new Error('Failed to create client')
      }
    } catch (err) {
      console.error('Failed to create client:', err)
      setError('Failed to create client')
      return null
    }
  }

  useEffect(() => {
    // Only fetch clients when user is authenticated and not loading
    if (user && !authLoading) {
      fetchClients()
    } else if (!authLoading && !user) {
      // If auth is done loading and no user, set loading to false
      setLoading(false)
    }
  }, [user, authLoading])

  const updateClient = async (clientId: string, clientData: Partial<CreateClientData>): Promise<Client | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    try {
      setError(null)
      const response = await authenticatedFetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      })
      
      if (response.ok) {
        const updatedClient = await response.json()
        // Update the client in the list
        setClients(prev => prev.map(client => 
          client.id === clientId ? updatedClient : client
        ))
        return updatedClient
      } else {
        throw new Error('Failed to update client')
      }
    } catch (err) {
      console.error('Failed to update client:', err)
      setError('Failed to update client')
      return null
    }
  }

  const deleteClient = async (clientId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      setError(null)
      const response = await authenticatedFetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove the client from the list
        setClients(prev => prev.filter(client => client.id !== clientId))
        return true
      } else {
        throw new Error('Failed to delete client')
      }
    } catch (err) {
      console.error('Failed to delete client:', err)
      setError('Failed to delete client')
      return false
    }
  }

  return {
    clients,
    loading: loading || authLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  }
} 