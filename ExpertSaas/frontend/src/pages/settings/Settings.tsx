// pages/Settings.tsx
import { useState } from 'react';
import Header from '../../Component/Header.tsx';

function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [emailSent, setEmailSent] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const email=localStorage.getItem("email");
    const firstname=localStorage.getItem("firstname");
    const lastname=localStorage.getItem("lastname");
    const role=localStorage.getItem("role");
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const handleSendCode = async () => {
        if (!email) {
            setMessage({ type: 'error', text: 'Email non trouvé' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${backendURL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'envoi du code');
            }

            setEmailSent(true);
            setShowPasswordForm(true);
            setMessage({ type: 'success', text: 'Code envoyé à votre adresse email' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setMessage({ type: 'error', text: 'Email non trouvé' });
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${backendURL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: passwordForm.code,
                    newPassword: passwordForm.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du changement de mot de passe');
            }

            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });

            setTimeout(() => {
                setShowPasswordForm(false);
                setEmailSent(false);
                setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
                setMessage(null);
            }, 2000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const tabs = [
        { id: 'profile', name: 'Profil', icon: '👤' },
        { id: 'security', name: 'Sécurité', icon: '🔒' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'preferences', name: 'Préférences', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-600 mt-2">Gérez vos préférences et la sécurité de votre compte</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* User info */}
                            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                        {firstname?.[0]}{lastname?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {firstname} {lastname}
                                        </h3>
                                        <p className="text-sm text-gray-600">{email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation tabs */}
                            <nav className="p-4">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1 ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-xl">{tab.icon}</span>
                                        <span>{tab.name}</span>
                                        {activeTab === tab.id && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Prénom
                                                </label>
                                                <input
                                                    type="text"
                                                    value={firstname || ''}
                                                    disabled
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nom
                                                </label>
                                                <input
                                                    type="text"
                                                    value={lastname || ''}
                                                    disabled
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={email || ''}
                                                disabled
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rôle
                                            </label>
                                            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                                {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité du compte</h2>

                                    {/* Message */}
                                    {message && (
                                        <div className={`mb-6 p-4 rounded-lg ${
                                            message.type === 'success'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            {message.text}
                                        </div>
                                    )}

                                    {/* Change Password Section */}
                                    <div className="border border-gray-200 rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Mot de passe</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Changez votre mot de passe régulièrement pour sécuriser votre compte
                                                </p>
                                            </div>
                                            {!showPasswordForm && (
                                                <button
                                                    onClick={handleSendCode}
                                                    disabled={isLoading || emailSent}
                                                    className={`
                                                        px-4 py-2 rounded-lg font-medium transition-all
                                                        ${isLoading || emailSent
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }
                                                    `}
                                                >
                                                    {isLoading ? 'Envoi...' : emailSent ? 'Code envoyé' : 'Changer le mot de passe'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Password Change Form */}
                                        {showPasswordForm && (
                                            <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Code de vérification
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="code"
                                                        value={passwordForm.code}
                                                        onChange={handleInputChange}
                                                        placeholder="Entrez le code à 6 chiffres"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        maxLength={6}
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Code envoyé à {email}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nouveau mot de passe
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={passwordForm.newPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="••••••••"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirmer le mot de passe
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="••••••••"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                {/* Password strength indicator */}
                                                {passwordForm.newPassword && (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-1 h-1">
                                                            <div className={`flex-1 rounded-full ${
                                                                passwordForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                                                            }`} />
                                                            <div className={`flex-1 rounded-full ${
                                                                /[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                                            }`} />
                                                            <div className={`flex-1 rounded-full ${
                                                                /[0-9]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                                            }`} />
                                                            <div className={`flex-1 rounded-full ${
                                                                /[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                                                            }`} />
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Minimum 6 caractères, une majuscule, un chiffre et un caractère spécial
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
                                                    >
                                                        {isLoading ? 'Modification...' : 'Confirmer'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowPasswordForm(false);
                                                            setEmailSent(false);
                                                            setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
                                                            setMessage(null);
                                                        }}
                                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Last password change info */}
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                <span>Dernière modification : </span>
                                                <span className="font-medium">Il y a 2 semaines</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Two-factor authentication (placeholder) */}
                                    <div className="mt-6 border border-gray-200 rounded-xl p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Authentification à deux facteurs</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Ajoutez une couche de sécurité supplémentaire à votre compte
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                                                Configurer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Préférences de notifications</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-600">Page en construction...</p>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Préférences générales</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-600">Page en construction...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;