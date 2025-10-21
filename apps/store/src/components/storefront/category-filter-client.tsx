'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterBar } from '@/components/storefront/filter-bar'

interface CategoryFilterClientProps {
  category: {
    id: string
    name: string
    slug: string
  }
  initialWeight?: number | null
  initialPriceRange?: [number, number]
}

export function CategoryFilterClient({ 
  category, 
  initialWeight, 
  initialPriceRange 
}: CategoryFilterClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [weight, setWeight] = useState<number | null>(initialWeight || null)
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(initialPriceRange)
  
  const handleFilterChange = (newState: any) => {
    // Update local state
    setWeight(newState.weight)
    setPriceRange(newState.priceRange)
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    
    if (newState.weight) {
      params.set('weight', newState.weight.toString())
    } else {
      params.delete('weight')
    }
    
    if (newState.priceRange) {
      params.set('min_price', newState.priceRange[0].toString())
      params.set('max_price', newState.priceRange[1].toString())
    } else {
      params.delete('min_price')
      params.delete('max_price')
    }
    
    if (newState.sort) {
      params.set('sort', newState.sort)
    } else {
      params.delete('sort')
    }
    
    const newUrl = `/kategori/${category.slug}?${params.toString()}`
    router.push(newUrl)
  }
  
  return (
    <FilterBar
      categories={[category]}
      selectedCategory={category.slug}
      weight={weight}
      priceRange={priceRange}
      onChange={handleFilterChange}
    />
  )
}