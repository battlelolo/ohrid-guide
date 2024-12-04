'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Footer() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && session) {
        router.push('/provider/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const handlePartnerSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6 items-center">
            {user ? (
              <>
                <Link 
                  href="/provider/dashboard"
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/provider/bookings"
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Bookings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Partner Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handlePartnerSignIn}
                className="text-gray-600 hover:text-gray-900 hover:underline"
              >
                Partner Sign In
              </button>
            )}
          </div>
          <p className="text-gray-700">
            &copy; {new Date().getFullYear()} Ohrid Guide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}