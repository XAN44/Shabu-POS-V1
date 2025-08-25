// utils/qrCode.ts
export const generateQRCodeDataURL = (text: string): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  canvas.width = 200;
  canvas.height = 200;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 200, 200);

  ctx.fillStyle = "#000000";
  const cellSize = 8;
  const gridSize = 25;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const hash = text.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      if ((i * j + hash) % 3 === 0) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL();
};

export const generateTableQRURL = (tableId: string) => {
  const baseURL = window.location.origin;
  return `${baseURL}/menu?table=${tableId}`;
};
