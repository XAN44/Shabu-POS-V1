import React from "react";
import { currentUser } from "./lib/auth";
import LogoutButton from "./components/logoutBtn";

export default async function Page() {
  const user = await currentUser();

  return (
    <div className="p-6">
      <div className="space-y-1">
        <div>
          <strong>Role:</strong> {user?.role}
        </div>
        <div>
          <strong>Email:</strong> {user?.email}
        </div>
        <div>
          <strong>Name:</strong> {user?.name}
        </div>
      </div>

      {/* ปุ่มออกจากระบบ */}
      <LogoutButton />
    </div>
  );
}
