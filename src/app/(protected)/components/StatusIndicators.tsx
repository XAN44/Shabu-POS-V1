import React from "react";
import { CheckCircle } from "lucide-react";

interface StaffCallIndicatorProps {
  staffCallPending: boolean;
}

export function StaffCallIndicator({
  staffCallPending,
}: StaffCallIndicatorProps) {
  if (!staffCallPending) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-3xl p-8 flex items-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 pointer-events-none"></div>
      <div className="relative z-10 flex items-center w-full">
        <div className="bg-white/25 p-4 rounded-full mr-6 shadow-lg">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">กำลังเรียกพนักงาน...</h3>
          <p className="opacity-90 text-lg">
            สัญญาณถูกส่งแล้ว กำลังรอการตอบกลับ
          </p>
        </div>
      </div>
    </div>
  );
}

interface SuccessIndicatorProps {
  submittedOrder: boolean;
}

export function SuccessIndicator({ submittedOrder }: SuccessIndicatorProps) {
  if (!submittedOrder) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-3xl p-8 flex items-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-teal-400/20 pointer-events-none"></div>
      <div className="relative z-10 flex items-center w-full">
        <div className="bg-white/25 p-4 rounded-full mr-6 shadow-lg">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">สั่งอาหารสำเร็จ!</h3>
          <p className="opacity-90 text-lg">
            ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว กรุณารอสักครู่
          </p>
        </div>
      </div>
    </div>
  );
}
