import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchIcon, MenuIcon, UserIcon, BellIcon } from "../icons";

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMobileOpen, onSearch }) => {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSearch(trimmed);
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="h-16 bg-bg-header border-b border-border-header flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 select-none">
      {/* Left section: mobile hamburger toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-brand-border focus:outline-none"
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Brand name for mobile view */}
        <span className="font-bold text-lg text-text-primary tracking-tight md:hidden">
          WeatherWise
        </span>
      </div>

      {/* Middle section: search bar placeholder */}
      <div className="flex-1 max-w-md mx-4 md:mx-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4.5 w-4.5 text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search city..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-bg-main border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand-accent transition-colors duration-150"
          />
        </div>
      </div>

      {/* Right section: profile / notifications placeholder */}
      <div className="flex items-center gap-2">
        {/* Notifications placeholder */}
        <button
          disabled
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-brand-border transition-colors duration-150 relative cursor-not-allowed"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full" />
        </button>

        {/* Profile/User settings placeholder (icon only) */}
        <button
          disabled
          className="w-8 h-8 rounded-full bg-bg-card border border-brand-border flex items-center justify-center text-text-secondary cursor-not-allowed"
          aria-label="User Profile"
        >
          <UserIcon className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
