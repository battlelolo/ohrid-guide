// src/components/reviews/review-list.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export default function ReviewList({ tourId }: { tourId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false })

    if (data) {
      setReviews(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [tourId])

  if (loading) return <div>Loading reviews...</div>

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex-shrink-0">
              {review.profiles.avatar_url && (
                <img
                  src={review.profiles.avatar_url}
                  alt={review.profiles.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div>
              <div className="font-medium">{review.profiles.full_name}</div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-600">{review.comment}</p>
          <div className="text-sm text-gray-400 mt-2">
            {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}