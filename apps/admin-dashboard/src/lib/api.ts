import { ApiResponse, PaginatedResponse } from 'tulumbak-shared'

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${base}${path}`, {
    headers: { 
      accept: 'application/json',
      // TODO: JWT token ekle (FE-02)
      // 'Authorization': `Bearer ${token}`
    },
    next: { revalidate }
  })
  if (!res.ok) throw new Error(`${res.status} GET ${path}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      accept: 'application/json',
      // TODO: JWT token ekle (FE-02)
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} POST ${path}`)
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      accept: 'application/json',
      // TODO: JWT token ekle (FE-02)
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} PUT ${path}`)
  return res.json() as Promise<T>
}

export async function apiDelete<T>(path: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { 
      accept: 'application/json',
      // TODO: JWT token ekle (FE-02)
      // 'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error(`${res.status} DELETE ${path}`)
  return res.json() as Promise<T>
}
