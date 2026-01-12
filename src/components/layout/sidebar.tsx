"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Search,
  GitCompare,
  FileText,
  LayoutDashboard,
  History,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "診断",
    href: "/dashboard/diagnosis",
    icon: ClipboardList,
  },
  {
    name: "検索・推薦",
    href: "/dashboard/search",
    icon: Search,
  },
  {
    name: "比較",
    href: "/dashboard/compare",
    icon: GitCompare,
  },
  {
    name: "稟議書",
    href: "/dashboard/proposal",
    icon: FileText,
  },
  {
    name: "履歴",
    href: "/dashboard/history",
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
          <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-primary to-primary/60 opacity-0 blur-sm transition-opacity group-hover:opacity-30" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-tight">DX Selecta</span>
          <span className="text-[10px] font-medium text-muted-foreground">SaaS選定支援</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            メニュー
          </span>
        </div>
        <ul className="space-y-0.5">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <li key={item.name} style={{ animationDelay: `${index * 50}ms` }}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/8 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground/70 group-hover:text-foreground"
                  )} />
                  <span>{item.name}</span>
                  {/* Subtle arrow on hover */}
                  <svg 
                    className={cn(
                      "ml-auto h-4 w-4 opacity-0 transition-all duration-200",
                      isActive ? "opacity-40" : "group-hover:opacity-40 group-hover:translate-x-0.5"
                    )}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-gradient-to-br from-accent to-accent/50 p-3">
          <p className="text-[11px] font-medium text-foreground/80">
            選定を効率化
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            診断から稟議まで一気通貫
          </p>
        </div>
      </div>
    </aside>
  );
}
