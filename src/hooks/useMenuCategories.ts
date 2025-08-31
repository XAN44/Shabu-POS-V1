import { useState, useEffect } from "react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  createdAt: string;
};

export function useMenuCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const categoriesData: Category[] = await response.json();
        // ✅ แปลงเป็น string[] ของ name
        setCategories(categoriesData.map((c) => c.name));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
  };
}
