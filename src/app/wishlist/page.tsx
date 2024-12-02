// src/app/wishlist/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TourCard from '@/components/tours/tour-card'

export default function WishlistPage() {
  const [wishlistTours, setWishlistTours] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('wishlists')
      .select(`
        tour_id,
        tours (
          *,
          images (*)
        )
      `)
      .eq('user_id', user.id)

    if (data) {
      setWishlistTours(data.map(item => item.tours))
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

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