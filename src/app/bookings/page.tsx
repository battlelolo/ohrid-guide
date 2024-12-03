'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ReviewForm from '@/components/reviews/review-form'

interface Booking {
  id: string
  booking_date: string
  number_of_people: number
  total_price: number
  status: string
  tours: {
    id: string
    title: string
    currency: string
  }
  has_review?: boolean
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (
            id,
            title,
            currency
          ),
          reviews!left (
            id
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })

      if (error) throw error

      const bookingsWithReviewStatus = data?.map(booking => ({
        ...booking,
        has_review: booking.reviews ? booking.reviews.length > 0 : false
      })) || []

      setBookings(bookingsWithReviewStatus)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (
            id,
            title,
            currency
          ),
          reviews!left (
            id
          )
        `)
        .eq('id', bookingId)
        .single()
  
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting booking status:', error)
      throw error
    }
  }

  const handleReviewSubmitted = async () => {
    if (selectedBookingId) {
      try {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'reviewed' })
          .eq('id', selectedBookingId)
  
        if (updateError) throw updateError
  
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === selectedBookingId 
              ? { ...booking, status: 'reviewed', has_review: true }
              : booking
          )
        )
        
        setSelectedTourId(null)
        setSelectedBookingId(null)
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const canWriteReview = (booking: Booking) => {
    return booking.status === 'completed' && !booking.has_review
  }

  const handleWriteReview = (booking: Booking) => {
    setSelectedTourId(booking.tours.id)
    setSelectedBookingId(booking.id)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  <Link 
                    href={`/tours/${booking.tours.id}`}
                    className="hover:text-blue-600"
                  >
                    {booking.tours.title}
                  </Link>
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p>Guests: {booking.number_of_people}</p>
                  <p>Total: {booking.tours.currency} {booking.total_price}</p>
                  <p>Status: <span className="capitalize">{booking.status}</span></p>
                </div>
              </div>

              {canWriteReview(booking) && (
                <button
                  onClick={() => handleWriteReview(booking)}
                  className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Write Review
                </button>
              )}

              {booking.has_review && (
                <span className="text-sm text-green-600">Review submitted ✓</span>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        )}
      </div>

      {selectedTourId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ReviewForm
              tourId={selectedTourId}
              onSubmitted={handleReviewSubmitted}
              onCancel={() => {
                setSelectedTourId(null)
                setSelectedBookingId(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}