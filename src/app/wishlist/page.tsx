// src/app/wishlist/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TourCard from '@/components/tours/tour-card'
import { Tour, TourImage } from '@/types/tour'

interface WishlistTour {
  id: string
  provider_id: string
  title: string
  description: string
  price: number
  currency: string
  duration: number
  max_participants: number
  location: string
  longitude: number
  latitude: number
  meeting_point: string
  included_items: string[]
  excluded_items: string[]
  requirements: string[]
  cancellation_policy: string
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string | null
  tour_images: TourImage[]
}

interface WishlistItem {
  tour_id: string
  tours: WishlistTour
}

export default function WishlistPage() {
  const [wishlistTours, setWishlistTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          tour_id,
          tours (
            *,
            tour_images (*)
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching wishlist:', error)
        setLoading(false)
        return
      }

      if (data && Array.isArray(data)) {
        const tours: Tour[] = data.map((item: WishlistItem) => ({
          id: item.tours.id,
          provider_id: item.tours.provider_id,
          title: item.tours.title,
          description: item.tours.description,
          price: item.tours.price,
          currency: item.tours.currency,
          duration: item.tours.duration,
          max_participants: item.tours.max_participants,
          location: item.tours.location,
          longitude: item.tours.longitude,
          latitude: item.tours.latitude,
          meeting_point: item.tours.meeting_point,
          included_items: item.tours.included_items,
          excluded_items: item.tours.excluded_items,
          requirements: item.tours.requirements,
          cancellation_policy: item.tours.cancellation_policy,
          average_rating: item.tours.average_rating,
          total_reviews: item.tours.total_reviews,
          created_at: item.tours.created_at,
          updated_at: item.tours.updated_at,
          images: item.tours.tour_images || []
        }))
        setWishlistTours(tours)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      {wishlistTours.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Your wishlist is empty
        </div>
      ) : (
        <div className="grid gap-6">
          {wishlistTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}