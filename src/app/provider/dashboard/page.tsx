'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price, status, booking_date')
        .eq('provider_id', user.id)

      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        setError('Failed to fetch bookings')
        setLoading(false)
        return
      }

      if (bookings) {
        const calculatedStats = bookings.reduce((acc, booking) => ({
          totalRevenue: acc.totalRevenue + (booking.total_price || 0),
          totalBookings: acc.totalBookings + 1,
          pendingBookings: acc.pendingBookings + (booking.status === 'pending' ? 1 : 0)
        }), {
          totalRevenue: 0,
          totalBookings: 0,
          pendingBookings: 0
        })

        // Get reviews for average rating
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            rating,
            tours (
              provider_id
            )
          `)
          .eq('tours.provider_id', user.id)

        if (reviewsError) {
          console.error('Reviews error:', reviewsError)
        }

        if (reviews && reviews.length > 0) {
          const averageRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
          setStats({
            ...calculatedStats,
            averageRating
          })
        } else {
          setStats({
            ...calculatedStats,
            averageRating: 0
          })
        }
      }

      const { data: latestBookings, error: latestBookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          number_of_people,
          total_price,
          status,
          tours!inner (
            title
          )
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (latestBookingsError) {
        console.error('Latest bookings error:', latestBookingsError)
      }

      if (latestBookings) {
        setLatestBookings(latestBookings.map(booking => ({
          id: booking.id,
          booking_date: booking.booking_date,
          number_of_people: booking.number_of_people,
          total_price: booking.total_price,
          status: booking.status,
          tours: {
            title: booking.tours?.[0]?.title || ''  // Access first element of tours array
          }
        })))
      }
      // Get recent reviews
      const { data: recentReviews, error: recentReviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          tours (
            title,
            provider_id
          ),
          profiles (
            full_name
          )
        `)
        .eq('tours.provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentReviewsError) {
        console.error('Recent reviews error:', recentReviewsError)
      }

      if (recentReviews) {
        setRecentReviews(recentReviews)
      }

    } catch (error) {
      console.error('Dashboard error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Latest Bookings</h2>
          <div className="space-y-4">
            {latestBookings.map((booking) => (
              <div key={booking.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{booking.tours?.title || 'Unnamed Tour'}</p>
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
            {latestBookings.length === 0 && (
              <p className="text-gray-500 text-center">No bookings yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{review.tours?.title || 'Unnamed Tour'}</p>
                    <p className="text-sm text-gray-600">{review.profiles?.full_name || 'Anonymous'}</p>
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
            {recentReviews.length === 0 && (
              <p className="text-gray-500 text-center">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}