import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authenticatedFetch } from '@/lib/api-client'

export interface Application {
  id: string
  userId: string
  candidateId: string
  jobId: string
  clientId: string
  status: 'New' | 'Screening' | 'Interview Scheduled' | 'Interviewing' | 'Technical Round' | 'Final Round' | 'Offered' | 'Hired' | 'Rejected'
  notes: string
  appliedAt: string
  statusHistory: StatusHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface StatusHistoryEntry {
  status: string
  timestamp: string
  notes: string
}

export interface CreateApplicationData {
  candidateId: string
  jobId: string
  clientId: string
  status?: string
  notes?: string
  appliedAt?: string
}

export interface UpdateApplicationData {
  id: string
  status: string
  notes?: string
}

// Fetch applications with optional filters
export const useApplications = (filters?: {
  jobId?: string
  clientId?: string
  candidateId?: string
}) => {
  const queryParams = new URLSearchParams()
  if (filters?.jobId) queryParams.append('jobId', filters.jobId)
  if (filters?.clientId) queryParams.append('clientId', filters.clientId)
  if (filters?.candidateId) queryParams.append('candidateId', filters.candidateId)
  
  const queryString = queryParams.toString()
  const url = `/api/applications${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: ['applications', filters],
    queryFn: async (): Promise<Application[]> => {
      const response = await authenticatedFetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      return response.json()
    }
  })
}

// Create application
export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateApplicationData): Promise<Application> => {
      const response = await authenticatedFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create application (${response.status})`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

// Update application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateApplicationData): Promise<Application> => {
      const response = await authenticatedFetch('/api/applications', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update application (${response.status})`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

// Get applications for a specific job (for pipeline view)
export const useJobApplications = (jobId: string) => {
  return useApplications({ jobId })
}

// Get applications for a specific client
export const useClientApplications = (clientId: string) => {
  return useApplications({ clientId })
}

// Get applications for a specific candidate
export const useCandidateApplications = (candidateId: string) => {
  return useApplications({ candidateId })
}