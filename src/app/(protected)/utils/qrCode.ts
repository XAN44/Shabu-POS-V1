// utils/qrCode.ts
import QRCode from "qrcode";

export const generateQRCodeDataURL = (text: string): Promise<string> => {
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 2,
  });
};

export const generateTableQRURL = (tableId: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/menu?table=${tableId}`;
};
