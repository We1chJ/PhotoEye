'use client'
import React from 'react';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

// Main content wrapper that responds to sidebar state
function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <main className={`flex-1 h-full overflow-auto transition-all duration-300 min-w-0 relative ${isCollapsed ? 'ml-0' : 'ml-10'
            }`}>
            {children}
        </main>
    );
}

export default function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <MainContentWrapper>
                    {children}
                </MainContentWrapper>
            </div>
        </SidebarProvider>
    );
}
