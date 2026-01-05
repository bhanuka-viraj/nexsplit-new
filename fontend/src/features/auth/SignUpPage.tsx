import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

// Validation Schema
const signUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export function SignUpPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpForm) => {
        setIsLoading(true);
        try {
            await api.signup(data.name, data.email, data.password);
            toast.success('Account created!');
            navigate('/');
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        // Mock Google Sign Up
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Account created successfully!');
            navigate('/');
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <span className="font-bold text-2xl text-primary-foreground">N</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your details to get started
                </p>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-6">
                    {/* Email Sign Up - Disabled for MVP
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...register('name')}
                                className="bg-background/50 backdrop-blur-sm"
                            />
                            {errors.name && (
                                <p className="text-xs text-rose-500">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...register('email')}
                                className="bg-background/50 backdrop-blur-sm"
                            />
                            {errors.email && (
                                <p className="text-xs text-rose-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                {...register('password')}
                                className="bg-background/50 backdrop-blur-sm"
                            />
                            {errors.password && (
                                <p className="text-xs text-rose-500">{errors.password.message}</p>
                            )}
                        </div>
                        <Button disabled={isLoading} className="h-11 shadow-lg shadow-primary/20">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign Up with Email
                        </Button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                */}

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                    setIsLoading(true);
                                    try {
                                        await api.verifyGoogleToken(credentialResponse.credential);
                                        toast.success('Account created!');
                                        navigate('/');
                                    } catch (error) {
                                        toast.error('Google Sign Up failed');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }
                            }}
                            onError={() => {
                                toast.error('Google Sign Up failed');
                            }}
                            theme="outline"
                            type="standard"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                            width="350"
                        />
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/signin" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            );
}
