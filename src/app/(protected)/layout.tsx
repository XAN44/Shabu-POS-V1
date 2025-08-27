"use client";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
