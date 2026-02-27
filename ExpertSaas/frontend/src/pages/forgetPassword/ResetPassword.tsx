import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
    const [formData, setFormData] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        if (timeLeft <= 0) {
            setTimeout(() => {
                navigate('/forgot-password');
            }, 3000);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    // Formater le temps restant
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

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
        setSuccess(null);

        try {
            if (!email) {
                throw new Error('Email non trouvé. Veuillez recommencer le processus.');
            }

            if (!formData.code || !formData.newPassword || !formData.confirmPassword) {
                throw new Error('Veuillez remplir tous les champs');
            }

            if (formData.newPassword.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }

            if (formData.newPassword !== formData.confirmPassword) {
                throw new Error('Les mots de passe ne correspondent pas');
            }

            const response = await fetch(`${backendURL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code: formData.code,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Échec de la réinitialisation');
            }

            setSuccess('Mot de passe réinitialisé avec succès !');

            // Rediriger vers la page de connexion après 2 secondes
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            console.error('Reset password error:', error);
            setError(error.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    // Si le temps est écoulé
    if (timeLeft <= 0) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-5">
                <div className="max-w-md w-full bg-white rounded-2xl p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />

                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-4xl">
                            ⏰
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Code expiré
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Le délai de 5 minutes est écoulé. Veuillez demander un nouveau code.
                        </p>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            Renvoyer un code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-5">
            <div className="max-w-md w-full bg-white rounded-2xl p-10 shadow-2xl relative overflow-hidden">
                {/* Top gradient bar with timer indicator */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

                {/* Timer */}
                <div className="absolute top-4 right-6 flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                    <span className="text-indigo-600 font-semibold">
                        ⏱️ {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="absolute left-6 top-6 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                        ← Retour
                    </button>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-4 text-4xl">
                        🔑
                    </div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ExpertFlow
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Nouveau mot de passe
                    </p>
                    {email && (
                        <p className="text-xs text-indigo-600 mt-2">
                            Code envoyé à : {email}
                        </p>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm text-center border border-green-100">
                        {success}
                    </div>
                )}

                {/* Reset Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Code Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Code de confirmation
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="Entrez le code à 6 chiffres"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                            disabled={isLoading}
                            maxLength={6}
                            required
                        />
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
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

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
                            >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Password strength indicator */}
                    {formData.newPassword && (
                        <div className="space-y-1">
                            <div className="flex gap-1 h-1">
                                <div className={`flex-1 rounded-full ${
                                    formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                                <div className={`flex-1 rounded-full ${
                                    /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                                <div className={`flex-1 rounded-full ${
                                    /[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                                <div className={`flex-1 rounded-full ${
                                    /[^A-Za-z0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                            </div>
                            <p className="text-xs text-gray-500">
                                Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial
                            </p>
                        </div>
                    )}

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
                                <span>Réinitialisation...</span>
                            </>
                        ) : (
                            <>
                                <span>Réinitialiser le mot de passe</span>
                                <span>✓</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Resend code option */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        Renvoyer le code
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;