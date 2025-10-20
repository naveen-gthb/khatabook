"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname?.split("/")[1];

    switch (path) {
      case "dashboard":
        return "Dashboard";
      case "contacts":
        return "Contacts";
      case "transactions":
        return "Transactions";
      case "orders":
        return "Orders";
      case "import-export":
        return "Import/Export";
      case "reports":
        return "Reports";
      case "settings":
        return "Settings";
      default:
        return "KhataBook";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}

// Made with Bob
