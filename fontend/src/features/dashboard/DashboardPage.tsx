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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 BALANCE CALCULATION DEBUG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Current User ID:', currentUserId);
    console.log('Total Transactions:', transactions?.length || 0);

    const income = transactions?.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0) || 0;
    console.log('\n💵 Income Transactions:', income);

    // Outflow: ALL expenses (personal + group) paid by me
    // Handle both populated objects and string IDs
    const expenseTransactions = transactions?.filter(t => t.type === 'EXPENSE') || [];
    console.log('\n📤 Total Expense Transactions:', expenseTransactions.length);

    expenseTransactions.forEach((t, index) => {
        // Populated objects have _id, not id
        const payerId = typeof t.paidByUserId === 'object'
            ? ((t.paidByUserId as any)._id || (t.paidByUserId as any).id)
            : t.paidByUserId;

        const isMyExpense = payerId === currentUserId;

        console.log(`  [${index + 1}] ${t.description}:`);
        console.log(`      Amount: $${t.amount}`);
        console.log(`      paidByUserId type: ${typeof t.paidByUserId}`);
        console.log(`      paidByUserId value:`, t.paidByUserId);
        console.log(`      Extracted payerId: ${payerId}`);
        console.log(`      Is My Expense? ${isMyExpense}`);
        console.log(`      Has GroupId? ${!!t.groupId}`);
    });

    const outflow = transactions?.filter(t => {
        if (t.type !== 'EXPENSE') return false;

        // Populated objects have _id, not id (mapId doesn't transform nested objects)
        const payerId = typeof t.paidByUserId === 'object'
            ? ((t.paidByUserId as any)._id || (t.paidByUserId as any).id)
            : t.paidByUserId;

        return payerId === currentUserId;
    }).reduce((acc, t) => acc + t.amount, 0) || 0;

    console.log('\n📊 Summary:');
    console.log(`  Starting Balance: $${startingBalance}`);
    console.log(`  Total Income: +$${income}`);
    console.log(`  Total Outflow (My Expenses): -$${outflow}`);
    console.log(`  Final Balance: $${startingBalance + income - outflow}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
