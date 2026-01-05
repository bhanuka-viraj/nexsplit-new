import { useUIStore } from '@/store/ui.store';
import { Home, Users, CreditCard, Settings, Plus, Banknote, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

export function SideNav() {
    const { openAddTransaction, currency, setCurrency } = useUIStore();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Banknote, label: 'Debts', path: '/debts' },
        { icon: Users, label: 'Groups', path: '/groups' },
        { icon: CreditCard, label: 'Activity', path: '/activity' },
        { icon: Settings, label: 'Settings', path: '/profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border h-screen sticky top-0 bg-card/50 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 px-2 mb-8 mt-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary-foreground">N</span>
                </div>
                <span className="font-bold text-xl tracking-tight">NexSplit</span>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group h-10 text-sm ${isActive
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="pt-4 mt-auto space-y-4">
                {/* Currency Selector */}
                <div className="px-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 ml-1">CURRENCY</p>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-accent/30 border border-border/50 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="IDR">IDR (Rp)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                    </select>
                </div>

                <Button
                    onClick={openAddTransaction}
                    className="w-full h-10 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>

                <div className="flex items-center gap-2 px-2 py-3 rounded-xl bg-accent/30 border border-border/50">
                    <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0">
                        <img src="https://github.com/shadcn.png" alt="User" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">You</p>
                        <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                        onClick={async () => {
                            await api.logout();
                            window.location.href = '/signin';
                        }}
                    >
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
