import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            try {
                // Verify token by fetching current user
                // This acts as a session check
                await api.getCurrentUser();
                setIsLoading(false);
            } catch (error) {
                console.error('Auth verification failed', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/signin');
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
