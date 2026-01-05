import type { User } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { useUIStore } from '@/store/ui.store';
import { useParams } from 'react-router-dom';

interface MembersListProps {
    members: User[];
    isLoading: boolean;
}

export function MembersList({ members, isLoading }: MembersListProps) {
    const { openInviteMember } = useUIStore();
    const { groupId } = useParams<{ groupId: string }>();

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 overflow-hidden py-2">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-12 rounded-full flex-shrink-0" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar scroll-smooth">
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300 p-1">
                {members.map((member) => (
                    <div key={member.id} className="relative group transition-transform hover:scale-110 z-0 hover:z-10">
                        <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {/* Tooltip-ish name */}
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] bg-popover text-popover-foreground px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {member.name}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => groupId && openInviteMember(groupId)}
                className="h-10 w-10 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-lg pb-1"
            >
                +
            </button>
        </div>
    );
}
