"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="
        mt-4 inline-flex items-center gap-2
        px-4 py-2 rounded-lg
        bg-red-500 text-white
        hover:bg-red-600
        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
        transition-colors
      "
    >
      <LogOut className="w-4 h-4" />
      ออกจากระบบ
    </button>
  );
}
