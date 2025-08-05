import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'

interface Job {
  id: string
  user_id: string
  client_id: string
  title: string
  description: string
  location: string
  type: string
  salary_min?: number
  salary_max?: number
  status: string
  applications_count: number
  posted_date: string
  deadline?: string
  created_at: string
  updated_at: string
}

interface CreateJobData {
  title: string
  description?: string
  client_id: string
  location?: string
  type?: string
  salary_min?: number
  salary_max?: number
  status?: string
  deadline?: string
}

export function useJobs(clientId?: string) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuthStore()

  const fetchJobs = async () => {
    // Don't fetch if user is not authenticated
    if (!user || authLoading) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await authenticatedFetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        // Filter jobs by client if clientId is provided
        const filteredJobs = clientId ? data.filter((job: Job) => job.client_id === clientId) : data
        setJobs(filteredJobs)
      } else {
        throw new Error('Failed to fetch jobs')
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const createJob = async (jobData: CreateJobData): Promise<Job | null> => {
    // Don't create if user is not authenticated
    if (!user) {
      setError('User not authenticated')
      return null
    }

    try {
      setError(null)
      const response = await authenticatedFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      })
      
      if (response.ok) {
        const newJob = await response.json()
        // Add the new job to the list
        setJobs(prev => [...prev, newJob])
        return newJob
      } else {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.details || errorData.error || `Failed to create job (${response.status})`)
      }
    } catch (err) {
      console.error('Failed to create job:', err)
      setError(err instanceof Error ? err.message : 'Failed to create job')
      return null
    }
  }

  useEffect(() => {
    // Only fetch jobs when user is authenticated and not loading
    if (user && !authLoading) {
      fetchJobs()
    } else if (!authLoading && !user) {
      // If auth is done loading and no user, set loading to false
      setLoading(false)
    }
  }, [user, authLoading, clientId])

  const updateJob = async (jobId: string, jobData: Partial<CreateJobData>): Promise<Job | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    try {
      setError(null)
      console.log('Updating job:', jobId, jobData)
      const response = await authenticatedFetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      })
      
      if (response.ok) {
        const updatedJob = await response.json()
        console.log('Job updated successfully:', updatedJob)
        // Update the job in the list
        setJobs(prev => prev.map(job => 
          job.id === jobId ? updatedJob : job
        ))
        return updatedJob
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        const errorMessage = errorData.error || errorData.details || `Failed to update job (${response.status})`
        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error('Failed to update job:', err)
      setError(err instanceof Error ? err.message : 'Failed to update job')
      return null
    }
  }

  const deleteJob = async (jobId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      setError(null)
      const response = await authenticatedFetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove the job from the list
        setJobs(prev => prev.filter(job => job.id !== jobId))
        return true
      } else {
        throw new Error('Failed to delete job')
      }
    } catch (err) {
      console.error('Failed to delete job:', err)
      setError('Failed to delete job')
      return false
    }
  }

  return {
    jobs,
    loading: loading || authLoading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  }
} 