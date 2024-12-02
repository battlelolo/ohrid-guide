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
      // tour_images 관계를 포함하도록 쿼리 수정
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          tour_images (
            id,
            image_url,
            is_main
          )
        `)

      if (!error && data) {
        // 이미지 데이터를 포함한 투어 데이터 설정
        const toursWithImages = data.map(tour => ({
          ...tour,
          images: tour.tour_images // types/tour.ts에 정의된 images 필드에 매핑
        }))
        
        setTours(toursWithImages)
        setFilteredTours(toursWithImages)
        const uniqueLocations = Array.from(new Set(data.map(tour => tour.location)))
        setLocations(uniqueLocations)
      } else {
        console.error('Error fetching tours:', error)
      }
      setLoading(false)
    }

    fetchTours()
  }, [])

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = tours

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(tour => 
        tour.title.toLowerCase().includes(searchLower) ||
        tour.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.minPrice > 0 || filters.maxPrice < 1000) {
      filtered = filtered.filter(tour => 
        tour.price >= filters.minPrice && tour.price <= filters.maxPrice
      )
    }

    if (filters.duration) {
      const maxDuration = parseInt(filters.duration)
      filtered = filtered.filter(tour => tour.duration <= maxDuration)
    }

    if (filters.location) {
      filtered = filtered.filter(tour => tour.location === filters.location)
    }

    setFilteredTours(filtered)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-gray-500">Loading tours...</div>
    </div>
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