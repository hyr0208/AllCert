import { Award, List, Calendar, MessageSquarePlus } from "lucide-react";

type ViewType = "certs" | "calendar" | "inquiry";

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AllCert</h1>
              <p className="text-xs text-gray-500">모든 자격증 포털</p>
            </div>
          </div>

          {/* View Tabs - Desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onViewChange("certs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === "certs"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4 md:block hidden" />
              <span>자격증 목록</span>
            </button>
            <button
              onClick={() => onViewChange("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === "calendar"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4 md:block hidden" />
              <span>시험일정</span>
            </button>
            <button
              onClick={() => onViewChange("inquiry")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === "inquiry"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquarePlus className="w-4 h-4 md:block hidden" />
              <span>문의하기</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
