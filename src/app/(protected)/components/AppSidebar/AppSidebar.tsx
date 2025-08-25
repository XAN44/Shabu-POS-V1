"use client";
import { usePathname } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import Link from "next/link";

const items = [
  {
    title: "ออเดอร์",
    url: "/dashboard/orders",
    isCollapsible: true,
    icon: UtensilsCrossed,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Sidebar className="border-r border-gray-200">
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupLabel className="font-bold text-lg text-gray-800 mb-4">
              🍲 ชาบู POS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="animate-pulse space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-11 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-gray-200 shadow-sm">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-lg text-gray-800 mb-6 px-4 py-2 border-b border-gray-100">
            🍲 ชาบู POS
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                              h-11 rounded-lg transition-all duration-200 
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                                  : "hover:bg-gray-50 hover:text-gray-900"
                              }
                            `}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3"
                        prefetch={true}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {/* <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                      {item.subItems?.map((sub) => {
                        const subActive = pathname === sub.url;
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <Link
                              href={sub.url}
                              className={`
                                      flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                      ${
                                        subActive
                                          ? "text-blue-600 font-semibold bg-blue-50"
                                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                      }
                                    `}
                              prefetch={true}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              <span>{sub.title}</span>
                              {sub.badge === "live" && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </Link>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub> */}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
