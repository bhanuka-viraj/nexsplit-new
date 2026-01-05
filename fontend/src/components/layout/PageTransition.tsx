import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out ${className}`}>
            {children}
        </div>
    );
}
