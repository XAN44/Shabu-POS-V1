"use client";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  Table as TableIcon,
  Menu,
  Receipt,
  BarChart3,
} from "lucide-react";

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
    icon: UtensilsCrossed,
    description: "จัดการออเดอร์ใหม่และแจ้งเตือน",
  },
  {
    title: "จัดการโต๊ะ",
    url: "/dashboard/tables",
    icon: TableIcon,
    description: "จัดการสถานะโต๊ะ",
  },
  {
    title: "จัดการเมนู",
    url: "/dashboard/menu",
    icon: Menu,
    description: "เพิ่ม แก้ไข ลบเมนูอาหาร",
  },
  {
    title: "บิล/รายได้",
    url: "/dashboard/bills",
    icon: Receipt,
    description: "ดูบิลและสถิติรายได้",
  },
  {
    title: "รายงาน",
    url: "/dashboard/reports",
    icon: BarChart3,
    description: "รายงานและสถิติ",
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
                {[1, 2, 3, 4, 5].map((i) => (
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
          <SidebarGroupLabel className="font-bold text-xl text-gray-800 mb-6 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            🍲 ชาบู POS
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        h-12 rounded-xl transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-lg"
                            : "hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                        }
                      `}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3"
                        prefetch={true}
                      >
                        <div
                          className={`
                          p-1.5 rounded-lg transition-colors
                          ${
                            isActive
                              ? "bg-white/20"
                              : "bg-gray-100 group-hover:bg-gray-200"
                          }
                        `}
                        >
                          <item.icon
                            className={`h-4 w-4 ${
                              isActive ? "text-white" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {item.title}
                          </span>
                          <span
                            className={`text-xs ${
                              isActive ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
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
