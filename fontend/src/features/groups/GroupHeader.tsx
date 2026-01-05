import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupHeaderProps {
    name?: string;
    totalCost?: number;
    currency?: string;
    isLoading: boolean;
    hasImage?: boolean;
    transparent?: boolean;
}

export function GroupHeader({ name, totalCost, currency = '$', isLoading, transparent }: GroupHeaderProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 pt-6 px-1">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between ${transparent ? 'pt-2' : 'pt-6 pb-4 px-1'}`}>
            <Link
                to="/groups"
                className={`flex items-center justify-center p-2 rounded-full transition-all backdrop-blur-md ${transparent ? 'bg-black/20 hover:bg-black/40 text-white' : 'hover:bg-accent text-foreground'}`}
            >
                <ChevronLeft size={24} />
            </Link>

            {/* If transparent/immersive, we hide the title here and show it in the hero section instead */}
            {!transparent && (
                <div className="text-center">
                    <h1 className="text-xl font-bold tracking-tight">{name}</h1>
                </div>
            )}

            {/* Keep stats small or hidden if transparent, maybe just a total indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${transparent ? 'bg-black/20 text-white border-white/10' : 'bg-muted text-foreground border-transparent'}`}>
                Total: {currency}{totalCost?.toLocaleString()}
            </div>
        </div>
    );
}
