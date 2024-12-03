// src/components/reviews/review-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface ReviewFormProps {
 tourId: string
 onSubmitted: () => void
 onCancel: () => void
}

export default function ReviewForm({ tourId, onSubmitted, onCancel }: ReviewFormProps) {
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

     const { error: reviewError } = await supabase
       .from('reviews')
       .insert({
         tour_id: tourId,
         user_id: user.id,
         rating,
         comment
       })

     if (reviewError) throw reviewError

     onSubmitted()
   } catch (err) {
     console.error('Error submitting review:', err)
     setError('Failed to submit review')
   } finally {
     setLoading(false)
   }
 }

 return (
   <div className="bg-white p-6 rounded-lg shadow">
     <form onSubmit={handleSubmit} className="space-y-4">
       <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
       
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
         <div className="flex gap-1">
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
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Your Review
         </label>
         <textarea
           value={comment}
           onChange={(e) => setComment(e.target.value)}
           className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
           rows={4}
           placeholder="Share your experience..."
           required
         />
       </div>

       {error && (
         <div className="text-red-500 text-sm">{error}</div>
       )}

       <div className="flex justify-end space-x-2">
         <button
           type="button"
           onClick={onCancel}
           className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800"
         >
           Cancel
         </button>
         <button
           type="submit"
           disabled={loading || rating === 0}
           className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
         >
           Submit Review
         </button>
       </div>
     </form>
   </div>
 )
}