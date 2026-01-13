import { CATEGORIES, CategoryType } from "../types/certification";

interface FilterBarProps {
  selectedCategory: CategoryType | "전체";
  onCategoryChange: (category: CategoryType | "전체") => void;
  resultCount: number;
}

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <p className="text-gray-600">
          <span className="text-gray-900 font-semibold">{resultCount}</span>개의
          자격증
        </p>
      </div>

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
