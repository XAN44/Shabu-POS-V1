// app/page.tsx

import { SocketTest } from "./components/testSocket";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Socket.IO Connection Test
        </h1>
        <SocketTest />
      </div>
    </main>
  );
}
