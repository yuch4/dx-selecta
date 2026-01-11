"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Search,
  GitCompare,
  FileText,
  LayoutDashboard,
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
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🎯</span>
          <span>DX Selecta</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
