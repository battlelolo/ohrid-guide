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

interface RawBookingData {
  id: string
  tour_id: string
  booking_date: string
  number_of_people: number
  total_price: number
  status: string
  payment_status: string
  tours: {
    id: string
    title: string
    currency: string
  }
}

interface TourBasicInfo {
  id: string
  title: string
  currency: string
}

interface BookingWithTour {
  id: string
  tour_id: string
  booking_date: string
  number_of_people: number
  total_price: number
  status: string
  payment_status: string
  tours: TourBasicInfo
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    averageRating: 0
  })
  const [latestBookings, setLatestBookings] = useState<BookingWithTour[]>([])
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

        setStats({
          ...calculatedStats,
          averageRating: 0
        })
      }

      const { data, error: latestBookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          tour_id,
          booking_date,
          number_of_people,
          total_price,
          status,
          payment_status,
          tours!inner (
            id,
            title,
            currency
          )
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (latestBookingsError) {
        console.error('Latest bookings error:', latestBookingsError)
      }

      if (data) {
        const processedBookings: BookingWithTour[] = (data as RawBookingData[]).map(booking => ({
          id: booking.id,
          tour_id: booking.tour_id,
          booking_date: booking.booking_date,
          number_of_people: booking.number_of_people,
          total_price: booking.total_price,
          status: booking.status,
          payment_status: booking.payment_status,
          tours: {
            id: booking.tours.id,
            title: booking.tours.title,
            currency: booking.tours.currency
          }
        }))
        
        setLatestBookings(processedBookings)
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
                    <p className="font-medium">{booking.tours.title}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Guests: {booking.number_of_people}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment: {booking.payment_status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{booking.tours.currency}{booking.total_price}</p>
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
      </div>
    </div>
  )
}