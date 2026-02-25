import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthResponse {
    message: string;
    token: string;
    expiresIn: number;
    role: string;
    isActive: boolean;
}

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!formData.email || !formData.password) {
                throw new Error('Veuillez remplir tous les champs');
            }

            const response = await fetch(`${backendURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('isActive', String(data.isActive));
            console.log("data"+localStorage.getItem('token'))

            const expirationTime = Date.now() + (data.expiresIn * 1000);
            localStorage.setItem('tokenExpiration', expirationTime.toString());

            if (data.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Échec de la connexion. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-5">
            <div className="max-w-md w-full bg-white rounded-2xl p-10 shadow-2xl relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-4 text-4xl">
                        📅
                    </div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ExpertFlow
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Connectez-vous à votre espace
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="expert@exemple.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                            w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-3
                            transition-all duration-300
                            ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        }
                        `}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Connexion...</span>
                            </>
                        ) : (
                            <>
                                <span>Se connecter</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>
                {/* Features */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>📆</span>
                        <span>Planification d’événements personnalisés</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🎥</span>
                        <span>Création et gestion de réunions en ligne</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>Organisation optimisée du temps</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>📊</span>
                        <span>Tableau de bord professionnel</span>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    En vous connectant, vous acceptez nos{' '}
                    <a href="/terms" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                        conditions d'utilisation
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Login;