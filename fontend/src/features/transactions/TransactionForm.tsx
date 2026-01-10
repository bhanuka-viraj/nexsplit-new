import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User, Group, SplitType, SplitDetail } from '@/services/api';
import { Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const transactionSchema = z.object({
    amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
    description: z.string().min(2, 'Description is too short'),
    groupId: z.string().min(1, 'Group is required'),
    paidByUserId: z.string().min(1, 'Payer is required'),
});

type TransactionFormValues = Omit<z.infer<typeof transactionSchema>, 'groupId'> & {
    type: 'EXPENSE' | 'INCOME';
    splitType: SplitType;
    splitDetails: SplitDetail[];
    groupId?: string;
};

interface TransactionFormProps {
    groups: Group[];
    currentUser: User;
    onSubmit: (data: TransactionFormValues) => void;
    isLoading: boolean;
    onCancel: () => void;
}

export function TransactionForm({ groups, currentUser, onSubmit, isLoading, onCancel }: TransactionFormProps) {
    const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<z.infer<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            amount: '',
            description: '',
            groupId: groups[0]?.id || '',
            paidByUserId: currentUser?.id || '',
        },
    });

    const [splitType, setSplitType] = useState<SplitType>('EQUAL');
    const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);

    const selectedGroupId = watch('groupId');
    const isPersonal = selectedGroupId === 'personal' || transactionType === 'INCOME';

    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    const amountStr = watch('amount');
    const amount = parseFloat(amountStr) || 0;
    const paidByUserId = watch('paidByUserId'); // Move watch() call here, outside map

    // Initialize/Reset split details when group changes
    useEffect(() => {
        if (selectedGroup && selectedGroup.members) {
            // Use functional update to atomically replace splitDetails
            setSplitDetails(() => {
                const newSplitDetails = selectedGroup.members.map(m => ({
                    userId: m.id,
                    amount: 0,
                    percentage: 0
                }));
                return newSplitDetails;
            });

            // Reset paidByUserId if current payer is not in the new group
            const currentPayerStillValid = selectedGroup.members.some(m => m.id === paidByUserId);

            if (!currentPayerStillValid) {
                const isCurrentUserInGroup = selectedGroup.members.some(m => m.id === currentUser.id);
                if (isCurrentUserInGroup) {
                    setValue('paidByUserId', currentUser.id, { shouldValidate: false });
                } else if (selectedGroup.members.length > 0) {
                    setValue('paidByUserId', selectedGroup.members[0].id, { shouldValidate: false });
                }
            }
        } else {
            // No group selected - clear split details
            setSplitDetails(() => []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [selectedGroupId]); // Only depend on groupId to avoid infinite loops


    const handleSplitChange = (userId: string, field: 'amount' | 'percentage', value: number) => {
        setSplitDetails(prev => prev.map(d => {
            if (d.userId === userId) {
                return { ...d, [field]: value };
            }
            return d;
        }));
    };

    const handleFormSubmit = (data: z.infer<typeof transactionSchema>) => {
        const finalGroupId = isPersonal ? undefined : data.groupId;

        // Filter out any split details with undefined userId (stale state bug)
        const validSplitDetails = splitDetails.filter(d => d.userId !== undefined && d.userId !== null && d.userId !== '');
        const finalDetails = isPersonal ? [] : validSplitDetails;

        const payload = {
            ...data,
            groupId: finalGroupId,
            type: transactionType,
            splitType: isPersonal ? 'EXACT' : splitType,
            splitDetails: finalDetails
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
            {/* Type Toggle */}
            <div className="flex p-1 bg-muted/50 rounded-xl mx-12">
                <button
                    type="button"
                    onClick={() => { setTransactionType('EXPENSE'); setValue('groupId', groups[0]?.id || ''); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${transactionType === 'EXPENSE' ? 'bg-background shadow-sm text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => { setTransactionType('INCOME'); setValue('groupId', 'personal'); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${transactionType === 'INCOME' ? 'bg-background shadow-sm text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Income
                </button>
            </div>

            {/* Amount Input */}
            <div className="flex flex-col items-center justify-center space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{transactionType}</label>
                <div className={`flex items-baseline text-5xl font-bold tracking-tighter ${transactionType === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                    <span className="opacity-50 mr-1">$</span>
                    <input
                        {...register('amount')}
                        type="number"
                        placeholder="0.00"
                        className={`bg-transparent border-none text-center outline-none w-48 placeholder:text-muted/30 focus:ring-0 ${transactionType === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}
                        autoFocus
                    />
                </div>
                {errors.amount && <span className="text-destructive text-xs">{errors.amount.message}</span>}
            </div>

            <div className="space-y-4 px-4">
                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">For what?</label>
                    <input
                        {...register('description')}
                        className="w-full bg-muted/50 border border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder={transactionType === 'INCOME' ? "e.g. Salary, Freight refund" : "e.g. Dinner, Taxi, Hotel"}
                    />
                    {errors.description && <span className="text-destructive text-xs">{errors.description.message}</span>}
                </div>

                {/* Group Selector (Only for Expenses) */}
                {transactionType === 'EXPENSE' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Group</label>
                        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setValue('groupId', 'personal')}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedGroupId === 'personal' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-foreground/50'}`}
                            >
                                Personal (Only Me)
                            </button>
                            {groups.map(group => (
                                <button
                                    type="button"
                                    key={group.id}
                                    onClick={() => setValue('groupId', group.id)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedGroupId === group.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-foreground/50'}`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payer Selector */}
                {/* Show payer selection ONLY if it's a Group Expense. If Personal or Income, it's implied 'You' */}
                {!isPersonal && selectedGroup && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Paid by</label>
                        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                            {selectedGroup.members.map(member => {
                                const isThisPayer = paidByUserId === member.id;

                                return (
                                    <button
                                        type="button"
                                        key={member.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setValue('paidByUserId', member.id, { shouldValidate: false });
                                        }}
                                        className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isThisPayer ? 'bg-accent text-white border-accent' : 'bg-transparent border-border text-muted-foreground hover:border-foreground/50'}`}
                                    >
                                        <div className="h-5 w-5 rounded-full bg-muted overflow-hidden">
                                            <img src={member.avatarUrl} alt={member.name} />
                                        </div>
                                        {member.id === currentUser.id ? 'You' : member.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Split Logic UI (Only for Group Expenses) */}
                {!isPersonal && selectedGroup && (
                    <div className="space-y-3 pt-2">
                        {/* Member Selection - All members included by default */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Split with</label>
                            <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                                {selectedGroup.members.map(member => {
                                    const isSelected = splitDetails.some(d => d.userId === member.id);

                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            className={`relative flex flex-col items-center gap-1 transition-all ${isSelected ? 'opacity-100 scale-100' : 'opacity-50 grayscale scale-90'}`}
                                            disabled
                                        >
                                            <div className={`relative rounded-full p-0.5 ${isSelected ? 'bg-primary' : 'bg-transparent'}`}>
                                                <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full border-2 border-background" />
                                                {isSelected && <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5"><Check size={10} /></div>}
                                            </div>
                                            <span className="text-[10px] font-medium truncate w-12 text-center">{member.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Split Method</label>
                        <div className="flex p-1 bg-muted/50 rounded-lg">
                            {(['EQUAL', 'EXACT', 'PERCENTAGE'] as SplitType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSplitType(type)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${splitType === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="bg-muted/20 rounded-xl p-3 space-y-3">
                            {selectedGroup.members.filter(m => splitDetails.some(d => d.userId === m.id)).map(member => {
                                const detail = splitDetails.find(d => d.userId === member.id);
                                return (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={member.avatarUrl} className="w-6 h-6 rounded-full" />
                                            <span className="text-sm">{member.name}</span>
                                        </div>
                                        <div className="w-24">
                                            {splitType === 'EQUAL' && (
                                                <span className="text-sm text-muted-foreground text-right block">
                                                    ${(amount / splitDetails.length).toFixed(2)}
                                                </span>
                                            )}
                                            {splitType === 'EXACT' && (
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                                    <Input
                                                        type="number"
                                                        className="h-8 pl-5 text-right text-xs"
                                                        value={detail?.amount || ''}
                                                        onChange={(e) => handleSplitChange(member.id, 'amount', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                            {splitType === 'PERCENTAGE' && (
                                                <div className="relative">
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                                    <Input
                                                        type="number"
                                                        className="h-8 pr-8 text-right text-xs"
                                                        value={detail?.percentage || ''}
                                                        onChange={(e) => handleSplitChange(member.id, 'percentage', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
                }
            </div >

            <div className="grid grid-cols-2 gap-4 pt-4 px-4 pb-4">
                <Button variant="outline" type="button" onClick={onCancel} className="w-full h-12 rounded-xl">
                    Cancel
                </Button>
                <Button disabled={isLoading} type="submit" className={`w-full h-12 rounded-xl text-md font-semibold shadow-xl ${transactionType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'shadow-primary/20'}`}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {transactionType === 'INCOME' ? 'Add Income' : 'Add Expense'}
                </Button>
            </div>
        </form >
    );
}
