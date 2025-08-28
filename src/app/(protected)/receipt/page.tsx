"use client";
import React, { Suspense } from "react";
import ReceiptPage from "./ReceiptContent/ReceiptContent";

function page() {
  return (
    <Suspense>
      <ReceiptPage />
    </Suspense>
  );
}

export default page;
