"use client";

import { useState } from "react";
import RegisterForm from "./registerCompo";
import LoginCompo from "./loginCompo";

function FormAuthen() {
  const [showRegister, setShowRegister] = useState(false);
  const handleShowRegister = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-3">
      {showRegister ? (
        <>
          <RegisterForm />
          <span className="underline ml-1" onClick={handleShowRegister}>
            เข้าสู่ระบบ
          </span>
        </>
      ) : (
        <>
          <LoginCompo />
          <p>
            ถ้ายังไม่มีบัญชี ?
            <span className="underline ml-1" onClick={handleShowRegister}>
              สมัครสมาชิก
            </span>
          </p>
        </>
      )}
    </div>
  );
}

export default FormAuthen;
