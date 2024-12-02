// src/components/tours/tour-list.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tour } from '@/types/tour'
import TourCard from './tour-card'
import TourFilters, { FilterOptions } from './tour-filters'

export default function TourList() {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTours = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')

      if (!error && data) {
        setTours(data)
        setFilteredTours(data)
        // 고유한 위치 목록 추출
        const uniqueLocations = Array.from(new Set(data.map(tour => tour.location)))
        setLocations(uniqueLocations)
      }
      setLoading(false)
    }

    fetchTours()
  }, [])

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = tours

    // 검색어 필터링
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(tour => 
        tour.title.toLowerCase().includes(searchLower) ||
        tour.description.toLowerCase().includes(searchLower)
      )
    }

    // 가격 범위 필터링
    if (filters.minPrice > 0 || filters.maxPrice < 1000) {
      filtered = filtered.filter(tour => 
        tour.price >= filters.minPrice && tour.price <= filters.maxPrice
      )
    }

    // 기간 필터링
    if (filters.duration) {
      const maxDuration = parseInt(filters.duration)
      filtered = filtered.filter(tour => tour.duration <= maxDuration)
    }

    // 위치 필터링
    if (filters.location) {
      filtered = filtered.filter(tour => tour.location === filters.location)
    }

    setFilteredTours(filtered)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <TourFilters 
        locations={locations}
        onFilterChange={handleFilterChange} 
      />
      
      <div className="grid gap-6">
        {filteredTours.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No tours found matching your criteria
          </div>
        ) : (
          filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))
        )}
      </div>
    </div>
  )
}