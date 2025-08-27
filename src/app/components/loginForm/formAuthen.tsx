"use client";

import { useState } from "react";
import RegisterForm from "./registerCompo";
import LoginCompo from "./loginCompo";

function FormAuthen() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-3">
      <LoginCompo />
    </div>
  );
}

export default FormAuthen;
