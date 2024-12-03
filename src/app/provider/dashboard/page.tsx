// src/app/provider/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, DollarSign, Users, Star } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  pendingBookings: number
  averageRating: number
}

interface LatestBooking {
  id: string
  booking_date: string
  number_of_people: number
  total_price: number
  status: string
  tours: {
    title: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  tours: {
    title: string
  }
  profiles: {
    full_name: string
  }
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    averageRating: 0
  })
  const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 통계 데이터 가져오기
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, status')
      .eq('provider_id', user.id)

    if (bookings) {
      const stats = bookings.reduce((acc, booking) => ({
        totalRevenue: acc.totalRevenue + booking.total_price,
        totalBookings: acc.totalBookings + 1,
        pendingBookings: acc.pendingBookings + (booking.status === 'pending' ? 1 : 0)
      }), {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0
      })

      // 평균 평점 계산
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tour.provider_id', user.id)

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      setStats({
        ...stats,
        averageRating
      })
    }

    // 최근 예약 가져오기
    const { data: latestBookings } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        number_of_people,
        total_price,
        status,
        tours (
          title
        )
      `)
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (latestBookings) {
      setLatestBookings(latestBookings)
    }

    // 최근 리뷰 가져오기
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        tours (
          title
        ),
        profiles (
          full_name
        )
      `)
      .eq('tour.provider_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentReviews) {
      setRecentReviews(recentReviews)
    }

    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">€{stats.totalRevenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Bookings</p>
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 예약 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Latest Bookings</h2>
          <div className="space-y-4">
            {latestBookings.map((booking) => (
              <div key={booking.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{booking.tours.title}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Guests: {booking.number_of_people}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{booking.total_price}</p>
                    <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 리뷰 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{review.tours.title}</p>
                    <p className="text-sm text-gray-600">{review.profiles.full_name}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm mt-1">{review.comment}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}