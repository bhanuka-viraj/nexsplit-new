import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { calculateDetailedDebts, calculateSimplifiedDebts } from '@/utils/settlements';
import type { Debt } from '@/utils/settlements';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react'; // Using standard icons, assuming library availability
import { useMemo } from 'react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/layout/PageTransition';

export function DebtsPage() {
    const queryClient = useQueryClient();

    // 1. Fetch ALL groups
    const { data: groups, isLoading: groupsLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: api.getGroups,
    });

    // 2. We need details (transactions + members) for ALL groups to calculate debt.
    // In a real backend, we'd hit /api/debts. Here we must fetch details for each group.
    // This is inefficient client-side but necessary for mock.
    const groupQueriesResult = useQuery({
        queryKey: ['allGroupDetails', groups?.map(g => g.id)],
        queryFn: async () => {
            if (!groups) return [];
            const promises = groups.map(g => api.getGroupDetails(g.id));
            return Promise.all(promises);
        },
        enabled: !!groups && groups.length > 0,
    });

    const { data: allDetails, isLoading: detailsLoading } = groupQueriesResult;
    const isLoading = groupsLoading || detailsLoading;

    // 3. Fetch Current User
    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser,
    });

    // 4. Calculate Aggregate Debts
    const aggDebts = useMemo(() => {
        if (!allDetails || !currentUser) return { detailed: [], simplified: [] };

        let allDetailed: (Debt & { groupName: string, groupId: string })[] = [];
        let allSimplified: (Debt & { groupName: string, groupId: string })[] = [];

        allDetails.forEach(details => {
            if (!details) return;
            const det = calculateDetailedDebts(details.transactions, details.group.members);
            const sim = calculateSimplifiedDebts(details.transactions, details.group.members);

            // Filter for MY debts
            const myDet = det.filter(d => d.fromUserId === currentUser.id);
            const mySim = sim.filter(d => d.fromUserId === currentUser.id);

            // Add group context
            allDetailed.push(...myDet.map(d => ({ ...d, groupName: details.group.name, groupId: details.group.id })));
            allSimplified.push(...mySim.map(d => ({ ...d, groupName: details.group.name, groupId: details.group.id })));
        });

        return { detailed: allDetailed, simplified: allSimplified };
    }, [allDetails, currentUser]);

    // Mutation to pay
    const mutation = useMutation({
        mutationFn: (item: Debt & { groupId: string }) => {
            return api.addTransaction({
                type: 'SETTLEMENT',
                groupId: item.groupId,
                paidByUserId: item.fromUserId,
                paidToUserId: item.toUserId,
                amount: item.amount,
                description: 'Settlement',
                splitType: 'EXACT',
                splitDetails: [],
            });
        },
        onSuccess: () => {
            // Invalidate specific groups or all
            queryClient.invalidateQueries({ queryKey: ['allGroupDetails'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            // Also individual group queries if cached
            // Actually 'allGroupDetails' is a custom key, we should invalidate 'group' keys too.
            // Ideally we just invalidate everything relevant.
            queryClient.invalidateQueries({ queryKey: ['group'] });
            toast.success('Payment recorded');
        }
    });

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const DebtsList = ({ items }: { items: typeof aggDebts.detailed }) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4 border rounded-xl border-dashed">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">You're debt free!</h3>
                    <p className="text-sm text-muted-foreground">You don't owe anyone anything right now.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((item, i) => {
                    // Find user info from the specific group details
                    const groupDetail = allDetails?.find(g => g && g.group.id === item.groupId);
                    const receiver = groupDetail?.group.members.find(m => m.id === item.toUserId);

                    return (
                        <Card key={`${item.groupId}-${i}`} className="overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={receiver?.avatarUrl} />
                                        <AvatarFallback>{receiver?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">Pay {receiver?.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span className="truncate max-w-[100px]">{item.groupName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className="font-bold text-base text-rose-500">-${item.amount.toFixed(2)}</span>
                                    <Button
                                        size="sm"
                                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => mutation.mutate(item)}
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Settle'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const totalDebt = aggDebts.simplified.reduce((sum, d) => sum + d.amount, 0);

    return (
        <PageTransition className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1">Debts</h1>
                <p className="text-muted-foreground">Overview of what you owe across all groups.</p>
            </header>

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-rose-500/10 via-background to-background border-rose-200/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Owed</p>
                            <h2 className="text-3xl font-bold text-rose-600 dark:text-rose-400">${totalDebt.toFixed(2)}</h2>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="simplified">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="simplified">Simplified</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed</TabsTrigger>
                </TabsList>

                <TabsContent value="simplified" className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <span>Optimized to minimize the number of transactions you need to make.</span>
                    </div>
                    <DebtsList items={aggDebts.simplified} />
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <span>Shows every specific debt relationship from individual expenses.</span>
                    </div>
                    <DebtsList items={aggDebts.detailed} />
                </TabsContent>
            </Tabs>
        </PageTransition>
    );
}
