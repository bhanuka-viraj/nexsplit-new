import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';

export function DebtsPage() {
    const [strategy, setStrategy] = useState<'simplified' | 'detailed'>('simplified');

    // Fetch settlements from backend
    const { data: settlementsData, isLoading } = useQuery({
        queryKey: ['settlements', strategy],
        queryFn: () => api.getSettlements(strategy),
    });

    const settlements = settlementsData?.settlements || [];
    const totalOwing = settlements.reduce((sum: number, s: any) => sum + s.amount, 0);

    if (isLoading) {
        return (
            <PageTransition className="px-6 pt-8 space-y-6 w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="px-6 pt-8 space-y-6 w-full max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settle Up</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Optimize your debt settlements
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            {settlements.length > 0 && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total You Owe</p>
                                <p className="text-3xl font-bold text-primary mt-1">${totalOwing.toFixed(2)}</p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <TrendingDown className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            {settlements.length} payment{settlements.length !== 1 ? 's' : ''} needed to settle all debts
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Strategy Tabs */}
            <Tabs value={strategy} onValueChange={(v) => setStrategy(v as 'simplified' | 'detailed')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simplified">
                        Simplified
                        <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                            {strategy === 'simplified' ? settlements.length : '...'}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="detailed">
                        Detailed by Group
                        <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                            {strategy === 'detailed' ? settlements.length : '...'}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="simplified" className="space-y-4 mt-6">
                    {settlements.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">All Settled Up!</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    You don't owe anyone money right now.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        settlements.map((settlement: any, idx: number) => (
                            <Card key={idx} className="hover:bg-accent/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                            <AvatarImage src={settlement.to.avatarUrl} />
                                            <AvatarFallback>{settlement.to.userName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">Pay {settlement.to.userName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Settle outstanding debts
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">
                                                ${settlement.amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4 mt-6">
                    {settlements.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">All Settled Up!</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    You don't owe anyone money in any group.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        settlements.map((settlement: any, idx: number) => (
                            <Card key={idx} className="hover:bg-accent/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                <AvatarImage src={settlement.to.avatarUrl} />
                                                <AvatarFallback>{settlement.to.userName?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">Pay {settlement.to.userName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {settlement.groupName || 'Personal'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">
                                                    ${settlement.amount.toFixed(2)}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </PageTransition>
    );
}
