// src/app/tours/[id]/loading.tsx
export default function Loading() {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-900 rounded-lg mb-8" />
          <div className="h-8 bg-gray-900 w-3/4 rounded mb-4" />
          <div className="h-4 bg-gray-900 w-1/2 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-40 bg-gray-900 rounded mb-4" />
              <div className="h-40 bg-gray-900 rounded" />
            </div>
            <div className="h-96 bg-gray-900 rounded" />
          </div>
        </div>
      </div>
    )
  }