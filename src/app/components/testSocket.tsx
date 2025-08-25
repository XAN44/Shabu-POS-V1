// app/components/SocketTest.tsx
"use client";

import React from "react";
import { useSocketContext } from "../providers/SocketProvider";

export function SocketTest() {
  const { isConnected, connectionStatus, connect, disconnect, sendPing } =
    useSocketContext();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Socket.IO Connection Test</h2>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <p className="text-xs text-gray-600">{connectionStatus}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={connect}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Connect
        </button>

        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Disconnect
        </button>

        <button
          onClick={sendPing}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Send Ping
        </button>
      </div>
    </div>
  );
}
