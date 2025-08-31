import { useState, useCallback, useMemo } from "react";
import { Order, BillSummary } from "../app/types/menu";

interface UseBillManagementProps {
  myOrders: Order[];
  orderStatuses: Record<string, Order["status"]>;
}

export function useBillManagement({
  myOrders,
  orderStatuses,
}: UseBillManagementProps) {
  const [showBillModal, setShowBillModal] = useState(false);
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    totalAmount: number;
    orderCount: number;
    tableNumber: string;
    numberTable: string;
  } | null>(null);

  const prepareBillSummary = useCallback((): BillSummary | null => {
    const servedOrders = myOrders.filter(
      (order) => (orderStatuses[order.id] || order.status) === "served"
    );

    if (servedOrders.length === 0) return null;

    const totalAmount = servedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalItemsCount = servedOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      orders: servedOrders,
      totalAmount,
      itemsCount: totalItemsCount,
    };
  }, [myOrders, orderStatuses]);

  const handleShowBill = useCallback(() => {
    const summary = prepareBillSummary();
    if (summary) {
      setBillSummary(summary);
      setShowBillModal(true);
    }
  }, [prepareBillSummary]);

  const handlePreviewBill = useCallback(() => {
    const summary = prepareBillSummary();
    if (summary) {
      setBillSummary(summary);
      setShowBillModal(true);
    }
  }, [prepareBillSummary]);

  const handleCloseCheckoutDialog = useCallback((isCheckingOut: boolean) => {
    if (isCheckingOut) return; // Prevent closing while processing
    setShowCheckoutDialog(false);
    setCheckoutData(null);
  }, []);

  const hasServedOrders = useMemo(() => {
    return myOrders.some(
      (order) => (orderStatuses[order.id] || order.status) === "served"
    );
  }, [myOrders, orderStatuses]);

  const activeOrders = useMemo(
    () =>
      myOrders.filter((o) => (orderStatuses[o.id] || o.status) !== "served"),
    [myOrders, orderStatuses]
  );

  const servedOrders = useMemo(
    () =>
      myOrders.filter((o) => (orderStatuses[o.id] || o.status) === "served"),
    [myOrders, orderStatuses]
  );

  return {
    showBillModal,
    setShowBillModal,
    billSummary,
    setBillSummary,
    showCheckoutDialog,
    setShowCheckoutDialog,
    checkoutData,
    setCheckoutData,
    prepareBillSummary,
    handleShowBill,
    handlePreviewBill,
    handleCloseCheckoutDialog,
    hasServedOrders,
    activeOrders,
    servedOrders,
  };
}
