// src/components/tours/tour-detail.tsx
'use client'

import { useState } from 'react'
import { Tour } from '@/types/tour'
import Map, { Marker } from 'react-map-gl'
import { Clock, Users, Check, X, MapPin, Star } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import Image from 'next/image'
import BookingForm from '../bookings/booking-form'

interface TourDetailProps {
  tour: Tour
}

export default function TourDetail({ tour }: TourDetailProps) {
  const [activeTab, setActiveTab] = useState('description')

  // 평균 평점 계산
  const averageRating = tour.reviews?.length 
    ? (tour.reviews.reduce((sum, review) => sum + review.rating, 0) / tour.reviews.length).toFixed(1)
    : 'No ratings'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 이미지 섹션 */}
      {tour.images && tour.images.length > 0 && (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={tour.images[0].image_url}
            alt={tour.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 컨텐츠 */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <Clock size={20} />
              <span>{tour.duration} hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={20} />
              <span>Max {tour.max_participants} people</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={20} />
              <span>{tour.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={20} className="text-yellow-400" />
              <span>{averageRating}</span>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b mb-6">
            <nav className="flex gap-6">
              {['description', 'details', 'location', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 border-b-2 px-1 ${
                    activeTab === tab 
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="mb-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{tour.description}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">What&apos;s Included</h3>
                  <ul className="space-y-2">
                    {tour.included_items?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What&apos;s Not Included</h3>
                  <ul className="space-y-2">
                    {tour.excluded_items?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <X size={16} className="text-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {tour.requirements?.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                  <p>{tour.cancellation_policy}</p>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: tour.longitude,
                      latitude: tour.latitude,
                      zoom: 13
                    }}
                    style={{width: '100%', height: '100%'}}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                  >
                    <Marker
                      longitude={tour.longitude}
                      latitude={tour.latitude}
                    >
                      <div className="bg-red-500 p-2 rounded-full" />
                    </Marker>
                  </Map>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Meeting Point</h3>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    {tour.meeting_point}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {tour.reviews?.length ? (
                  tour.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {review.profiles?.avatar_url && (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={review.profiles.avatar_url}
                              alt={review.profiles.full_name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {review.profiles?.full_name || 'Anonymous'}
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <div className="text-sm text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 예약 사이드바 */}
        <div>
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold mb-4">
                {tour.currency} {tour.price}
                <span className="text-lg font-normal text-gray-600"> /person</span>
              </div>
              <BookingForm
                tourId={tour.id}
                price={tour.price}
                currency={tour.currency}
                maxParticipants={tour.max_participants}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}