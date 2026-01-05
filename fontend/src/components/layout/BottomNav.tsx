import { Home, Users, Plus, Settings, Banknote } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { useUIStore } from '@/store/ui.store';

export function BottomNav() {
    const location = useLocation();
    const path = location.pathname;
    const { openAddTransaction } = useUIStore();

    const isActive = (p: string) => path === p;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
                <Link
                    to="/"
                    className={cn(
                        "flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors",
                        isActive('/') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    to="/debts"
                    className={cn(
                        "flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors",
                        isActive('/debts') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Banknote size={20} strokeWidth={isActive('/debts') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Debts</span>
                </Link>

                <div className="relative -top-5">
                    <Button
                        onClick={openAddTransaction}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </Button>
                </div>

                <Link
                    to="/groups"
                    className={cn(
                        "flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors",
                        isActive('/groups') || path.startsWith('/group') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Users size={20} strokeWidth={isActive('/groups') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Groups</span>
                </Link>

                <Link
                    to="/profile"
                    className={cn(
                        "flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors",
                        isActive('/profile') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Settings size={20} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
}
