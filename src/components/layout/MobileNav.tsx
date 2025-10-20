"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CreditCard, Package, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Contacts", href: "/contacts", icon: Users },
    { name: "Money", href: "/transactions", icon: CreditCard },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "More", href: "/more", icon: MoreHorizontal },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-white dark:border-gray-700 dark:bg-gray-900 lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500",
                isActive(item.href) && "text-blue-600 dark:text-blue-500"
              )}
            >
              <Icon className="mb-1 h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
