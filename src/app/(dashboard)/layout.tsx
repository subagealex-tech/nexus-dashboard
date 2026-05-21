"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import BackgroundScene from "@/components/three/BackgroundScene";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      <BackgroundScene />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:ml-[260px] transition-all duration-300 min-h-screen relative z-10">
        <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-glass-bg transition-colors"
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass-bg border border-glass-border text-text-muted text-sm min-w-[240px]">
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Search...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-glass-bg transition-colors">
                <Bell className="w-[18px] h-[18px] text-text-secondary" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan ring-2 ring-bg-primary" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center ml-1 cursor-pointer">
                <span className="text-[10px] font-medium text-white">AD</span>
              </div>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-4 lg:p-8"
        >
          {children}
        </motion.main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
