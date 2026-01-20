import { ExternalLink, Building2 } from "lucide-react";
import { Certification } from "../types/certification";

interface CertCardProps {
  certification: Certification;
  index: number;
  onCardClick: (certification: Certification) => void;
}

const getCategoryTagClass = (category: string): string => {
  switch (category) {
    case "IT":
      return "tag-it";
    case "어학":
      return "tag-language";
    case "전문자격":
      return "tag-professional";
    case "기술":
      return "tag-technical";
    case "금융":
      return "tag-finance";
    case "디자인":
      return "tag-design";
    default:
      return "tag-default";
  }
};

export function CertCard({ certification, index, onCardClick }: CertCardProps) {
  return (
    <div
      className="glass-card p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] card-stagger"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onCardClick(certification)}
    >
      {/* Category Tag */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryTagClass(
            certification.category
          )}`}
        >
          {certification.category}
        </span>
        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {certification.name}
      </h3>

      {/* Organization */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
        <Building2 className="w-4 h-4" />
        <span>{certification.organization}</span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {certification.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {certification.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
          >
            #{tag}
          </span>
        ))}
        {certification.tags.length > 3 && (
          <span className="px-2 py-0.5 text-gray-400 text-xs">
            +{certification.tags.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}
