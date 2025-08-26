import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, X, CheckCircle } from "lucide-react";
import { CartItem } from "../../types/menu";

interface ShoppingCartProps {
  cart: CartItem[];
  loading: boolean;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: () => void;
}

export const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  cart,
  loading,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
}) => {
  if (cart.length === 0) return null;

  const getTotalAmount = () =>
    cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="sticky bottom-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          ตะกร้าของคุณ
          <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-sm">
            {cart.length} รายการ
          </span>
        </h2>
      </div>

      <div className="p-4">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cart.map((item, index) => (
            <CartItemRow
              key={index}
              item={item}
              index={index}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-gray-800">
              รวมทั้งหมด:
            </span>
            <span className="text-2xl font-bold text-orange-600">
              ฿{getTotalAmount().toLocaleString()}
            </span>
          </div>

          <Button
            onClick={onSubmitOrder}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังส่งคำสั่งซื้อ...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ยืนยันการสั่งอาหาร
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CartItemRowProps {
  item: CartItem;
  index: number;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  index,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.menuItem.name}</h4>
        <p className="text-sm text-gray-500">
          ฿{item.menuItem.price.toLocaleString()} × {item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <span className="w-8 text-center font-semibold text-gray-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <span className="w-20 text-right font-bold text-orange-600">
          ฿{item.subtotal.toLocaleString()}
        </span>
        <button
          onClick={() => onRemoveItem(index)}
          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
