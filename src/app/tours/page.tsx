// src/app/tours/page.tsx
import TourList from '@/components/tours/tour-list'
import TourMap from '@/components/tours/tour-map'

export default function ToursPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Tours</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 투어 목록 */}
        <div className="lg:col-span-2">
          <TourList />
        </div>
        
        {/* 오른쪽: 지도 */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <TourMap />
          </div>
        </div>
      </div>
    </div>
  )
}