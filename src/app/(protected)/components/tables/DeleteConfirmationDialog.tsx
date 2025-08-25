import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบโต๊ะ</DialogTitle>
          <DialogDescription>
            คุณแน่ใจหรือไม่ที่จะลบโต๊ะนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้ และ
            QR Code จะไม่สามารถใช้งานได้อีก
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            ลบโต๊ะ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
