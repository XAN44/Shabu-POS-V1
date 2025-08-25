import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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

import { MenuItem } from "@/src/app/types/Order";
import Image from "next/image";
import { toast } from "sonner";

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => void;
  onEditMenuItem: (itemId: string, item: Partial<MenuItem>) => void;
  onDeleteMenuItem: (itemId: string) => void;
}

const categories = ["อาหารจาน", "ยำ", "เครื่องดื่ม", "ของหวาน"];

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    available: true,
    image: "",
    imageKey: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      available: true,
      image: "",
      imageKey: "",
    });
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setFormData((prev) => ({ ...prev, image: objectUrl }));
    } else {
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    let imageUrl = formData.image;
    let imageKey = formData.imageKey;

    // ตรวจสอบว่ามีไฟล์ที่ผู้ใช้เลือกมาหรือไม่
    if (file) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        // 1. ส่งไฟล์ไปยัง API Route ที่สร้างขึ้น (/api/upload)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image via API");
        }

        // 2. รับผลลัพธ์จาก API Route (secure_url และ public_id)
        const uploadResult = await response.json();
        imageUrl = uploadResult.data.secure_url;
        imageKey = uploadResult.data.public_id;
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error("ไม่สามารถอัปโหลดรูปภาพได้");
        return;
      }
    }

    // ส่งข้อมูลทั้งหมด รวมถึง imageUrl และ imageKey ไปบันทึกในฐานข้อมูล
    onAddMenuItem({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description || undefined,
      available: formData.available,
      image: imageUrl,
      imageKey: imageKey,
    });

    // รีเซ็ตฟอร์มและปิด dialog
    resetForm();
    setFile(null); // เคลียร์ State ไฟล์ที่เก็บไว้
    setShowAddDialog(false);
  };
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || "",
      available: item.available,
      image: item.image || "",
      imageKey: item.imageKey || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      onEditMenuItem(editingItem.id, {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description || undefined,
        available: formData.available,
        image: formData.image, // URL preview ชั่วคราว
        imageKey: formData.imageKey,
      });

      resetForm();
      setFile(null);
      setEditingItem(null);
      setShowEditDialog(false);
    }
  };

  const handleDelete = (itemId: string) => {
    setDeletingItemId(itemId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingItemId) {
      onDeleteMenuItem(deletingItemId);
      setDeletingItemId(null);
      setShowDeleteDialog(false);
    }
  };

  const toggleAvailability = (itemId: string, available: boolean) => {
    onEditMenuItem(itemId, { available });
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const menuStats = {
    total: menuItems.length,
    available: menuItems.filter((item) => item.available).length,
    unavailable: menuItems.filter((item) => !item.available).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{menuStats.total}</div>
            <div className="text-sm text-gray-600">เมนูทั้งหมด</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {menuStats.available}
            </div>
            <div className="text-sm text-gray-600">พร้อมขาย</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {menuStats.unavailable}
            </div>
            <div className="text-sm text-gray-600">หมด</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with filters and add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">จัดการเมนู</h2>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มเมนูใหม่
        </Button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              !item.available ? "opacity-60 grayscale" : ""
            }`}
          >
            {/* Image Section */}
            <div className="relative h-48 sm:h-56 w-full">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  ไม่มีภาพประกอบ
                </div>
              )}
              <Badge
                className={`absolute top-2 left-2 text-sm font-semibold z-10 ${
                  item.available ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {item.available ? "พร้อมขาย" : "หมด"}
              </Badge>
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-sm font-semibold z-10"
              >
                {item.category}
              </Badge>
            </div>

            {/* Content Section */}
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                <span className="text-2xl font-extrabold text-blue-600">
                  ฿{item.price.toLocaleString()}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t mt-4 -mx-4 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAvailability(item.id, !item.available)}
                  title={item.available ? "ซ่อนเมนู" : "แสดงเมนู"}
                >
                  {item.available ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-red-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                  title="แก้ไข"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  title="ลบ"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลเมนูใหม่</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {file && (
              <Image
                width={1033}
                height={1033}
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-96  object-fill rounded"
              />
            )}

            <div className="grid gap-2">
              <Label htmlFor="file">รูปเมนู (ไม่จำเป็น)</Label>
              <Input
                id=""
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <Label htmlFor="name">ชื่อเมนู</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น ผัดไทย"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">ราคา</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">คำอธิบาย (ไม่จำเป็น)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="รายละเอียดเมนู..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd}>เพิ่ม</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขเมนู</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลเมนู</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">ชื่อเมนู</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">ราคา</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">หมวดหมู่</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">คำอธิบาย</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบเมนู</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบเมนูนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              ลบเมนู
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
