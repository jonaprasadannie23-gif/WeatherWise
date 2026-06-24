import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  AnalyticsIcon,
  CompareIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon
} from "../icons";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems = [
    { name: "Dashboard", path: "/", icon: DashboardIcon, end: true },
    { name: "Analytics", path: "/analytics", icon: AnalyticsIcon, end: false },
    { name: "Compare", path: "/compare", icon: CompareIcon, end: false },
    { name: "Settings", path: "/settings", icon: SettingsIcon, end: false },
  ];

  const sidebarClasses = `
    h-screen bg-bg-sidebar border-r border-brand-border flex flex-col justify-between select-none
    ${isCollapsed ? "w-20" : "w-64"}
  `;

  const linkClasses = (isActive: boolean) => `
    flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150
    ${isActive
      ? "bg-bg-card/80 text-brand-accent/80 border-l-4 border-brand-accent/80 pl-3"
      : "text-text-secondary hover:bg-bg-card/40 hover:text-text-primary"
    }
    ${isCollapsed ? "justify-center px-2" : ""}
  `;

  const renderContent = () => (
    <>
      <div className="flex flex-col flex-1">
        {/* Header / Logo section */}
        <div className={`h-16 flex items-center justify-between border-b border-brand-border ${isCollapsed ? "px-4" : "px-6"}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                <span className="font-extrabold text-brand-accent text-lg">W</span>
              </div>
              <span className="font-bold text-lg text-text-primary tracking-tight">WeatherWise</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                <span className="font-extrabold text-brand-accent text-xl">W</span>
              </div>
            </div>
          )}

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent hover:border-brand-border focus:outline-none"
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => linkClasses(isActive)}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Collapse / Expand Toggle Button (Desktop only) */}
      <div className="p-4 border-t border-brand-border hidden md:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 bg-bg-card hover:bg-bg-card/85 text-text-secondary hover:text-text-primary rounded-xl border border-brand-border transition-colors duration-150"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-xs font-semibold">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${sidebarClasses} shrink-0`}>
        {renderContent()}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className={`md:hidden fixed inset-0 z-50 ${isMobileOpen ? "block" : "hidden"}`}>
        {/* Drawer Backdrop */}
        <div
          className="fixed inset-0 bg-black/60"
          onClick={() => setIsMobileOpen(false)}
        />
        {/* Drawer Content */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-bg-sidebar flex flex-col justify-between border-r border-brand-border">
          {renderContent()}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
