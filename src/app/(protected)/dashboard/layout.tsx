"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar/AppSidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="border-b bg-white p-4">
            <SidebarTrigger />
          </div>
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
