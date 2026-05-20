"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="lg:ml-[280px] ml-0 min-h-screen p-4 lg:p-8 relative z-10"
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-glass-bg border border-glass-border"
        >
          <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {children}
      </motion.main>
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}