import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { DashboardHeader } from './DashboardHeader';
import { BalanceCard } from './BalanceCard';
import { MonthlyLimit } from './MonthlyLimit';
import { RecentActivity } from './RecentActivity';
import { useUIStore } from '@/store/ui.store';
import { PageTransition } from '@/components/layout/PageTransition';

export function DashboardPage() {
    const { currency } = useUIStore();
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser,
    });

    const { isLoading: isGroupsLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: api.getGroups,
    });

    const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['all-transactions'],
        queryFn: api.getAllTransactions,
    });

    const isLoading = isUserLoading || isGroupsLoading || isTransactionsLoading;

    // Calculate Balance
    // Assuming a starting balance + Income - Outflow (Paid by me)
    const startingBalance = 5000;
    const currentUserId = user?.id || 'u1';

    const income = transactions?.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0) || 0;

    // Outflow: Expenses paid by me
    const outflow = transactions?.filter(t => t.type === 'EXPENSE' && t.paidByUserId === currentUserId).reduce((acc, t) => acc + t.amount, 0) || 0;

    const currentBalance = startingBalance + income - outflow;

    // Calculate total spent (Outflow) for monthly limit
    const totalSpent = outflow;

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

    return (
        <PageTransition className="px-6 pb-20 pt-2 space-y-6 w-full mx-auto">
            <DashboardHeader user={user} isLoading={isLoading} />

            <div className="flex flex-col gap-6">
                {/* Top Row: Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BalanceCard
                        totalBalance={currentBalance}
                        currency={currencySymbol}
                        isLoading={isLoading}
                    />

                    <MonthlyLimit
                        spent={totalSpent}
                        currency={currencySymbol}
                        isLoading={isLoading}
                    />
                </div>

                {/* Bottom Row: Activity Feed */}
                <div className="w-full">
                    <RecentActivity
                        transactions={transactions || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </PageTransition>
    );
}
