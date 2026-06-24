import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchIcon, MenuIcon, UserIcon, BellIcon } from "../icons";
import type { WeatherData } from "../../types/weather";

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  onSearch: (query: string) => void;
  advisorWeather: WeatherData | null;
}

const Header: React.FC<HeaderProps> = ({
  setIsMobileOpen,
  onSearch,
  advisorWeather,
}) => {
  
  const [inputValue, setInputValue] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showAdvisor, setShowAdvisor] = useState(false);
  

  const navigate = useNavigate();
  console.log(advisorWeather);
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
  const loadHistory = () => {
  const stored = JSON.parse(
    localStorage.getItem("weatherwise-history") || "[]"
  );

  setHistory(stored);
};
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="h-16 bg-bg-header border-b border-border-header flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 select-none">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-brand-border focus:outline-none"
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <span className="font-bold text-lg text-text-primary tracking-tight md:hidden">
          WeatherWise
        </span>
      </div>

      {/* Search */}
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

      {/* Right section */}
      <div className="flex items-center gap-2">
      {/* Weather Advisor */}
<div className="relative">
  <button
    onClick={() => {
      setShowAdvisor(!showAdvisor);
      setShowProfile(false);
    }}
    className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-brand-border transition-colors duration-150 relative"
    aria-label="Weather Advisor"
  >
    <BellIcon className="w-5 h-5" />

    {advisorWeather && (
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full" />
    )}
  </button>

  {showAdvisor && (
    <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="p-4 border-b border-brand-border">
        <h3 className="font-semibold text-text-primary">
          💡 Weather Advisor
        </h3>

        {advisorWeather && (
          <p className="text-xs text-text-secondary mt-1">
            📍 {advisorWeather.city}, {advisorWeather.country}
          </p>
        )}
      </div>

      <div className="p-4">
        {!advisorWeather ? (
          <p className="text-sm text-text-secondary">
            Search for a city to get weather insights.
          </p>
        ) : (
          <div className="space-y-4">

            <div>
              <p className="font-medium text-text-primary">
                🌡 Temperature
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {advisorWeather.temp >= 35
                  ? "High temperature detected. Stay hydrated and avoid prolonged sun exposure."
                  : advisorWeather.temp >= 25
                  ? "Warm and comfortable weather conditions."
                  : "Cool weather detected. Consider carrying a light jacket."}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">
                💧 Humidity
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {advisorWeather.humidity >= 75
                  ? "High humidity may cause discomfort. Light clothing is recommended."
                  : "Humidity levels are comfortable."}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">
                🌬 Wind Conditions
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {advisorWeather.windSpeed > 8
                  ? "Moderately strong winds detected outdoors."
                  : "Calm winds. Outdoor comfort is good."}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">
                ☁ Sky Conditions
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {advisorWeather.description}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">
                🚶 Recommendation
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Good conditions for walking and commuting.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )}
</div>
  

        {/* Profile */}
        <div className="relative">
          <button
  onClick={() => {
  loadHistory();
  setShowProfile(!showProfile);
  setShowAdvisor(false);
}}
            className="w-8 h-8 rounded-full bg-bg-card border border-brand-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="User Profile"
          >
            <UserIcon className="w-4.5 h-4.5" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-bg-card border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-brand-border">
                <h3 className="font-semibold text-text-primary">
                  WeatherWise Profile
                </h3>

                <p className="text-xs text-text-secondary mt-1">
                  Guest User
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-main transition-colors"
                >
                  ⚙ Settings
                </button>

               <div className="border-t border-brand-border my-2" />

<div className="px-3 py-2">
  <p className="text-xs text-text-secondary mb-2">
    Recent Searches
  </p>

  {history.length === 0 ? (
    <p className="text-xs text-text-secondary">
      No searches yet
    </p>
  ) : (
    <div className="space-y-1">
      {history.map((city) => (
        <button
          key={city}
          onClick={() => {
            onSearch(city);
            navigate("/");
            setShowProfile(false);
          }}
          className="block w-full text-left text-sm px-2 py-1 rounded hover:bg-bg-main"
        >
          📍 {city}
        </button>
      ))}
    </div>
  )}
</div>

                <button
  onClick={() => {
    setShowAbout(true);
    setShowProfile(false);
  }}
  className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-main transition-colors"
>
  ℹ About WeatherWise
</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAbout && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
    <div className="bg-bg-card border border-brand-border rounded-2xl w-full max-w-md p-6 mx-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          WeatherWise
        </h2>

        <button
          onClick={() => setShowAbout(false)}
          className="text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <p className="text-text-secondary">
          Version 1.0
        </p>

        <div>
          <p className="font-semibold text-text-primary mb-2">
            Built With
          </p>

          <ul className="space-y-1 text-text-secondary">
            <li>⚛ React</li>
            <li>📘 TypeScript</li>
            <li>🎨 Tailwind CSS</li>
            <li>🌦 OpenWeather API</li>
            <li>📈 Recharts</li>
          </ul>
        </div>

        <div className="pt-3 border-t border-brand-border">
          <p className="text-text-secondary">
        
          </p>
        </div>
      </div>
    </div>
  </div>
)}
    </header>
  );
};

export default Header;