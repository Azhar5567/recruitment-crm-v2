import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authenticatedFetch } from '@/lib/api-client'

export interface Candidate {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  position?: string
  location?: string
  experience_years?: number
  status: 'New' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected'
  rating?: number
  notes?: string
  resume_url?: string
  created_at: string
  updated_at: string
  client?: string
  role?: string
}

export interface CreateCandidateData {
  full_name: string
  email: string
  phone?: string
  position?: string
  location?: string
  experience_years?: number
  status?: string
  rating?: number
  notes?: string
  client?: string
  role?: string
}

export interface UpdateCandidateData extends Partial<CreateCandidateData> {
  id: string
}

// Fetch candidates
export const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async (): Promise<Candidate[]> => {
      const response = await authenticatedFetch('/api/candidates')
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }
      return response.json()
    }
  })
}

// Create candidate
export const useCreateCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateCandidateData): Promise<Candidate> => {
      const response = await authenticatedFetch('/api/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.error || `Failed to create candidate (${response.status})`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

// Update candidate
export const useUpdateCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateCandidateData): Promise<Candidate> => {
      const response = await fetch(`/api/candidates/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update candidate')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

// Delete candidate
export const useDeleteCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete candidate')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
} 