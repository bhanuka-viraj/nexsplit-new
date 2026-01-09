import type { Transaction } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Plane, Coffee, Receipt } from 'lucide-react';

interface RecentActivityProps {
    transactions: Transaction[];
    isLoading: boolean;
}

export function RecentActivity({ transactions, isLoading }: RecentActivityProps) {

    const getIcon = (desc: string) => {
        const d = desc.toLowerCase();
        if (d.includes('flight') || d.includes('trip')) return <Plane size={18} />;
        if (d.includes('food') || d.includes('dinner')) return <ShoppingBag size={18} />;
        if (d.includes('coffee')) return <Coffee size={18} />;
        return <Receipt size={18} />;
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
                {transactions.slice(0, 3).map((t, i) => { // only show 3
                    const isIncome = t.type === 'INCOME';
                    return (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 hover:bg-accent/40 transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                    {getIcon(t.description)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{t.description}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className={`font-semibold text-sm ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
                                {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
