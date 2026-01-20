import { List, Calendar, MessageSquarePlus } from "lucide-react";

type ViewType = "certs" | "calendar" | "inquiry";

interface MobileNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  return (
    <>
      <div className="mobile-nav md:hidden">
        <button
          onClick={() => onViewChange("certs")}
          className={`mobile-nav-button ${currentView === "certs" ? "active" : ""}`}
        >
          <List className="w-4 h-4" />
          <span>자격증 목록</span>
        </button>
        <button
          onClick={() => onViewChange("calendar")}
          className={`mobile-nav-button ${currentView === "calendar" ? "active" : ""}`}
        >
          <Calendar className="w-4 h-4" />
          <span>시험일정</span>
        </button>
        <button
          onClick={() => onViewChange("inquiry")}
          className={`mobile-nav-button ${currentView === "inquiry" ? "active" : ""}`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>문의하기</span>
        </button>
      </div>
      {/* Spacer for fixed nav */}
      <div className="mobile-nav-spacer md:hidden" />
    </>
  );
}
