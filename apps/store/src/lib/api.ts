import { ApiResponse, PaginatedResponse } from '@tulumbak/shared'

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate }
  })
  if (!res.ok) throw new Error(`${res.status} GET ${path}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, data: any): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} POST ${path}`)
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, data: any): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} PUT ${path}`)
  return res.json() as Promise<T>
}

export async function apiDelete<T>(path: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`${res.status} DELETE ${path}`)
  return res.json() as Promise<T>
}
