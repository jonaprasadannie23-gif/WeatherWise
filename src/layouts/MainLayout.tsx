import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { useSettings } from "../hooks/useSettings";

const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { tempUnit, dashPrefs, defaultCity } = useSettings();

  // On first mount, seed the search query from the saved default city
  useEffect(() => {
    if (defaultCity.trim()) {
      setSearchQuery(defaultCity.trim());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen bg-bg-main text-text-primary overflow-hidden">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area (Header + Scrollable Main Content) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Fixed Top Header */}
        <Header setIsMobileOpen={setIsMobileOpen} onSearch={setSearchQuery} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-main">
          <Outlet context={{ searchQuery, tempUnit, dashPrefs }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
