// src/components/reviews/review-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  tourId: string
  onReviewSubmitted: () => void
}

export default function ReviewForm({ tourId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('reviews')
      .insert({
        tour_id: tourId,
        user_id: user.id,
        rating,
        comment
      })

    if (!error) {
      setRating(0)
      setComment('')
      onReviewSubmitted()
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                fill={star <= rating ? 'gold' : 'none'}
                className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-2 border rounded-md"
        rows={4}
        required
      />
      
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}