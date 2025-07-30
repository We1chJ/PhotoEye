import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

export default function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 h-full">
                    <SidebarTrigger />
                    <main className="flex-1 w-full h-full overflow-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}