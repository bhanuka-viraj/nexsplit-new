import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

export function SignUpPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <span className="font-bold text-2xl text-primary-foreground">N</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Sign up with Google to get started
                </p>
            </div>

            <div className="grid gap-6">
                {/* Email/Password Sign Up - Available in future version */}

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
                        useOneTap={!isLoading}
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
