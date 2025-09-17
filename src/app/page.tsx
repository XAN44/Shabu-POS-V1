import {
  ArrowRight,
  Bell,
  Coffee,
  Monitor,
  QrCode,
  Shield,
  ShoppingCart,
  Table,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import LogoutButton from "./components/logoutBtn";
import { currentUser } from "./lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function page() {
  const session = await currentUser();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "จัดการออเดอร์",
      description: "ติดตามและจัดการออเดอร์แบบเรียลไทม์ พร้อมการแจ้งเตือนทันที",
      color: "from-blue-500 to-blue-600",
      highlight: true,
    },
    {
      icon: <Table className="w-8 h-8" />,
      title: "จัดการโต๊ะ",
      description: "ควบคุมสถานะโต๊ะ การจอง และ QR Code สำหรับแต่ละโต๊ะ",
      color: "from-green-500 to-green-600",
      highlight: true,
    },
    {
      icon: <Coffee className="w-8 h-8" />,
      title: "จัดการเมนู",
      description: "เพิ่ม แก้ไข และจัดหมวดหมู่เมนูอาหาร พร้อมระบบคงคลัง",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "รายงานยอดขาย",
      description: "ดูสถิติการขายและรายได้แบบละเอียด พร้อมกราฟแสดงผล",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "เรียกพนักงาน",
      description: "ระบบเช็คเอาท์และเรียกพนักงาน พร้อมการแจ้งเตือนเสียง",
      color: "from-pink-500 to-pink-600",
      highlight: true,
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code สั่งอาหาร",
      description: "ลูกค้าสแกน QR Code บนโต๊ะเพื่อสั่งอาหารได้ทันที",
      color: "from-indigo-500 to-indigo-600",
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    ระบบจุดขาย (POS)
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Professional Restaurant Management System
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    ข้อมูลผู้ใช้งาน
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">
                      บทบาท
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-gray-800">
                        {session?.role}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 font-medium">
                      อีเมล
                    </div>
                    <div className="font-medium text-gray-800">
                      {session?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Features Section */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                ฟีเจอร์เด่นของระบบ
              </h2>

              {/* Real-time Features Highlight */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      การแจ้งเตือนแบบเรียลไทม์ (Real-time)
                    </h3>
                    <p className="text-blue-100">
                      ใช้เทคโนโลยี Socket.IO สำหรับการสื่อสารทันที
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">ออเดอร์เข้าใหม่</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      เมื่อลูกค้าสั่งอาหาร ระบบจะส่งเสียงแจ้งเตือนไปที่ POS
                      Dashboard ทันที
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">เรียกพนักงาน</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      เมื่อลูกค้ากดเช็คเอาท์
                      พนักงานจะได้รับแจ้งเตือนเสียงพร้อมหมายเลขโต๊ะ
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                      feature.highlight
                        ? "ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white`}
                      >
                        {feature.icon}
                      </div>
                      {feature.highlight && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <Zap className="w-3 h-3" />
                          เรียลไทม์
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                เริ่มต้นใช้งาน
              </h2>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      เข้าสู่ระบบจัดการร้าน
                    </h3>
                    <p className="text-blue-100 mb-4">
                      จัดการออเดอร์ โต๊ะ เมนู และดูรายงานการขาย
                    </p>
                    <Link href={`${baseUrl}/dashboard/orders`}>
                      <Button className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                        <Monitor className="w-5 h-5" />
                        เข้าสู่ระบบจัดการ
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Monitor className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Access Info */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  การเข้าถึงสำหรับลูกค้า
                </h3>
                <p className="text-gray-600">
                  ลูกค้าสแกน QR Code บนโต๊ะเพื่อสั่งอาหาร
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">
                      ลูกค้าสแกน QR Code
                    </h4>
                    <p className="text-green-600 text-sm">บนโต๊ะอาหารในร้าน</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">
                      เข้าสู่หน้าเมนู
                    </h4>
                    <p className="text-blue-600 text-sm">
                      ดูเมนูและสั่งอาหารออนไลน์
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-2">
                  ตัวอย่าง URL สำหรับลูกค้า:
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-700 break-all">
                  {baseUrl}/menu?table=
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  สถานะระบบ
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-green-800 font-medium">ระบบ POS</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-sm font-semibold">
                        ออนไลน์
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-blue-800 font-medium">
                      เมนูลูกค้า
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-600 text-sm font-semibold">
                        พร้อมใช้งาน
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
