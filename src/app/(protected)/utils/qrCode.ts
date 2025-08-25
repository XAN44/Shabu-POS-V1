import QRCode from "qrcode-generator";

export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  const qr = QRCode(0, "L"); // 0 = auto type, L = error correction
  qr.addData(text);
  qr.make();
  return qr.createDataURL(4); // 4 = module size
};

export const generateTableQRURL = (tableId: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/menu?table=${tableId}`;
};
