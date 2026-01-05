import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface BalanceCardProps {
    totalBalance: number;
    currency: string;
    isLoading: boolean;
}

export function BalanceCard({ totalBalance, currency, isLoading }: BalanceCardProps) {
    if (isLoading) {
        return <Skeleton className="h-40 w-full rounded-xl" />;
    }

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-50 text-primary animate-pulse">
                <TrendingUp size={80} strokeWidth={1} className="opacity-10" />
            </div>

            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-4xl font-bold tracking-tighter">
                    {currency} {totalBalance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="text-emerald-500 font-medium">+2.5%</span> from last month
                </p>
            </CardContent>
        </Card>
    );
}
