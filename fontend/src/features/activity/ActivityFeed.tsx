import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function ActivityFeed() {
    const { currency } = useUIStore();
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['all-transactions'],
        queryFn: api.getAllTransactions,
    });

    // Helper to get currency symbol (duplicated logic, should be util but fine for now)
    const getSymbol = (curr: string) => {
        switch (curr) {
            case 'EUR': return '€';
            case 'IDR': return 'Rp';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            default: return '$';
        }
    };
    const currencySymbol = getSymbol(currency);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No activity yet.</div>;
    }

    // Grouping logic could go here, but for now simple list is clear
    return (
        <div className="space-y-3 pb-24">
            {transactions.map((t, i) => {
                const isPayer = t.paidByUserId === 'u1'; // Hardcoded current user check for mock

                return (
                    <Card key={t.id} className="border-none bg-accent/30 hover:bg-accent/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPayer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {isPayer ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{t.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{isToday(new Date(t.date)) ? 'Today' : isYesterday(new Date(t.date)) ? 'Yesterday' : format(new Date(t.date), 'MMM d')}</span>
                                        <span>•</span>
                                        <span className="capitalize">{t.splitType.toLowerCase()} split</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${isPayer ? 'text-emerald-500' : 'text-foreground'}`}>
                                    {isPayer ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                                    {isPayer ? 'You paid' : 'You owe'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
