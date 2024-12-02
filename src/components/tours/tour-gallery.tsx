// src/components/tours/tour-gallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TourImage } from '@/types/tour'

interface TourGalleryProps {
  images: TourImage[]
}

export default function TourGallery({ images }: TourGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || null)

  return (
    <div className="mb-8">
      {/* 메인 이미지 */}
      {mainImage && (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
          <Image
            src={mainImage.image_url}
            alt="Tour"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 썸네일 이미지들 */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative w-full pt-[60%] rounded-lg overflow-hidden cursor-pointer
                ${mainImage?.id === image.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setMainImage(image)}
            >
              <Image
                src={image.image_url}
                alt="Tour thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}