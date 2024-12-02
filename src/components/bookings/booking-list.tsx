// src/components/bookings/booking-list.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Booking {
  id: string
  booking_date: string
  number_of_people: number
  total_price: number
  status: string
  tours: {
    title: string
    currency: string
  }
}

export default function BookingList({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (
            title,
            currency
          )
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false })

      if (data && !error) {
        setBookings(data)
      }
      setLoading(false)
    }

    fetchBookings()
  }, [userId])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookings yet</p>
          <Link href="/tours" className="text-blue-600 hover:underline">
            Browse tours
          </Link>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{booking.tours.title}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p>Participants: {booking.number_of_people}</p>
                  <p>Status: <span className="capitalize">{booking.status}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {booking.tours.currency} {booking.total_price}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}