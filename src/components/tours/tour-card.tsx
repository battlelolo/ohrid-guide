import { Tour } from '@/types/tour'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Star } from 'lucide-react'

interface TourCardProps {
  tour: Tour
}

export default function TourCard({ tour }: TourCardProps) {
  const mainImage = tour.images?.find(img => img.is_main)

  return (
    <Link href={`/tours/${tour.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          {mainImage ? (
            <Image
              src={mainImage.image_url}
              alt={tour.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{tour.title}</h2>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{tour.duration} hours</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{tour.location}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" />
              <span>{tour.average_rating.toFixed(1)}</span>
              <span className="text-gray-600">
                ({tour.total_reviews} reviews)
              </span>
            </div>
            <div className="text-xl font-bold">
              {tour.currency} {tour.price}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}