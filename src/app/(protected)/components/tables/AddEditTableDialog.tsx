import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: { number: string; seats: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ number: string; seats: string }>
  >;
  onSubmit: () => void;
  title: string;
  description: string;
}

export const AddEditTableDialog: React.FC<AddEditDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  title,
  description,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="number">หมายเลขโต๊ะ</Label>
            <Input
              id="number"
              type="number"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seats">จำนวนที่นั่ง</Label>
            <Input
              id="seats"
              type="number"
              value={formData.seats}
              onChange={(e) =>
                setFormData({ ...formData, seats: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit}>บันทึก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
