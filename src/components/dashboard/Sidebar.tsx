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
  Hexagon,
  FileText,
  StickyNote,
  FolderTree,
  X,
  Users,
  UserCog,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/data", label: "Data", icon: Database },
  { href: "/dashboard/report", label: "Reports", icon: FileText },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard/organization", label: "Files", icon: FolderTree },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/account", label: "Account", icon: UserCog },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 72 : 260,
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-0 top-0 h-screen glass border-r border-glass-border z-50 flex flex-col",
          "hidden lg:flex"
        )}
      >
        <div className={cn("flex items-center py-5", collapsed ? "justify-center" : "px-5 gap-3")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-cyan/20">
            <Hexagon className="w-5 h-5 text-bg-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-lg text-gradient-cyan font-[family-name:var(--font-outfit)] tracking-tight"
              >
                Nexus
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className={cn("px-3 mb-1", collapsed && "flex justify-center")}>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-accent-cyan/8 text-accent-cyan"
                      : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-cyan rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", collapsed && "mx-auto")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
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

        <div className="p-2 border-t border-glass-border">
          <div
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-bg transition-all cursor-pointer",
              collapsed && "justify-center"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-white">AD</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium text-text-primary truncate leading-tight">
                    Admin User
                  </p>
                  <p className="text-[10px] text-text-muted truncate leading-tight">admin@nexus.io</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full mt-1 flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-bg transition-all",
              collapsed ? "px-0" : "gap-2"
            )}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed left-0 top-0 h-screen w-[280px] glass border-r border-glass-border z-50 flex flex-col lg:hidden"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-bg-primary" />
            </div>
            <span className="font-semibold text-lg text-gradient-cyan font-[family-name:var(--font-outfit)]">
              Nexus
            </span>
          </div>
          <button
            onClick={() => setIsOpen?.(false)}
            className="p-1.5 rounded-lg hover:bg-glass-bg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="px-3 py-2">
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                  active
                    ? "bg-accent-cyan/8 text-accent-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass-bg"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-cyan rounded-full" />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-glass-border">
          <div className="flex items-center gap-3 p-2.5 rounded-lg text-text-secondary">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center">
              <span className="text-[10px] font-medium text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate leading-tight">Admin User</p>
              <p className="text-[10px] text-text-muted truncate leading-tight">admin@nexus.io</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
