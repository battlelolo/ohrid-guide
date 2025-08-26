"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Modal from '@/components/modal/modal'; // Assuming @ is configured for src

export default function Home() {
  const [tours, setTours] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true); // Open modal on page load
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select(`
          id,
          title,
          description,
          price,
          tour_images (
            image_url,
            is_main
          )
        `)
        .order('created_at', { ascending: false });
      if (data) {
        setTours(data);
      }
    };

    getTours();
  }, [supabase]);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Thanks for visiting!</h2>
        <p>We are preparing a mobile app for 2026. Please join as a beta tester to get updates!</p>
        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.open('https://forms.gle/x9GfZSAXbtDM2H1G6', '_blank');
              setIsModalOpen(false);
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Join Waitlist
          </button>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Ohrid Guide
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Discover the best tours and experiences in Ohrid and Macedonia.
          Let us guide you through the most beautiful places in the Balkans.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours?.map((tour) => {
            const mainImage = tour.tour_images?.find((img: any) => img.is_main)?.image_url || tour.tour_images?.[0]?.image_url;
            
            return (
              <Link 
                href={`/tours/${tour.id}`} 
                key={tour.id}
                className="group bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={mainImage || '/placeholder-tour.jpg'}
                    alt={tour.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700 group-hover:text-blue-600">
                    {tour.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tour.description}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    ${tour.price}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}