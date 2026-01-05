import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { GroupHeader } from './GroupHeader';
import { MembersList } from './MembersList';
import { ExpensesList } from './ExpensesList';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettleDebtDrawer } from './SettleDebtDrawer';
import { PageTransition } from '@/components/layout/PageTransition';

export function GroupDetailsPage() {
    const { groupId } = useParams<{ groupId: string }>();

    // Fetch current user properly in a real app
    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    const { data: details, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => api.getGroupDetails(groupId || ''),
        enabled: !!groupId,
    });

    if (!groupId) return <div>Invalid Group ID</div>;

    const mySummary = details?.summary.find(s => s.userId === user?.id);

    return (
        <PageTransition className="pb-24 min-h-screen relative w-full mx-auto">
            {/* Immersive Header Image */}
            <div className="w-full h-[40vh] md:h-[50vh] relative">
                {details?.group.imageUrl ? (
                    <img
                        src={details.group.imageUrl}
                        alt={details.group.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background/95 md:to-background" />

                {/* Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 z-20">
                    <GroupHeader
                        name={details?.group.name}
                        totalCost={details?.group.totalCost}
                        currency={details?.group.currency}
                        isLoading={isLoading}
                        hasImage={true} // Always force overlay mode basically
                        transparent={true} // New prop to tell header to be glass
                    />
                </div>

                {/* Hero Title (Mobile) */}
                <div className="absolute bottom-10 left-6 z-10 md:hidden animate-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">{details?.group.name}</h1>
                    <div className="flex items-center gap-2 text-white/90">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold border border-white/10">
                            {details?.group.currency}
                        </span>
                        <span className="text-sm font-medium">{details?.group.members.length} members</span>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Members */}
                <div className="space-y-6 lg:col-span-1 lg:-mt-32">
                    {/* Desktop Title (Hidden mobile) */}
                    <div className="hidden lg:block mb-6 animate-in slide-in-from-bottom-4 duration-700 text-white">
                        <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">{details?.group.name}</h1>
                        <div className="flex items-center gap-2 text-white/90">
                            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold border border-white/10">
                                {details?.group.currency}
                            </span>
                            <span className="text-sm font-medium">{details?.group.members.length} members</span>
                        </div>
                    </div>

                    {/* My Position Card */}
                    {!isLoading && mySummary && (
                        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your Position</p>
                                    <div className="flex gap-4 mt-2">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">You paid</p>
                                            <p className="font-semibold text-foreground">${mySummary.paid.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Your share</p>
                                            <p className="font-semibold text-foreground">${mySummary.owe.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Net</p>
                                    <span className={`text-xl font-bold ${mySummary.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {mySummary.net >= 0 ? '+' : ''}${mySummary.net.toFixed(2)}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground">
                                        {mySummary.net >= 0 ? 'to get back' : 'to pay'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {isLoading && <Skeleton className="h-24 w-full rounded-xl" />}

                    <MembersList members={details?.group.members || []} isLoading={isLoading} />

                    {!isLoading && details?.group && (
                        <div className="pt-2">
                            <SettleDebtDrawer
                                groupId={groupId}
                                members={details.group.members}
                                trigger={
                                    <Button className="w-full bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 hover:text-emerald-400 border border-emerald-600/20" variant="outline">
                                        Settle Up
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Expenses Feed */}
                <div className="lg:col-span-2">
                    <ExpensesList
                        transactions={details?.transactions || []}
                        members={details?.group.members || []}
                        currentUserId={user?.id || ''}
                    />
                </div>
            </div>
        </PageTransition>
    );
}
