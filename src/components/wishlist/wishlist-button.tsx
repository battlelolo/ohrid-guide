// src/components/wishlist/wishlist-button.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

interface WishlistButtonProps {
  tourId: string
}

export default function WishlistButton({ tourId }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkWishlistStatus()
  }, [tourId])

  const checkWishlistStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data } = await supabase
      .from('wishlists')
      .select()
      .eq('user_id', user.id)
      .eq('tour_id', tourId)
      .single()

    setIsInWishlist(!!data)
    setIsLoading(false)
  }

  const toggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isInWishlist) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('tour_id', tourId)
      setIsInWishlist(false)
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, tour_id: tourId })
      setIsInWishlist(true)
    }
  }

  if (isLoading) return null

  return (
    <button
      onClick={toggleWishlist}
      className="p-2 rounded-full hover:bg-gray-100"
    >
      <Heart
        className={isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}
      />
    </button>
  )
}