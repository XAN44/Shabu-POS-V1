import React from "react";
import { Phone, X } from "lucide-react";
import { CallStaffForBillEvent } from "@/src/app/types/socket";

interface StaffCallNotificationsProps {
  staffCallRequests: Map<string, CallStaffForBillEvent>;
  soundPlayingTables: Set<string>;
  onRespondToCall: (tableId: string, request: CallStaffForBillEvent) => void;
  onDismissCall: (tableId: string) => void;
  onClearAll: () => void;
}

export const StaffCallNotifications: React.FC<StaffCallNotificationsProps> = ({
  staffCallRequests,
  soundPlayingTables,
  onRespondToCall,
  onDismissCall,
  onClearAll,
}) => {
  if (staffCallRequests.size === 0) return null;

  return (
    <div className="bg-gradient-to-br from-red-50 via-red-50 to-pink-50 border-2 border-red-200 rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs font-bold text-red-800">
                  {staffCallRequests.size}
                </span>
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold">
                โต๊ะที่เรียกพนักงานเช็คบิล
              </h3>
              <p className="text-sm text-red-100 opacity-90">
                {staffCallRequests.size} โต๊ะรอการตอบสนอง -
                การแจ้งเตือนจะอยู่จนกว่าจะตอบรับ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <span className="text-sm font-medium text-white">
                รอดำเนินการ
              </span>
            </div>

            <button
              onClick={onClearAll}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              aria-label="ปิดการแจ้งเตือนทั้งหมด"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from(staffCallRequests.values()).map((request) => (
            <div
              key={request.tableId}
              className={`group bg-white border-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                soundPlayingTables.has(request.tableId)
                  ? "border-red-300 ring-2 ring-red-200 animate-pulse bg-red-50"
                  : "border-red-100 hover:border-red-200"
              }`}
            >
              <div
                className={`px-4 py-3 ${
                  soundPlayingTables.has(request.tableId)
                    ? "bg-gradient-to-r from-red-600 to-red-700"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">
                    {request.tableName}
                  </h4>
                  <div className="flex items-center gap-2">
                    {soundPlayingTables.has(request.tableId) ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                        <span className="text-xs text-yellow-200 font-bold">
                          เล่นเสียง
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-xs text-orange-200 font-medium">
                          รอตอบรับ
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-red-100 bg-white/20 px-2 py-1 rounded-full">
                      {new Date(request.timestamp).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {request.orderCount}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      ออเดอร์
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      ฿{request.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-red-600 font-medium">
                      ยอดรวม
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onRespondToCall(request.tableId, request)}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      soundPlayingTables.has(request.tableId)
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white animate-pulse ring-2 ring-red-300"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    }`}
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">ตอบรับ & ไปที่โต๊ะ</span>
                    {soundPlayingTables.has(request.tableId) && (
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    )}
                  </button>

                  <button
                    onClick={() => onDismissCall(request.tableId)}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                    aria-label="ปิดการแจ้งเตือน"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
