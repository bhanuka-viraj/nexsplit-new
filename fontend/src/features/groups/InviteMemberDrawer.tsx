import { Drawer } from 'vaul';
import { useUIStore } from '@/store/ui.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Loader2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { useDebounce } from '@/hooks/use-media-query'; 

export function InviteMemberDrawer() {
    const { isInviteMemberOpen, closeInviteMember, inviteGroupId } = useUIStore();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

    // Debounce search ideally, but for now simple effect
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['search-users', searchQuery],
        queryFn: () => api.searchUsers(searchQuery),
        enabled: searchQuery.length > 0,
        staleTime: 0
    });

    const inviteMutation = useMutation({
        mutationFn: ({ groupId, userId }: { groupId: string, userId: string }) => api.inviteUser(groupId, userId),
        onSuccess: (_, variables) => {
            setInvitedUsers(prev => new Set(prev).add(variables.userId));
            queryClient.invalidateQueries({ queryKey: ['group', inviteGroupId] });
        }
    });

    const handleInvite = (userId: string) => {
        if (!inviteGroupId) return;
        inviteMutation.mutate({ groupId: inviteGroupId, userId });
    };

    // Reset state on open
    useEffect(() => {
        if (isInviteMemberOpen) {
            setSearchQuery('');
            setInvitedUsers(new Set());
        }
    }, [isInviteMemberOpen]);

    return (
        <Drawer.Root open={isInviteMemberOpen} onOpenChange={(open) => !open && closeInviteMember()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-50 border-t border-border focus:outline-none">
                    <div className="p-4 bg-card rounded-t-[20px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
                        <div className="max-w-md mx-auto space-y-6">
                            <h2 className="text-xl font-bold text-center">Invite Members</h2>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by name..."
                                    className="pl-9 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                {isSearching && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Searching...
                                    </div>
                                )}

                                {!isSearching && searchQuery && searchResults?.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No users found.
                                    </div>
                                )}

                                {!isSearching && searchResults?.map(user => {
                                    const isInvited = invitedUsers.has(user.id);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{user.name}</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleInvite(user.id)}
                                                disabled={isInvited || inviteMutation.isPending}
                                                variant={isInvited ? "outline" : "default"}
                                                className={`rounded-full px-4 ${isInvited ? 'text-green-500 border-green-500 bg-green-500/10' : ''}`}
                                            >
                                                {isInvited ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" /> Invited
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4 mr-1" /> Invite
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
