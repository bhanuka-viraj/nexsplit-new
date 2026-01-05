import { useUIStore } from '@/store/ui.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Check, X, Mail, X as CloseIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function InvitationsSheet() {
    const { isInvitationsOpen, closeInvitations } = useUIStore();
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation state
    useEffect(() => {
        if (isInvitationsOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for exit animation
            return () => clearTimeout(timer);
        }
    }, [isInvitationsOpen]);

    const { data: invitations, isLoading } = useQuery({
        queryKey: ['invitations'],
        queryFn: api.getPendingInvitations,
        enabled: isInvitationsOpen, // Only fetch when open
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, accept }: { id: string, accept: boolean }) => api.respondToInvite(id, accept),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            // Don't close immediately, let user see result or handle others
        }
    });

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isInvitationsOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeInvitations}
            />

            {/* Sheet Content */}
            <div
                className={`relative w-full max-w-sm h-full bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out transform ${isInvitationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Mail className="text-primary" size={20} />
                            Invitations
                        </div>
                        <Button variant="ghost" size="icon" onClick={closeInvitations} className="h-8 w-8 rounded-full">
                            <CloseIcon size={18} />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading && (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!isLoading && invitations && invitations.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No pending invitations.</p>
                                <p className="text-xs mt-2">Check back later!</p>
                            </div>
                        )}

                        {!isLoading && invitations?.map(invite => (
                            <div key={invite.id} className="relative overflow-hidden rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 group">
                                {/* Image Background or Side Image */}
                                <div className="h-24 w-full relative">
                                    {invite.groupImageUrl ? (
                                        <div className="absolute inset-0">
                                            <img src={invite.groupImageUrl} alt={invite.groupName} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
                                    )}

                                    <div className="absolute bottom-2 left-4 right-4 z-10 flex justify-between items-end">
                                        <div>
                                            <p className="font-bold text-lg leading-tight">{invite.groupName}</p>
                                            <p className="text-xs text-muted-foreground font-medium">Invited by Friend</p>
                                        </div>
                                        <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                            Pending
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 pt-1 bg-background">

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50"
                                            onClick={() => respondMutation.mutate({ id: invite.id, accept: false })}
                                            disabled={respondMutation.isPending}
                                        >
                                            <X className="mr-2 h-4 w-4" /> Decline
                                        </Button>
                                        <Button
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                                            onClick={() => respondMutation.mutate({ id: invite.id, accept: true })}
                                            disabled={respondMutation.isPending}
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Accept
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
