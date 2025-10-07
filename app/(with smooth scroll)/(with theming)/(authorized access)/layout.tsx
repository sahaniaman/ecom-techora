import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

const layout = async ({ children }: { children: React.ReactNode }) => {

  return (
    <SidebarProvider className="min-w-full flex flex-col">
      <main className="flex items-center justify-center h-full w-full">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default layout;
