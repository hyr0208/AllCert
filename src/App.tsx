import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { FilterBar } from "./components/FilterBar";
import { CertGrid } from "./components/CertGrid";
import { CertDetailModal } from "./components/CertDetailModal";
import { ExamCalendar } from "./components/ExamCalendar";
import { InquiryPage } from "./components/InquiryPage";
import { Footer } from "./components/Footer";
import { certifications } from "./data/certifications";
import { CategoryType, Certification } from "./types/certification";

type ViewType = "certs" | "calendar" | "inquiry";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "전체"
  >("전체");
  const [currentView, setCurrentView] = useState<ViewType>("certs");
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "전체" || cert.category === selectedCategory;

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        cert.name.toLowerCase().includes(query) ||
        cert.organization.toLowerCase().includes(query) ||
        cert.description.toLowerCase().includes(query) ||
        cert.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCertClick = (certification: Certification) => {
    setSelectedCert(certification);
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case "certs":
        return (
          <>
            <FilterBar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              resultCount={filteredCertifications.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <CertGrid
              certifications={filteredCertifications}
              searchQuery={searchQuery}
              onCertClick={handleCertClick}
            />
          </>
        );
      case "calendar":
        return <ExamCalendar />;
      case "inquiry":
        return <InquiryPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-8">
        {/* Mobile Navigation - Above content */}
        <MobileNav currentView={currentView} onViewChange={setCurrentView} />

        {renderContent()}
      </main>

      <Footer />

      {/* 자격증 상세 모달 */}
      {selectedCert && (
        <CertDetailModal
          certification={selectedCert}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
