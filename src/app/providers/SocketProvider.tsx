"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket";
import { useSocket } from "@/src/hooks/useSocket";

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  connectionStatus: string;
  connect: () => void;
  disconnect: () => void;
  sendPing: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
}
