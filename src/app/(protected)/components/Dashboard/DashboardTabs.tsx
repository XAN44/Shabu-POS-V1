import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShoppingCart, Table as TableIcon, Menu, Receipt } from "lucide-react";
import { TableManagement } from "../tables/TableManagement";
import { MenuManagement } from "../menu/MenuManagement";
import { BillOverview } from "../bills/BillOverview";
import { OrdersOverview } from "../Order/OrderOverView";
import { MenuItem, Order } from "@/src/app/types/Order";

interface DashboardTabsProps {
  orders: Order[];
  menuItems: MenuItem[];
  onOrderStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onAddMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  onEditMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>;
  onDeleteMenuItem: (itemId: string) => Promise<void>;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  orders,
  menuItems,
  onOrderStatusChange,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      <Tabs defaultValue="all-orders" className="w-full">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <ScrollArea className="w-full">
            <TabsList className="flex gap-2 bg-transparent">
              <TabsTrigger
                value="all-orders"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:border-green-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="font-medium">ออเดอร์ทั้งหมด</span>
              </TabsTrigger>

              <TabsTrigger
                value="tables"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
              >
                <TableIcon className="w-4 h-4" />
                <span className="font-medium">จัดการโต๊ะ</span>
              </TabsTrigger>

              <TabsTrigger
                value="menu"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
              >
                <Menu className="w-4 h-4" />
                <span className="font-medium">จัดการเมนู</span>
              </TabsTrigger>

              <TabsTrigger
                value="bills"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:border-red-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
              >
                <Receipt className="w-4 h-4" />
                <span className="font-medium">บิล/รายได้</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="p-4 sm:p-6">
          <TabsContent value="all-orders" className="mt-0">
            <OrdersOverview
              orders={orders}
              onOrderStatusChange={onOrderStatusChange}
              title="ออเดอร์ทั้งหมด"
              showTimeAgo={false}
            />
          </TabsContent>

          <TabsContent value="tables" className="mt-0">
            <TableManagement />
          </TabsContent>

          <TabsContent value="menu" className="mt-0">
            <MenuManagement
              menuItems={menuItems}
              onAddMenuItem={onAddMenuItem}
              onEditMenuItem={onEditMenuItem}
              onDeleteMenuItem={onDeleteMenuItem}
            />
          </TabsContent>

          <TabsContent value="bills" className="mt-0">
            <BillOverview />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
