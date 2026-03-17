import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/auth`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const tokens = authService.getTokens();
    if (tokens) {
        try {
            const parsedTokens = JSON.parse(tokens);
            if (parsedTokens.access_token) {
                config.headers.Authorization = `Bearer ${parsedTokens.access_token}`;
            }
        } catch (error) {
            console.error('Error parsing tokens:', error);
        }
    }
    return config;
});


interface MessageData {
    type: 'GOOGLE_LOGIN_SUCCESS' | 'GOOGLE_LOGIN_ERROR';
    tokens?: string;
    error?: string;
}

export const authService = {
    loginWithGoogle(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            // Generate a unique state parameter for security
            const state = Math.random().toString(36).substring(7);
            localStorage.setItem('oauth_state', state);

            const popup = window.open(
                `${backendURL}/api/auth/google?state=${state}`,
                'google-login',
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
            );

            if (!popup) {
                reject(new Error('Popup blocked. Please allow popups for this site.'));
                return;
            }

            // Listen for messages from the popup
            const messageHandler = (event: MessageEvent<MessageData>) => {
                // Verify the origin for security
                if (event.origin !== window.location.origin) return;

                const { type, tokens, error } = event.data;

                if (type === 'GOOGLE_LOGIN_SUCCESS') {
                    window.removeEventListener('message', messageHandler);
                    clearInterval(checkPopupClosed);

                    if (tokens) {
                        try {
                            // Validate that tokens is a valid JSON string
                            JSON.parse(tokens);
                            localStorage.setItem('google_tokens', tokens);
                            localStorage.setItem('isLoggedIn', 'true');
                            resolve(true);
                        } catch (e) {
                            reject(new Error('Invalid token data received'));
                        }
                    } else {
                        reject(new Error('No tokens received'));
                    }

                } else if (type === 'GOOGLE_LOGIN_ERROR') {
                    window.removeEventListener('message', messageHandler);
                    clearInterval(checkPopupClosed);
                    reject(new Error(error || 'Authentication failed'));
                }
            };

            window.addEventListener('message', messageHandler);

            // Check if popup was closed manually
            const checkPopupClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopupClosed);
                    window.removeEventListener('message', messageHandler);

                    // Only reject if we're not already logged in
                    if (!authService.isLoggedIn()) {
                        reject(new Error('Login cancelled.'));
                    }
                }
            }, 500);

            // Timeout after 5 minutes
            setTimeout(() => {
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', messageHandler);
                if (!authService.isLoggedIn() && !popup.closed) {
                    popup.close();
                    reject(new Error('Login timeout. Please try again.'));
                }
            }, 300000);
        });
    },

    handleOAuthCallback(): void {
        const params = new URLSearchParams(window.location.search);
        const connected = params.get('connected');
        const errorParam = params.get('error');
        const tokens = params.get('tokens');
        const state = params.get('state');
        const storedState = localStorage.getItem('oauth_state');

        // Verify state parameter to prevent CSRF
        if (state && storedState && state !== storedState) {
            console.error('State mismatch - possible CSRF attack');
            if (window.opener) {
                window.opener.postMessage({
                    type: 'GOOGLE_LOGIN_ERROR',
                    error: 'Security validation failed'
                }, window.location.origin);
            }
            window.close();
            return;
        }

        // Clear the state
        localStorage.removeItem('oauth_state');

        if (errorParam === 'auth_failed') {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'GOOGLE_LOGIN_ERROR',
                    error: 'Authentication failed. Please try again.'
                }, window.location.origin);
            }
            window.close();
            return;
        }

        if (connected === 'true' && tokens) {
            try {
                // Validate token format
                const parsedTokens = JSON.parse(decodeURIComponent(tokens));
                if (!parsedTokens.access_token) {
                    throw new Error('Invalid token format');
                }

                // Store tokens
                localStorage.setItem('google_tokens', tokens);
                localStorage.setItem('isLoggedIn', 'true');

                if (window.opener) {
                    window.opener.postMessage({
                        type: 'GOOGLE_LOGIN_SUCCESS',
                        tokens: tokens
                    }, window.location.origin);
                }

                // Close the popup after a short delay to ensure message is sent
                setTimeout(() => {
                    window.close();
                }, 100);
            } catch (error) {
                console.error('Error processing tokens:', error);
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'Invalid token data received'
                    }, window.location.origin);
                }
                window.close();
            }
        } else if (errorParam) {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'GOOGLE_LOGIN_ERROR',
                    error: errorParam
                }, window.location.origin);
            }
            window.close();
        }
    },

    logout(): void {
        localStorage.removeItem('google_tokens');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('oauth_state');
    },

    isLoggedIn(): boolean {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const tokensString = localStorage.getItem('google_tokens');

        if (isLoggedIn && tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
                    console.log('Token expired, logging out');
                    this.logout();
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error parsing tokens:', error);
                return false;
            }
        }
        return false;
    },

    getTokens(): string | null {
        return localStorage.getItem('google_tokens');
    },

    getAccessToken(): string | null {
        const tokensString = localStorage.getItem('google_tokens');
        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                return tokens.access_token || null;
            } catch (error) {
                console.error('Error parsing tokens:', error);
                return null;
            }
        }
        return null;
    },
    getTokenExpiry(): number | null {
        const tokensString = localStorage.getItem('google_tokens');
        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                return tokens.expiry_date || null;
            } catch (error) {
                console.error('Error parsing tokens:', error);
                return null;
            }
        }
        return null;
    },
    async refreshToken(): Promise<boolean> {
        authService.logout();
        return false;
    },

    api,
};