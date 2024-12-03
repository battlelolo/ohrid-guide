// src/components/bookings/booking-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingFormProps {
  tourId: string
  price: number
  currency: string
  maxParticipants: number
}

export default function BookingForm({ tourId, price, currency, maxParticipants }: BookingFormProps) {
  const [date, setDate] = useState('')
  const [participants, setParticipants] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const totalPrice = price * participants
// src/components/bookings/booking-form.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Please login to make a booking')
      return
    }

    // 투어 정보에서 provider_id 가져오기
    const { data: tourData } = await supabase
      .from('tours')
      .select('provider_id')
      .eq('id', tourId)
      .single()

    if (!tourData) {
      setError('Tour not found')
      return
    }

    // 예약 생성
    const bookingData = {
      tour_id: tourId,
      user_id: user.id,
      provider_id: tourData.provider_id,  // provider_id 추가
      booking_date: date,
      number_of_people: participants,
      total_price: totalPrice,
      status: 'pending',
      payment_status: 'completed'
    }

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)

    if (bookingError) throw bookingError

    router.push('/bookings')
    router.refresh()
  } catch (err) {
    console.error('Booking error:', err)
    setError('Failed to make booking. Please try again.')
  } finally {
    setLoading(false)
  }
}

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of People
        </label>
        <select
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
          required
        >
          {[...Array(maxParticipants)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? 'person' : 'people'}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span>Price per person:</span>
          <span>{currency} {price}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{currency} {totalPrice}</span>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Book Now'}
      </button>
    </form>
  )
}