import { ActivityFeed } from './ActivityFeed';
import { PageTransition } from '@/components/layout/PageTransition';

export function ActivityPage() {
    return (
        <PageTransition className="px-6 pt-8 space-y-6 w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
                {/* Could add filters later */}
            </div>

            <ActivityFeed />
        </PageTransition>
    );
}
