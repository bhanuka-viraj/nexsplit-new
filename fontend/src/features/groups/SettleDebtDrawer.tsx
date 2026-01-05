import { useState, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { User } from '@/services/api';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculateDetailedDebts, calculateSimplifiedDebts } from '@/utils/settlements';
import type { Debt } from '@/utils/settlements';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface SettleDebtDrawerProps {
    groupId: string;
    members: User[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function SettleDebtDrawer({ groupId, members, open, onOpenChange, trigger }: SettleDebtDrawerProps) {
    const queryClient = useQueryClient();
    const [internalOpen, setInternalOpen] = useState(false);

    // Controlled vs Uncontrolled logic
    const isControlled = open !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalSetOpen = isControlled ? onOpenChange : setInternalOpen;

    // Fetch transactions for calculation
    const { data: details } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => api.getGroupDetails(groupId),
        enabled: finalOpen === true, // Only fetch/calc when open
    });

    // Fetch current user properly (mimicked)
    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const transactions = details?.transactions || [];

    // Calculations
    const detailedDebts = useMemo(() => calculateDetailedDebts(transactions, members), [transactions, members]);
    const simplifiedDebts = useMemo(() => calculateSimplifiedDebts(transactions, members), [transactions, members]);

    const myDetailedDebts = useMemo(() => {
        if (!currentUser) return [];
        return detailedDebts.filter(d => d.fromUserId === currentUser.id);
    }, [detailedDebts, currentUser]);

    const mySimplifiedDebts = useMemo(() => {
        if (!currentUser) return [];
        return simplifiedDebts.filter(d => d.fromUserId === currentUser.id);
    }, [simplifiedDebts, currentUser]);

    // Mutation for "One-Click" Settle
    const mutation = useMutation({
        mutationFn: (debt: Debt) => {
            return api.addTransaction({
                type: 'SETTLEMENT',
                groupId,
                paidByUserId: debt.fromUserId,
                paidToUserId: debt.toUserId,
                amount: debt.amount,
                description: 'Settlement',
                splitType: 'EXACT',
                splitDetails: [],
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Payment recorded');
        }
    });

    const handleSettle = (debt: Debt) => {
        mutation.mutate(debt);
    };

    const DebtList = ({ debts }: { debts: Debt[] }) => {
        if (debts.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-12 w-12 mb-4 text-emerald-500/50" />
                    <p>You are all settled up!</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 pt-4">
                {debts.map((debt, idx) => {
                    const receiver = members.find(m => m.id === debt.toUserId);
                    return (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={receiver?.avatarUrl} />
                                    <AvatarFallback>{receiver?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">Pay {receiver?.name}</p>
                                    <p className="text-xs text-muted-foreground">Owed amount</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">${debt.amount.toFixed(2)}</span>
                                <Button
                                    size="sm"
                                    onClick={() => handleSettle(debt)}
                                    disabled={mutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Settle'}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Drawer open={finalOpen} onOpenChange={finalSetOpen}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent>
                <div className="mx-auto w-full max-w-md p-4">
                    <DrawerHeader className="px-0">
                        <DrawerTitle>My Debts</DrawerTitle>
                    </DrawerHeader>

                    <Tabs defaultValue="simplified" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="simplified">Simplified</TabsTrigger>
                            <TabsTrigger value="detailed">Detailed</TabsTrigger>
                        </TabsList>

                        <TabsContent value="simplified" className="mt-0">
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-4 text-center px-4">
                                Optimized to minimize number of transactions
                            </div>
                            <DebtList debts={mySimplifiedDebts} />
                        </TabsContent>

                        <TabsContent value="detailed" className="mt-0">
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-4 text-center px-4">
                                Pay exactly who you owe for specific expenses
                            </div>
                            <DebtList debts={myDetailedDebts} />
                        </TabsContent>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
