import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/store/ui.store';
import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MonthlyLimitProps {
    spent: number;
    // limit is now from store
    currency: string;
    isLoading: boolean;
}

export function MonthlyLimit({ spent, currency, isLoading }: MonthlyLimitProps) {
    const { monthlyLimit, setMonthlyLimit } = useUIStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(monthlyLimit.toString());

    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-xl" />;
    }

    const percentage = Math.min((spent / monthlyLimit) * 100, 100);

    const handleSave = () => {
        const val = parseFloat(editValue);
        if (!isNaN(val) && val > 0) {
            setMonthlyLimit(val);
        }
        setIsEditing(false);
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                    <span>Monthly Limit</span>
                    <span className="text-foreground">{percentage.toFixed(0)}%</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Progress value={percentage} className="h-3 mb-2" />
                <div className="flex justify-between items-end text-xs font-medium h-8">
                    <span className="text-foreground text-sm">{currency} {spent.toFixed(2)}</span>

                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground self-center">/ {currency}</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    className="h-6 w-16 text-xs px-1 py-0"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                    onBlur={handleSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                                <button onClick={handleSave} className="text-primary hover:text-primary/80">
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                <span className="group-hover:text-foreground transition-colors">{monthlyLimit}</span>
                                <Pencil size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                    {currency} {(monthlyLimit - spent).toFixed(2)} remaining
                </p>
            </CardContent>
        </Card>
    );
}
