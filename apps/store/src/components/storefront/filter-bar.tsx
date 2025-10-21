'use client'

import { useState } from 'react'
import { Button } from 'tulumbak-ui'
import { FilterBarProps, FilterState } from 'tulumbak-shared'

export function FilterBar({ 
  categories, 
  selectedCategory, 
  weight, 
  priceRange, 
  onChange 
}: FilterBarProps) {
  const [localWeight, setLocalWeight] = useState(weight)
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange || [0, 1000])

  const handleWeightChange = (newWeight: number | null) => {
    setLocalWeight(newWeight)
    onChange({
      category: selectedCategory,
      weight: newWeight,
      priceRange: localPriceRange,
      sort: 'price_asc',
      page: 1
    })
  }

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setLocalPriceRange(newRange)
    onChange({
      category: selectedCategory,
      weight: localWeight,
      priceRange: newRange,
      sort: 'price_asc',
      page: 1
    })
  }

  const handleSortChange = (sort: FilterState['sort']) => {
    onChange({
      category: selectedCategory,
      weight: localWeight,
      priceRange: localPriceRange,
      sort,
      page: 1
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
      <h3 className="text-lg font-semibold text-tulumbak-slate">Filtreler</h3>

      {/* Ağırlık Filtresi */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Ağırlık</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="weight"
              checked={localWeight === null}
              onChange={() => handleWeightChange(null)}
              className="mr-2"
            />
            <span className="text-sm">Tümü</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="weight"
              checked={localWeight === 0.5}
              onChange={() => handleWeightChange(0.5)}
              className="mr-2"
            />
            <span className="text-sm">500g</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="weight"
              checked={localWeight === 1}
              onChange={() => handleWeightChange(1)}
              className="mr-2"
            />
            <span className="text-sm">1kg</span>
          </label>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fiyat Aralığı</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={localPriceRange[0]}
              onChange={(e) => handlePriceRangeChange([parseFloat(e.target.value) || 0, localPriceRange[1]] as [number, number])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localPriceRange[1]}
              onChange={(e) => handlePriceRangeChange([localPriceRange[0], parseFloat(e.target.value) || 1000] as [number, number])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sıralama */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sıralama</h4>
        <select
          onChange={(e) => handleSortChange(e.target.value as FilterState['sort'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
          <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
          <option value="newest">En Yeni</option>
          <option value="bestseller">En Çok Satan</option>
        </select>
      </div>

      {/* Filtreleri Sıfırla */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          setLocalWeight(null)
          setLocalPriceRange([0, 1000])
          onChange({
            category: selectedCategory,
            weight: null,
            priceRange: [0, 1000],
            sort: 'price_asc',
            page: 1
          })
        }}
      >
        Filtreleri Sıfırla
      </Button>
    </div>
  )
}
