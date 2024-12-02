// src/types/filter.ts를 수정
export interface FilterOptions {  // TourFilters -> FilterOptions로 이름 변경
    search: string;
    minPrice: number;
    maxPrice: number;
    duration: number | null;
    location: string;
  }