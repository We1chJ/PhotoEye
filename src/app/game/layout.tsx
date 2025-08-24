'use client'
import React from 'react';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

// Main content wrapper that responds to sidebar state
function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <main className={`flex-1 h-full transition-all duration-300 min-w-0 relative p-2 ${isCollapsed ? 'ml-0' : 'ml-10'
            }`}>
            {/* Scaled down rounded content area - only x-axis scaling */}
            <div 
                className="h-full w-full bg-white rounded-2xl shadow-lg overflow-hidden"
                style={{ transform: 'scale(0.9999)' }}
            >
                <div className="h-full w-full overflow-auto">
                    {children}
                </div>
            </div>
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
            {/* Background matches sidebar color */}
            <div className="flex h-screen w-full bg-sidebar">
                <AppSidebar />
                <MainContentWrapper>
                    {children}
                </MainContentWrapper>
            </div>
        </SidebarProvider>
    );
}