import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { PageTransition } from '@/components/layout/PageTransition';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProfilePage() {
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const updatePreferencesMutation = useMutation({
        mutationFn: (preferences: { currency?: string; monthlyLimit?: number }) =>
            api.updatePreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Preferences updated');
        },
        onError: () => {
            toast.error('Failed to update preferences');
        }
    });

    const handleCurrencyChange = (currency: string) => {
        updatePreferencesMutation.mutate({ currency });
    };

    return (
        <PageTransition className="px-6 pt-8 space-y-6 w-full max-w-xl mx-auto pb-20">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            {/* Currency Selector */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Currency</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label>Preferred Currency</Label>
                        <Select
                            value={user?.currency || 'USD'}
                            onValueChange={handleCurrencyChange}
                            disabled={updatePreferencesMutation.isPending}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Theme Selector */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Theme</Label>
                        <div className="flex bg-muted p-1 rounded-full">
                            <button
                                onClick={() => {
                                    document.documentElement.classList.remove('dark');
                                    document.documentElement.classList.add('light');
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:text-foreground"
                            >
                                <Sun size={16} />
                                Light
                            </button>
                            <button
                                onClick={() => {
                                    document.documentElement.classList.remove('light');
                                    document.documentElement.classList.add('dark');
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:text-foreground"
                            >
                                <Moon size={16} />
                                Dark
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
                variant="outline"
                className="w-full bg-white text-black hover:bg-gray-100 border-gray-200 h-9 justify-center font-medium mt-auto md:hidden"
                onClick={async () => {
                    await api.logout();
                    window.location.href = '/signin';
                }}
            >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Log out
            </Button>
        </PageTransition>
    );
}
