// src/components/tours/tour-map.tsx
'use client'

import { useEffect, useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import { Tour } from '@/types/tour'
import Link from 'next/link'

export default function TourMap() {
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('*')

      if (data) {
        setTours(data)
      }
    }

    fetchTours()
  }, [])

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: 20.7944,
        latitude: 41.1231,
        zoom: 11
      }}
      style={{width: '100%', height: 'calc(100vh - 200px)'}}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {tours.map((tour) => (
        <Marker
          key={tour.id}
          longitude={tour.longitude}
          latitude={tour.latitude}
          onClick={e => {
            e.originalEvent.stopPropagation()
            setSelectedTour(tour)
          }}
        >
          <div className="bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors" />
        </Marker>
      ))}

      {selectedTour && (
        <Popup
          longitude={selectedTour.longitude}
          latitude={selectedTour.latitude}
          anchor="bottom"
          onClose={() => setSelectedTour(null)}
        >
          <div className="p-2 max-w-[200px]">
            <h3 className="font-semibold text-sm mb-1">{selectedTour.title}</h3>
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{selectedTour.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold">{selectedTour.currency} {selectedTour.price}</span>
              <Link 
                href={`/tours/${selectedTour.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  )
}