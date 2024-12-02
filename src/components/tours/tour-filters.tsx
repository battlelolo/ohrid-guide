// src/components/tours/tour-filters.tsx
'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export interface FilterOptions {
  search: string
  minPrice: number
  maxPrice: number
  duration: string
  location: string
}

interface TourFiltersProps {
  locations: string[]
  onFilterChange: (filters: FilterOptions) => void
}

export default function TourFilters({ locations, onFilterChange }: TourFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    minPrice: 0,
    maxPrice: 1000,
    duration: '',
    location: ''
  })

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 검색 */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tours..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* 가격 범위 */}
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min $"
            className="w-full p-2 border rounded-md"
            onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max $"
            className="w-full p-2 border rounded-md"
            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
          />
        </div>

        {/* 기간 */}
        <div>
          <select
            className="w-full p-2 border rounded-md"
            onChange={(e) => handleFilterChange('duration', e.target.value)}
          >
            <option value="">Duration (Any)</option>
            <option value="2">Up to 2 hours</option>
            <option value="4">Up to 4 hours</option>
            <option value="8">Up to 8 hours</option>
            <option value="24">Full day</option>
          </select>
        </div>

        {/* 위치 */}
        <div>
          <select
            className="w-full p-2 border rounded-md"
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option value="">Location (Any)</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}