import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

import { useUIStore } from '@/store/ui.store';

export function GroupsListPage() {
    const { openCreateGroup } = useUIStore();
    const { data: groups, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: api.getGroups,
    });

    return (
        <PageTransition className="px-6 pt-8 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
                <button
                    onClick={openCreateGroup}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/25"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}

                {groups?.map((group) => (
                    <Link key={group.id} to={`/groups/${group.id}`}>
                        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transform-gpu will-change-transform [backface-visibility:hidden] [mask-image:radial-gradient(white,black)] ring-1 ring-transparent hover:ring-primary/20">
                            {/* Image Header */}
                            <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                                {group.imageUrl ? (
                                    <img
                                        src={group.imageUrl}
                                        alt={group.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                        <Users className="h-12 w-12 text-primary/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-xl font-bold text-white mb-1 leading-tight">{group.name}</h2>
                                    <p className="text-white/80 text-xs font-medium">
                                        {group.members.length} members
                                    </p>
                                </div>

                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white border border-white/10">
                                    {group.currency}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {group.members.slice(0, 4).map(m => (
                                        <img key={m.id} src={m.avatarUrl} alt={m.name} className="h-8 w-8 rounded-full border-2 border-card" />
                                    ))}
                                    {group.members.length > 4 && (
                                        <div className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                                            +{group.members.length - 4}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Spent</p>
                                    <p className="font-bold text-lg text-foreground">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: group.currency }).format(group.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </PageTransition>
    );
}
