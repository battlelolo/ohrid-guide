// src/app/tours/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import TourDetail from '@/components/tours/tour-detail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TourPage({ params }: PageProps) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    })
    
    console.log('Fetching tour with ID:', id)
    
    // 기본 투어 정보와 이미지 가져오기
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select(`
        *,
        tour_images (
          id,
          image_url,
          is_main
        )
      `)
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('Error fetching tour:', tourError)
      return notFound()
    }

    if (!tour) {
      console.log('Tour not found')
      return notFound()
    }

    // 리뷰 정보 가져오기 - 단순화된 쿼리
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('tour_id', id)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    // 데이터 조합
    const tourWithAll = {
      ...tour,
      images: tour.tour_images,
      reviews: reviews || []
    }

    console.log('Processed tour data:', tourWithAll)

    return <TourDetail tour={tourWithAll} />
    
  } catch (error) {
    console.error('Error in TourPage:', error)
    return notFound()
  }
}