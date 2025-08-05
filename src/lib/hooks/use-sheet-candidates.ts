import { useQuery, useMutation } from '@tanstack/react-query'
import { authenticatedFetch } from '@/lib/api-client'

export interface SheetCandidate {
  id: string
  userId: string
  candidateName: string
  email: string
  status: 'New' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected'
  clientName: string
  jobTitle: string
  sheetName: string
  createdAt: string
  updatedAt: string
}

export interface CreateSheetCandidateData {
  candidateName: string
  email: string
  status?: string
  clientName: string
  jobTitle: string
}

export interface UpdateSheetCandidateData {
  id: string
  candidateName?: string
  email?: string
  status?: string
}

// Fetch sheet candidates
export const useSheetCandidates = (clientName: string, jobTitle: string) => {
  return useQuery({
    queryKey: ['sheet-candidates', clientName, jobTitle],
    queryFn: async (): Promise<SheetCandidate[]> => {
      const params = new URLSearchParams({
        clientName,
        jobTitle,
      })
      const response = await authenticatedFetch(`/api/candidates/sheet?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch sheet candidates')
      }
      return response.json()
    },
    enabled: !!clientName && !!jobTitle, // Only fetch when both client and job are selected
  })
}

// Create sheet candidate
export const useCreateSheetCandidate = () => {
      // const queryClient = useQueryClient() // Unused for now
  
  return useMutation({
    mutationFn: async (data: CreateSheetCandidateData): Promise<SheetCandidate> => {
      const response = await authenticatedFetch('/api/candidates/sheet', {
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
    onSuccess: () => {},
  })
}

// Update sheet candidate
export const useUpdateSheetCandidate = () => {
      // const queryClient = useQueryClient() // Unused for now
  
  return useMutation({
    mutationFn: async (data: UpdateSheetCandidateData): Promise<SheetCandidate> => {
      const response = await authenticatedFetch('/api/candidates/sheet', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update candidate')
      }
      
      return response.json()
    },
    onSuccess: () => {},
  })
} 