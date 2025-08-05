// Shared type definitions

export interface Client {
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
  createdAt?: string
  updatedAt?: string
  isDemo?: boolean
}

export interface Job {
  id: string
  title: string
  description?: string
  location?: string
  type?: string
  status: string
  client_id: string
  salary_min?: number | string
  salary_max?: number | string
  deadline?: string
  user_id?: string
  userId?: string
  applications_count?: number
  posted_date?: string
  createdAt?: string
  updatedAt?: string
}