"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenTextIcon, ClockCountdownIcon, NotebookIcon, ChartBarIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app/practice", label: "演習", icon: BookOpenTextIcon },
  { href: "/app/mock", label: "模試", icon: ClockCountdownIcon },
  { href: "/app/notebook", label: "復習ノート", icon: NotebookIcon },
  { href: "/app/dashboard", label: "スコア", icon: ChartBarIcon },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm sm:px-3",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
