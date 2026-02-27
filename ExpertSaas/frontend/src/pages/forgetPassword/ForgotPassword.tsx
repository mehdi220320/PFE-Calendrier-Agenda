import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!email) {
                throw new Error('Veuillez saisir votre email');
            }

            const response = await fetch(`${backendURL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            setSuccess('Un code de réinitialisation a été envoyé à votre adresse email');

            // Rediriger vers la page de réinitialisation après 2 secondes
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);

        } catch (error: any) {
            console.error('Forgot password error:', error);
            setError(error.message || 'Échec de l\'envoi. Veuillez réessayer.');
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
                    <button
                        onClick={() => navigate('/login')}
                        className="absolute left-6 top-6 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                        ← Retour
                    </button>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-4 text-4xl">
                        🔐
                    </div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ExpertFlow
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Réinitialisation du mot de passe
                    </p>
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

                {/* Forgot Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="expert@exemple.com"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                        Nous vous enverrons un code de confirmation pour réinitialiser votre mot de passe
                    </p>

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
                                <span>Envoi en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Envoyer le code</span>
                                <span>✉️</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Help text */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;