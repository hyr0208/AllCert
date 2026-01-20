import { Search } from "lucide-react";
import { CATEGORIES, CategoryType } from "../types/certification";

interface FilterBarProps {
  selectedCategory: CategoryType | "전체";
  onCategoryChange: (category: CategoryType | "전체") => void;
  resultCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  resultCount,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="py-6">
      {/* 모바일 검색창 - 상단에 배치 */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="자격증 이름, 기관, 키워드로 검색..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                       text-gray-900 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white
                       transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 결과 카운트 + PC 검색창 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <p className="text-gray-600">
          <span className="text-gray-900 font-semibold">{resultCount}</span>개의
          자격증
        </p>

        {/* PC 검색창 - 오른쪽에 배치 */}
        <div className="relative hidden md:block w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="자격증 이름, 기관, 키워드로 검색..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                       text-sm text-gray-900 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white
                       transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(({ key, label }) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200 
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
