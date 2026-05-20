"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hexagon,
  Upload,
  FileText,
  StickyNote,
  FolderTree,
  X,
  Users,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/data",
    label: "Data Management",
    icon: Database,
  },
  {
    href: "/dashboard/report",
    label: "Report Generator",
    icon: FileText,
  },
  {
    href: "/dashboard/notes",
    label: "Notes",
    icon: StickyNote,
  },
  {
    href: "/dashboard/organization",
    label: "Organization",
    icon: FolderTree,
  },
  {
    href: "/dashboard/contacts",
    label: "Contacts",
    icon: Users,
  },
  {
    href: "/dashboard/account",
    label: "Account",
    icon: UserCog,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 280,
          x: isOpen ? 0 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen glass border-r border-glass-border z-50 flex flex-col",
          "hidden lg:flex"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0">
            <Hexagon className="w-6 h-6 text-bg-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-xl text-gradient-cyan font-[family-name:var(--font-outfit)] whitespace-nowrap"
              >
                Nexus
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="px-3 mb-2">
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                      : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-glass-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-bg transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm hidden xl:inline">Collapse</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 border-t border-glass-border">
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "text-text-secondary hover:text-text-primary hover:bg-glass-bg transition-all cursor-pointer"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">AD</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-text-primary truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-text-muted truncate">admin@nexus.io</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen w-[280px] glass border-r border-glass-border z-50 flex flex-col lg:hidden"
      >
        <div className="p-4 flex items-center justify-between border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0">
              <Hexagon className="w-6 h-6 text-bg-primary" />
            </div>
            <span className="font-bold text-xl text-gradient-cyan font-[family-name:var(--font-outfit)]">
              Nexus
            </span>
          </div>
          <button
            onClick={() => setIsOpen?.(false)}
            className="p-2 rounded-lg hover:bg-glass-bg"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="px-3 py-2">
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-glass-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center">
              <span className="text-sm font-medium text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Admin User</p>
              <p className="text-xs text-text-muted truncate">admin@nexus.io</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}