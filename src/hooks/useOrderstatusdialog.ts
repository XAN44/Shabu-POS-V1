import { useState, useCallback } from "react";

export const useOrderStatusDialog = () => {
  const [showOrderStatusDialog, setShowOrderStatusDialog] = useState(false);

  const openOrderStatusDialog = useCallback(() => {
    setShowOrderStatusDialog(true);
  }, []);

  const closeOrderStatusDialog = useCallback(() => {
    setShowOrderStatusDialog(false);
  }, []);

  const toggleOrderStatusDialog = useCallback(() => {
    setShowOrderStatusDialog((prev) => !prev);
  }, []);

  return {
    showOrderStatusDialog,
    openOrderStatusDialog,
    closeOrderStatusDialog,
    toggleOrderStatusDialog,
  };
};
