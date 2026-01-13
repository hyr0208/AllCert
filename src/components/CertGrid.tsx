import { SearchX } from "lucide-react";
import { Certification } from "../types/certification";
import { CertCard } from "./CertCard";

interface CertGridProps {
  certifications: Certification[];
  searchQuery: string;
}

export function CertGrid({ certifications, searchQuery }: CertGridProps) {
  if (certifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-gray-400 max-w-md">
          {searchQuery ? (
            <>
              "<span className="text-blue-400">{searchQuery}</span>"에 대한 검색
              결과가 없습니다.
              <br />
              다른 키워드로 검색해 보세요.
            </>
          ) : (
            "선택한 카테고리에 자격증이 없습니다."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {certifications.map((cert, index) => (
        <CertCard key={cert.id} certification={cert} index={index} />
      ))}
    </div>
  );
}
