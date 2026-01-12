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
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="text-sm font-semibold">DX</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">DX Selecta</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive && "text-primary"
                  )} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          SaaS選定支援ツール
        </p>
      </div>
    </aside>
  );
}
