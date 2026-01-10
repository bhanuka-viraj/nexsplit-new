import { Drawer } from 'vaul';
import { useUIStore } from '@/store/ui.store';
import { TransactionForm } from './TransactionForm';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function AddTransactionDrawer() {
    const { isAddTransactionOpen, closeAddTransaction, openAddTransaction } = useUIStore();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: api.getGroups });

    const mutation = useMutation({
        mutationFn: api.addTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['group'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] }); // Hacky invalidation for dashboard
            closeAddTransaction();
            setIsSubmitting(false);
        },
        onError: () => {
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);

        const payload = {
            ...data,
            amount: parseFloat(data.amount),
        };

        mutation.mutate(payload);
    };

    return (
        <Drawer.Root open={isAddTransactionOpen} onOpenChange={(open) => open ? openAddTransaction() : closeAddTransaction()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-50 border-t border-border focus:outline-none">
                    <div className="p-4 bg-card rounded-t-[20px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
                        <div className="max-w-md mx-auto">
                            <h2 className="text-xl font-bold mb-6 text-center">Add Expense</h2>

                            {user && groups && (
                                <TransactionForm
                                    currentUser={user}
                                    groups={groups}
                                    onSubmit={handleSubmit}
                                    isLoading={isSubmitting}
                                    onCancel={closeAddTransaction}
                                />
                            )}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
