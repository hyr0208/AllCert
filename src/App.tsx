import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { CertGrid } from "./components/CertGrid";
import { ExamCalendar } from "./components/ExamCalendar";
import { Footer } from "./components/Footer";
import { certifications } from "./data/certifications";
import { CategoryType } from "./types/certification";

type ViewType = "certs" | "calendar";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "전체"
  >("전체");
  const [currentView, setCurrentView] = useState<ViewType>("certs");

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-8">
        {currentView === "certs" ? (
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
            />
          </>
        ) : (
          <ExamCalendar />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
