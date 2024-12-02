// src/components/reviews/review-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  tourId: string
  onSubmitted: () => void
}

export default function ReviewForm({ tourId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please login to submit a review')
        return
      }

      // 사용자가 이미 리뷰를 작성했는지 확인
      const { data: existingReview } = await supabase
        .from('reviews')
        .select()
        .eq('tour_id', tourId)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        setError('You have already reviewed this tour')
        return
      }

      // 예약 확인 (선택적)
      const { data: booking } = await supabase
        .from('bookings')
        .select()
        .eq('tour_id', tourId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single()

      if (!booking) {
        setError('You can only review tours you have completed')
        return
      }

      // 리뷰 생성
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          tour_id: tourId,
          user_id: user.id,
          rating,
          comment,
          booking_id: booking.id
        })

      if (reviewError) throw reviewError

      // 투어의 평균 평점 업데이트
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tour_id', tourId)

      if (reviews) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        await supabase
          .from('tours')
          .update({ 
            average_rating: avgRating,
            total_reviews: reviews.length
          })
          .eq('id', tourId)
      }

      setRating(0)
      setComment('')
      onSubmitted()
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Share your experience with this tour..."
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}