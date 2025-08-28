// MenuManagement.tsx - Updated with Category Management
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Sparkles,
  ChefHat,
  FolderPlus,
  Tags,
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

import { MenuItem } from "@/src/app/types/Order";
import Image from "next/image";
import { toast } from "sonner";
import { Category } from "@prisma/client";

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => void;
  onEditMenuItem: (itemId: string, item: Partial<MenuItem>) => void;
  onDeleteMenuItem: (itemId: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    available: true,
    image: "",
    imageKey: "",
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  };
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("กรุณาระบุชื่อหมวดหมู่");
      return;
    }

    // Check if category already exists
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      toast.error("หมวดหมู่นี้มีอยู่แล้ว");
      return;
    }

    setIsAddingCategory(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        setNewCategoryName("");
        setShowAddCategoryDialog(false);
        toast.success(`เพิ่มหมวดหมู่ "${newCategory.name}" สำเร็จ`);
      } else {
        throw new Error("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("ไม่สามารถเพิ่มหมวดหมู่ได้");
    } finally {
      setIsAddingCategory(false);
      setIsLoading(false);
    }
  };

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

    //
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
    setFile(null);
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
    if (!editingItem) return;

    setIsLoading(true); // <-- เริ่มโหลด

    let imageUrl = formData.image;
    let imageKey = formData.imageKey;

    if (file) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) throw new Error("Failed to upload image via API");

        const uploadResult = await response.json();
        imageUrl = uploadResult.data.secure_url;
        imageKey = uploadResult.data.public_id;
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error("ไม่สามารถอัปโหลดรูปภาพได้");
        setIsLoading(false);
        return;
      }
    }

    try {
      await onEditMenuItem(editingItem.id, {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description || undefined,
        available: formData.available,
        image: imageUrl,
        imageKey: imageKey,
      });

      resetForm();
      setFile(null);
      setEditingItem(null);
      setShowEditDialog(false);
      toast.success("บันทึกเมนูสำเร็จ");
    } catch (error) {
      console.error("Failed to save edit:", error);
      toast.error("ไม่สามารถบันทึกได้");
    } finally {
      setIsLoading(false); // <-- จบโหลด
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
    <div className="space-y-8">
      {/* Premium Summary Cards */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-90 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-3xl"></div>

        <div className="relative p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  จัดการเมนูอาหาร
                </h2>
                <p className="text-blue-100 text-lg font-medium">
                  ระบบจัดการเมนูและหมวดหมู่แบบเรียลไทม์
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Menu Items */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {menuStats.total}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  เมนูทั้งหมด
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </div>
            </div>

            {/* Available Items */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  {menuStats.available > 0 && (
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-emerald-700 to-green-700 bg-clip-text text-transparent mb-2">
                  {menuStats.available}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  พร้อมขาย
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Unavailable Items */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <EyeOff className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-red-700 to-pink-700 bg-clip-text text-transparent mb-2">
                  {menuStats.unavailable}
                </div>
                <div className="text-sm text-gray-600 font-semibold">หมด</div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              </div>
            </div>

            {/* Total Categories */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Tags className="w-7 h-7 text-white" />
                  </div>
                  <FolderPlus className="w-5 h-5 text-purple-500 animate-pulse" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-purple-700 to-violet-700 bg-clip-text text-transparent mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  หมวดหมู่
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header with filters and add buttons */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 opacity-70 rounded-3xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-orange-200/50 shadow-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-800 to-amber-800 bg-clip-text text-transparent">
                  รายการเมนู
                </h3>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-64 bg-white/80 backdrop-blur-sm border-orange-200 rounded-2xl shadow-lg">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-orange-200 rounded-2xl">
                  <SelectItem value="all" className="rounded-xl">
                    หมวดหมู่ทั้งหมด
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.name}
                      className="rounded-xl"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowAddCategoryDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <FolderPlus className="w-5 h-5 mr-2" />
                เพิ่มหมวดหมู่
              </Button>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มเมนูใหม่
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative group">
            {/* Animated background */}
            <div
              className={`absolute inset-0 ${
                item.available
                  ? "bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100"
                  : "bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100"
              } opacity-70 rounded-3xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-105`}
            ></div>

            <Card
              className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/90 backdrop-blur-xl rounded-3xl border ${
                item.available ? "border-emerald-200/50" : "border-gray-200/50"
              } shadow-xl ${!item.available ? "opacity-70" : ""}`}
            >
              {/* Premium status indicator */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  item.available
                    ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"
                    : "bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400"
                } rounded-t-3xl`}
              ></div>

              {/* Image Section with premium overlay */}
              <div className="relative h-56 w-full overflow-hidden">
                {item.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 flex flex-col items-center justify-center">
                    <ChefHat className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm font-medium">
                      ไม่มีภาพประกอบ
                    </span>
                  </div>
                )}

                {/* Premium badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <Badge
                    className={`${
                      item.available
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg animate-pulse"
                        : "bg-gradient-to-r from-red-500 to-pink-600 shadow-lg"
                    } text-white font-bold px-3 py-1.5 rounded-xl border-0`}
                  >
                    {item.available ? "พร้อมขาย" : "หมด"}
                  </Badge>

                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl border-0 shadow-lg">
                    {item.category}
                  </Badge>
                </div>

                {/* Sparkles for available items */}
                {item.available && (
                  <div className="absolute bottom-4 right-4">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Premium Content Section */}
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                      {item.name}
                    </CardTitle>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                      ฿{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {item.description && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl opacity-50"></div>
                    <p className="relative text-sm text-gray-600 line-clamp-2 p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Premium Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAvailability(item.id, !item.available)}
                    className={`rounded-xl transition-all duration-300 hover:scale-110 ${
                      item.available
                        ? "hover:bg-green-100 text-green-600"
                        : "hover:bg-red-100 text-red-600"
                    }`}
                    title={item.available ? "ซ่อนเมนู" : "แสดงเมนู"}
                  >
                    {item.available ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-blue-100 text-blue-600"
                    title="แก้ไข"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-red-100 text-red-600"
                    title="ลบ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 opacity-60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <ChefHat className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
              ไม่มีเมนูในหมวดหมู่นี้
            </h3>
            <p className="text-lg text-gray-500 font-medium">
              เริ่มต้นเพิ่มเมนูอร่อยๆ กันเลย
            </p>
          </div>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
      >
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 opacity-50 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FolderPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    เพิ่มหมวดหมู่ใหม่
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-medium">
                    สร้างหมวดหมู่ใหม่สำหรับจัดกลุ่มเมนู
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="category-name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    ชื่อหมวดหมู่
                  </Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="เช่น อาหารจานหลัก, เครื่องดื่ม, ของหวาน"
                    className="bg-white/80 backdrop-blur-sm border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20"
                    onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                </div>

                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      หมวดหมู่ที่มีอยู่แล้ว
                    </Label>
                    <div className="max-h-32 overflow-y-auto bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Badge
                            key={category.id}
                            className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200 rounded-xl px-3 py-1"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCategoryDialog(false);
                  setNewCategoryName("");
                }}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={
                  !newCategoryName.trim() || isAddingCategory || isLoading
                }
                className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCategory ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    เพิ่มหมวดหมู่
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    เพิ่มเมนูใหม่
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-medium">
                    กรอกข้อมูลเมนูใหม่ที่ต้องการเพิ่ม
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 py-6">
              {file && (
                <div className="relative">
                  <Image
                    width={400}
                    height={300}
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-72 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="file"
                    className="text-sm font-semibold text-gray-700"
                  >
                    รูปเมนู (ไม่จำเป็น)
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null)
                    }
                    className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    ชื่อเมนู
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="เช่น ผัดไทย"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-semibold text-gray-700"
                    >
                      ราคา
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-semibold text-gray-700"
                    >
                      หมวดหมู่
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200 rounded-2xl">
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.name}
                              className="rounded-xl"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAddCategoryDialog(true)}
                        className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-purple-200 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                        title="เพิ่มหมวดหมู่ใหม่"
                      >
                        <FolderPlus className="w-4 h-4 text-purple-600" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    คำอธิบาย (ไม่จำเป็น)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="รายละเอียดเมนู..."
                    rows={3}
                    className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!formData.category || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                เพิ่มเมนู
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Edit Menu Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 opacity-50 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    แก้ไขเมนู
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-medium">
                    แก้ไขข้อมูลเมนูที่เลือก
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 py-6">
              {/* Preview รูปถ้ามี */}
              {file ? (
                <div className="relative">
                  <Image
                    width={400}
                    height={300}
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-72 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                </div>
              ) : formData.image ? (
                <div className="relative">
                  <Image
                    width={400}
                    height={300}
                    src={formData.image}
                    alt={formData.name}
                    className="w-full h-72 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                </div>
              ) : null}

              {/* Input สำหรับเลือกรูปใหม่ */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-file"
                  className="text-sm font-semibold text-gray-700"
                >
                  รูปเมนู (ไม่จำเป็น)
                </Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                  className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* ฟอร์มแก้ไขชื่อ ราคา หมวดหมู่ คำอธิบาย */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    ชื่อเมนู
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-price"
                      className="text-sm font-semibold text-gray-700"
                    >
                      ราคา
                    </Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-category"
                      className="text-sm font-semibold text-gray-700"
                    >
                      หมวดหมู่
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200 rounded-2xl">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.name}
                            className="rounded-xl"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    คำอธิบาย
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                ยกเลิก
              </Button>
              <Button
                disabled={isLoading}
                onClick={handleSaveEdit}
                className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                {isLoading ? "กำลังบันทึก" : "บันทึกเ"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-50 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-700 bg-clip-text text-transparent">
                    ยืนยันการลบเมนู
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-medium">
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6">
              <div className="p-6 bg-red-50/50 backdrop-blur-sm rounded-2xl border border-red-100">
                <p className="text-gray-700">
                  คุณแน่ใจหรือไม่ที่จะลบเมนูนี้? เมนูที่ถูกลบจะหายไปอย่างถาวร
                </p>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                ลบเมนูอย่างถาวร
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
