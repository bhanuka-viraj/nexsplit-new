import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { DashboardHeader } from './DashboardHeader';
import { BalanceCard } from './BalanceCard';
import { MonthlyLimit } from './MonthlyLimit';
import { RecentActivity } from './RecentActivity';
import { PageTransition } from '@/components/layout/PageTransition';

export function DashboardPage() {
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser,
    });

    // Use new backend summary endpoint
    const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: api.getDashboardSummary,
    });

    const isLoading = isUserLoading || isDashboardLoading;

    // Get currency from backend user preferences instead of UI store
    const currency = dashboardData?.userPreferences?.currency || 'USD';

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
                        totalBalance={dashboardData?.balance?.current || 0}
                        currency={currencySymbol}
                        isLoading={isLoading}
                    />

                    <MonthlyLimit
                        spent={dashboardData?.monthlySpend?.current || 0}
                        currency={currencySymbol}
                        isLoading={isLoading}
                    />
                </div>

                {/* Bottom Row: Activity Feed */}
                <div className="w-full">
                    <RecentActivity
                        transactions={dashboardData?.recentTransactions || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </PageTransition>
    );
}
