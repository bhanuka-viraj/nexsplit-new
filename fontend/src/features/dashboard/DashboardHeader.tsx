import type { User } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardHeaderProps {
    user?: User;
    isLoading: boolean;
}

import { Mail } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

export function DashboardHeader({ user, isLoading }: DashboardHeaderProps) {
    const { openInvitations } = useUIStore();
    const { data: invitations } = useQuery({ queryKey: ['invitations'], queryFn: api.getPendingInvitations });

    // ... existing greeting logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };
    // ...

    if (isLoading) {
        return (
            <div className="flex items-center justify-between py-6 px-1">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-6 px-1 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
                <p className="text-muted-foreground text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{user?.name}</h1>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-muted"
                    onClick={openInvitations}
                >
                    <Mail size={24} className="text-muted-foreground" />
                    {invitations && invitations.length > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>

                <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
}
