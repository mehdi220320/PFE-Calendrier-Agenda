import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

interface Expert {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    picture: string;
    isActive: boolean;
}

interface AuthResponse {
    message: string;
    token: string;
    expiresIn: number;
    expert: Expert;
}

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const expertData = localStorage.getItem('expert');

        if (token && expertData) {
            verifyExistingToken(token);
        }
    }, []);

    const verifyExistingToken = async (token: string) => {
        try {
            const response = await fetch(`${backendURL}/api/auth/check-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.valid) {
                navigate('/dashboard');
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('expert');
                localStorage.removeItem('tokenExpiration');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('expert');
            localStorage.removeItem('tokenExpiration');
        }
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Got token from Google, exchanging for ID token...');

                // Exchange the access token for user info using Google's API
                const userInfoResponse = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`
                        }
                    }
                );

                if (!userInfoResponse.ok) {
                    throw new Error('Failed to get user info');
                }

                const userInfo = await userInfoResponse.json();
                console.log('User info:', userInfo);

                // Create a mock ID token or send user info directly
                const response = await fetch(`${backendURL}/api/auth/google-auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userInfo: {
                            email: userInfo.email,
                            given_name: userInfo.given_name,
                            family_name: userInfo.family_name,
                            picture: userInfo.picture,
                            sub: userInfo.sub
                        }
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Authentication failed');
                }

                const data: AuthResponse = await response.json();

                // Store token and expert data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('expert', JSON.stringify(data.expert));

                // Set expiration time
                const expirationTime = Date.now() + (data.expiresIn * 1000);
                localStorage.setItem('tokenExpiration', expirationTime.toString());

                console.log('Login successful, redirecting...');

                // Redirect to dashboard
                navigate('/dashboard');

            } catch (error: any) {
                console.error('Login error:', error);
                setError(error.message || 'Failed to authenticate. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google login error:', errorResponse);
            setError('Google authentication failed. Please try again.');
        },
        flow: 'implicit',
        scope: 'openid email profile',
    });

    // Modern color palette
    const colors = {
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        secondary: '#8b5cf6',
        background: '#f9fafb',
        surface: '#ffffff',
        text: '#1f2937',
        textLight: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${colors.background} 0%, #e5e7eb 100%)`,
                padding: '20px'
            }}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: colors.surface,
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative gradient background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                }} />

                {/* Logo and Title */}
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '40px'
                    }}>
                        📅
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        margin: '0 0 8px',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ExpertFlow
                    </h1>
                    <p style={{
                        color: colors.textLight,
                        fontSize: '14px',
                        margin: 0
                    }}>
                        Connectez-vous pour gérer votre agenda
                    </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: `${colors.error}10`,
                            color: colors.error,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: `1px solid ${colors.error}20`
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {/* Google Login Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginBottom: '24px' }}
                >
                    <button
                        onClick={() => login()}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: isLoading ? '#f3f4f6' : 'white',
                            color: isLoading ? colors.textLight : colors.text,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s',
                            boxShadow: isLoading ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid #e5e7eb',
                                    borderTopColor: colors.primary,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Se connecter avec Google
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Features List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        marginTop: '32px',
                        padding: '24px',
                        backgroundColor: `${colors.primary}05`,
                        borderRadius: '16px'
                    }}
                >
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.text,
                        margin: '0 0 16px',
                        textAlign: 'center'
                    }}>
                        Après connexion, vous pourrez :
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { icon: '📆', text: 'Voir votre calendrier' },
                            { icon: '📋', text: 'Gérer vos événements' },
                            { icon: '⏰', text: 'Définir vos disponibilités' },
                            { icon: '📹', text: 'Créer des Google Meet' }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + (index * 0.1) }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: colors.textLight,
                                    fontSize: '14px'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{feature.icon}</span>
                                <span>{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: colors.textLight
                    }}
                >
                    En vous connectant, vous acceptez nos{' '}
                    <a href="/terms" style={{ color: colors.primary, textDecoration: 'none' }}>
                        conditions d'utilisation
                    </a>
                </motion.div>
            </motion.div>

            {/* Add keyframe animation for spinner */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
}

export default Login;