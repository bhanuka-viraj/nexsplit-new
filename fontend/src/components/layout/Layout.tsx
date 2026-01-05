import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
// Will create sonner later if needed, or removing for now.
import { ScrollRestoration } from 'react-router-dom';
import { AddTransactionDrawer } from '@/features/transactions/AddTransactionDrawer';
import { CreateGroupDrawer } from '@/features/groups/CreateGroupDrawer';
import { InviteMemberDrawer } from '@/features/groups/InviteMemberDrawer';
import { InvitationsSheet } from '@/features/dashboard/InvitationsSheet';
import { useUIStore } from '@/store/ui.store';

export function Layout() {
    const { theme } = useUIStore();

    // Apply theme to html element
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return (
        <div className="flex h-[100dvh] bg-background text-foreground transition-colors duration-300 font-sans antialiased flex flex-row">
            {/* Desktop Side Navigation */}
            <SideNav />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen relative max-w-full overflow-hidden">
                {/* Mobile-constrained wrapper for content, but fluid on desktop */}
                <main className="flex-1 overflow-y-auto pb-24 md:pb-0 scrollbar-hide w-full">
                    {/* On mobile, we keep the max-w-md constraint via a child div or page implementation. 
                        For a truly responsive web app, we want the pages to expand. 
                        Let's allow pages to control their max-width, or set a responsive container here. */}
                    <div className="w-full h-full mx-auto md:max-w-5xl md:px-8 md:py-8">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation - absolute positioned on mobile typically, or fixed */}
                <div className="md:hidden">
                    <BottomNav />
                </div>
            </div>

            {/* Global Drawers */}
            <AddTransactionDrawer />
            <CreateGroupDrawer />
            <InviteMemberDrawer />
            <InvitationsSheet />

            <ScrollRestoration />
        </div>
    );
}
