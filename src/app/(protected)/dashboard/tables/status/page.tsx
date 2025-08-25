"use client";
import QRCode from "react-qr-code";

const tables = [
  { id: "T01", status: "active" },
  { id: "T02", status: "free" },
  { id: "T03", status: "active" },
];

export default function ActiveTables() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {tables.map((table) => (
        <div key={table.id} className="border p-4 rounded">
          <h2 className="font-bold mb-2">{table.id}</h2>
          <p>สถานะ: {table.status}</p>
          <QRCode value={`https://yourdomain.com/order?tableId=${table.id}`} />
        </div>
      ))}
    </div>
  );
}
