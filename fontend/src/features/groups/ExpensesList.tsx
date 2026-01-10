import type { Transaction, User } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ExpensesListProps {
    transactions: Transaction[];
    members: User[];
    currentUserId: string;
}

export function ExpensesList({ transactions, members, currentUserId }: ExpensesListProps) {

    const getMember = (id: string | any) => {
        // Handle both string ID and populated object
        const searchId = typeof id === 'string' ? id : id?.id || id?._id;
        return members.find(m => m.id === searchId);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Expenses</h3>
            <div className="space-y-3">
                {transactions.map((t, i) => {
                    const payer = getMember(t.paidByUserId);
                    const isMe = t.paidByUserId === currentUserId;
                    const isSettlement = t.type === 'SETTLEMENT';

                    // For settlement, who received it?
                    const receiver = t.paidToUserId ? getMember(t.paidToUserId) : null;
                    const receiverName = t.paidToUserId === currentUserId ? 'You' : receiver?.name;

                    return (
                        <Card
                            key={t.id}
                            className={`border-none transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500 ${isSettlement ? 'bg-emerald-500/10' : 'bg-card/40 hover:bg-card/80'
                                }`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className={`h-10 w-10 border ${isSettlement ? 'border-emerald-500/50' : 'border-border'}`}>
                                            <AvatarImage src={payer?.avatarUrl} />
                                            <AvatarFallback>{payer?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {isMe && <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] text-primary-foreground px-1 rounded-sm">YOU</div>}
                                        {isSettlement && <div className="absolute -top-1 -right-1 bg-emerald-500 text-[8px] text-white px-1 rounded-full shadow-sm">PAY</div>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {isSettlement ? `${isMe ? 'You' : payer?.name} paid ${receiverName}` : t.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {isSettlement ? (
                                                <span className="text-emerald-500 font-medium">Settlement</span>
                                            ) : (
                                                `${isMe ? 'You' : payer?.name} paid $${t.amount}`
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-semibold text-sm ${isSettlement ? 'text-emerald-500' : ''}`}>
                                        {isSettlement ? '+' : ''}${t.amount}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(t.date), 'MMM d')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {transactions.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No expenses yet. Tap + to add one.
                    </div>
                )}
            </div>
        </div>
    );
}
