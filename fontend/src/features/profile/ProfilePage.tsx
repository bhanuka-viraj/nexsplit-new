import { useUIStore } from '@/store/ui.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

import { PageTransition } from '@/components/layout/PageTransition';

export function ProfilePage() {
    const { theme, setTheme } = useUIStore();

    return (
        <PageTransition className="px-6 pt-8 space-y-6 w-full max-w-xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Theme</Label>
                        <div className="flex bg-muted p-1 rounded-full">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Sun size={16} />
                                Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Moon size={16} />
                                Dark
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm opacity-50">
            </Card>

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
