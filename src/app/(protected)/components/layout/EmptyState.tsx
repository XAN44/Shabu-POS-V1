import React from "react";
import { ImageIcon } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/30 max-w-md mx-auto">
        <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ImageIcon className="w-14 h-14 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">
          ไม่พบเมนูในหมวดหมู่นี้
        </h3>
        <p className="text-gray-500 text-lg">ลองเลือกหมวดหมู่อื่นดูครับ</p>
      </div>
    </div>
  );
}
