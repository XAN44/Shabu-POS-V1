"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Package,
  DollarSign,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MenuAddon } from "@/src/app/types/Order";

interface AddonManagerProps {
  menuItemId: string;
  menuItemName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddonManager: React.FC<AddonManagerProps> = ({
  menuItemId,
  menuItemName,
  isOpen,
  onClose,
}) => {
  const [addons, setAddons] = useState<MenuAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null);
  const [deletingAddonId, setDeletingAddonId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    available: true,
  });

  // โหลดรายการ add-ons
  const fetchAddons = async () => {
    if (!menuItemId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/menu/${menuItemId}/addons`);
      if (!response.ok) throw new Error("Failed to fetch addons");

      const data = await response.json();
      setAddons(data);
    } catch (error) {
      console.error("Error fetching addons:", error);
      toast.error("ไม่สามารถโหลดตัวเลือกเสริมได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && menuItemId) {
      fetchAddons();
    }
  }, [isOpen, menuItemId]);

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      available: true,
    });
  };

  // เพิ่ม add-on
  const handleAdd = async () => {
    if (!formData.name || !formData.price) {
      toast.error("กรุณากรอกชื่อและราคา");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/menu/${menuItemId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category || null,
          description: formData.description || null,
          available: formData.available,
        }),
      });

      if (!response.ok) throw new Error("Failed to add addon");

      const newAddon = await response.json();
      setAddons([...addons, newAddon]);
      resetForm();
      setShowAddDialog(false);
      toast.success("เพิ่มตัวเลือกเสริมสำเร็จ");
    } catch (error) {
      console.error("Error adding addon:", error);
      toast.error("ไม่สามารถเพิ่มตัวเลือกเสริมได้");
    } finally {
      setLoading(false);
    }
  };

  // แก้ไข add-on
  const handleEdit = (addon: MenuAddon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name,
      price: addon.price.toString(),
      category: addon.category || "",
      description: addon.description || "",
      available: addon.available,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAddon) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/menu/${menuItemId}/addons/${editingAddon.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category || null,
            description: formData.description || null,
            available: formData.available,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update addon");

      const updatedAddon = await response.json();
      setAddons(
        addons.map((addon) =>
          addon.id === editingAddon.id ? updatedAddon : addon
        )
      );
      resetForm();
      setEditingAddon(null);
      setShowEditDialog(false);
      toast.success("แก้ไขตัวเลือกเสริมสำเร็จ");
    } catch (error) {
      console.error("Error updating addon:", error);
      toast.error("ไม่สามารถแก้ไขตัวเลือกเสริมได้");
    } finally {
      setLoading(false);
    }
  };

  // ลบ add-on
  const handleDelete = (addonId: string) => {
    setDeletingAddonId(addonId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingAddonId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/menu/${menuItemId}/addons/${deletingAddonId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete addon");

      setAddons(addons.filter((addon) => addon.id !== deletingAddonId));
      setDeletingAddonId(null);
      setShowDeleteDialog(false);
      toast.success("ลบตัวเลือกเสริมสำเร็จ");
    } catch (error) {
      console.error("Error deleting addon:", error);
      toast.error("ไม่สามารถลบตัวเลือกเสริมได้");
    } finally {
      setLoading(false);
    }
  };

  // เปลี่ยนสถานะพร้อมขาย
  const toggleAvailability = async (addonId: string, available: boolean) => {
    try {
      const response = await fetch(
        `/api/menu/${menuItemId}/addons/${addonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available }),
        }
      );

      if (!response.ok) throw new Error("Failed to update addon");

      const updatedAddon = await response.json();
      setAddons(
        addons.map((addon) => (addon.id === addonId ? updatedAddon : addon))
      );
      toast.success(`${available ? "เปิด" : "ปิด"}ขายตัวเลือกเสริมแล้ว`);
    } catch (error) {
      console.error("Error toggling addon availability:", error);
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 opacity-50 rounded-3xl"></div>

        <div className="relative flex flex-col h-full">
          <DialogHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  จัดการตัวเลือกเสริม
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  เมนู: {menuItemName}
                </DialogDescription>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold">
                  {addons.length} รายการ
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold">
                  {addons.filter((a) => a.available).length} พร้อมขาย
                </div>
              </div>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มตัวเลือกเสริม
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : addons.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  ยังไม่มีตัวเลือกเสริม
                </h3>
                <p className="text-gray-500 mb-6">
                  เริ่มเพิ่มตัวเลือกเสริมสำหรับเมนูนี้
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  เพิ่มตัวเลือกเสริม
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                  <Card
                    key={addon.id}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-xl rounded-2xl border ${
                      addon.available
                        ? "border-emerald-200/50"
                        : "border-gray-200/50"
                    } shadow-lg ${!addon.available ? "opacity-70" : ""}`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        addon.available
                          ? "bg-gradient-to-r from-emerald-500 to-green-500"
                          : "bg-gradient-to-r from-gray-400 to-slate-400"
                      } rounded-t-2xl`}
                    ></div>

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-800 mb-2">
                            {addon.name}
                          </CardTitle>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                            +฿{addon.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge
                          className={`${
                            addon.available
                              ? "bg-gradient-to-r from-emerald-500 to-green-600"
                              : "bg-gradient-to-r from-red-500 to-pink-600"
                          } text-white font-bold px-3 py-1 rounded-xl border-0`}
                        >
                          {addon.available ? "พร้อมขาย" : "หมด"}
                        </Badge>
                        {addon.category && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-3 py-1 rounded-xl border-0">
                            {addon.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {addon.description && (
                        <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50/50 rounded-xl">
                          {addon.description}
                        </p>
                      )}

                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleAvailability(addon.id, !addon.available)
                          }
                          className={`rounded-xl transition-all duration-300 hover:scale-110 ${
                            addon.available
                              ? "hover:bg-green-100 text-green-600"
                              : "hover:bg-red-100 text-red-600"
                          }`}
                        >
                          {addon.available ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(addon)}
                          className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-blue-100 text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(addon.id)}
                          className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-6">
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-2xl px-6 py-3"
            >
              ปิด
            </Button>
          </DialogFooter>
        </div>

        {/* Add Addon Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                เพิ่มตัวเลือกเสริม
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="addon-name">ชื่อตัวเลือกเสริม</Label>
                <Input
                  id="addon-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="เช่น เพิ่มเนื้อ, เพิ่มผัก"
                  className="rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addon-price">ราคาเพิ่ม</Label>
                  <Input
                    id="addon-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="addon-description">คำอธิบาย (ไม่จำเป็น)</Label>
                <Textarea
                  id="addon-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="rounded-2xl resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="rounded-2xl"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!formData.name || !formData.price || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
              >
                {loading ? "กำลังเพิ่ม..." : "เพิ่ม"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Addon Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                แก้ไขตัวเลือกเสริม
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-addon-name">ชื่อตัวเลือกเสริม</Label>
                <Input
                  id="edit-addon-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-addon-price">ราคาเพิ่ม</Label>
                  <Input
                    id="edit-addon-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-addon-category">หมวดหมู่</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-addon-description">คำอธิบาย</Label>
                <Textarea
                  id="edit-addon-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-2xl resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="rounded-2xl"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-700">
                ยืนยันการลบ
              </DialogTitle>
              <DialogDescription>
                คุณแน่ใจหรือไม่ที่จะลบตัวเลือกเสริมนี้?
                การดำเนินการนี้ไม่สามารถยกเลิกได้
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-2xl"
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
              >
                {loading ? "กำลังลบ..." : "ลบ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
