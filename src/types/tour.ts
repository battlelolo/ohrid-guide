// src/types/tour.ts
export interface Tour {
  id: string
  provider_id: string
  title: string
  description: string
  price: number
  currency: string
  duration: number
  max_participants: number
  location: string
  longitude: number
  latitude: number
  meeting_point: string
  included_items: string[]
  excluded_items: string[]
  requirements: string[]
  cancellation_policy: string
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string | null
  images?: TourImage[]
  tour_images?: TourImage[]  // 추가
  reviews?: Review[]
}

export interface TourImage {
  id: string
  tour_id?: string
  image_url: string
  is_main: boolean
  created_at?: string
}

export interface Review {
  id: string
  tour_id?: string
  user_id?: string
  rating: number
  comment: string
  created_at: string
  profiles?: {
    full_name: string
    avatar_url: string
  }
}