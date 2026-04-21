import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Component/Header.tsx';
import { ExpertDashboard } from '../../services/expertDashboard.tsx';
import {userService}  from '../../services/userService.tsx';
import { type AccountProgress } from '../../models/AccountProgress';

interface Expert {
    firstname: string;
    lastname: string;
    email: string;
    picture: string;
    role: string;
}

interface Popup {
    show: boolean;
    type: 'profile' | 'availability' | 'break' | 'overrides' | null;
    message: string;
    action: string;
}

function Dashboard() {
    const navigate = useNavigate();
    const [expert, setExpert] = useState<Expert | null>(null);
    const [accountProgress, setAccountProgress] = useState<AccountProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [popup, setPopup] = useState<Popup>({
        show: false,
        type: null,
        message: '',
        action: ''
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

    useEffect(() => {
        // Get expert info from localStorage
        const firstname = localStorage.getItem('firstname');
        const lastname = localStorage.getItem('lastname');
        const email = localStorage.getItem('email');
        const picture = localStorage.getItem('picture');
        const userRole = localStorage.getItem('userRole');

        if (firstname && lastname && email && userRole) {
            setExpert({
                firstname,
                lastname,
                email,
                picture: picture || `https://ui-avatars.com/api/?name=${firstname}+${lastname}&background=6366f1&color=fff&size=128`,
                role: userRole
            });
        }

        // Fetch account progress
        const fetchAccountProgress = async () => {
            try {
                setLoading(true);
                const response = await ExpertDashboard.getAccountProgress();
                setAccountProgress(response.data.progress);

                // Check for critical missing items and show popups (only if not seen before)
                const popupSeen = localStorage.getItem('dashboard-popup-seen');
                const warnings = response.data.progress.warnings;
                const criticalWarnings = warnings.filter((w: any) => w.severity === 'critical');

                if (!popupSeen && criticalWarnings.length > 0) {
                    const warning = criticalWarnings[0];
                    if (warning.id === 'PROFILE_MISSING' || warning.id === 'PROFILE_INCOMPLETE') {
                        showPopup('profile', warning.message, 'Compléter le profil');
                    } else if (warning.id === 'AVAILABILITY_MISSING' || warning.id === 'AVAILABILITY_INCOMPLETE') {
                        showPopup('availability', warning.message, 'Configurer la disponibilité');
                    } else if (warning.id === 'BREAK_TIMES_MISSING') {
                        showPopup('break', warning.message, 'Configurer les pauses');
                    }
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch account progress:', err);
                setError('Failed to load account progress. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccountProgress();
    }, []);

    const showPopup = (type: 'profile' | 'availability' | 'break' | 'overrides', message: string, action: string) => {
        setPopup({
            show: true,
            type,
            message,
            action
        });
    };

    const closePopup = () => {
        localStorage.setItem('dashboard-popup-seen', 'true');
        setPopup({
            show: false,
            type: null,
            message: '',
            action: ''
        });
    };

    const handlePopupAction = () => {
        switch (popup.type) {
            case 'profile':
                closePopup();
                navigate('/myprofile');
                break;
            case 'availability':
            case 'break':
            case 'overrides':
                closePopup();
                navigate('/planification');
                break;
            default:
                closePopup();
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingPhoto(true);
            setPhotoUploadError(null);

            // Call the UserService updateMyPicture method
            const response = await userService.updateMyPicture(file);

            // Update localStorage with new picture
            if (response.user.picture) {
                localStorage.setItem('picture', response.user.picture);
                setExpert(prev => prev ? { ...prev, picture: response.user.picture } : null);
            }

            setUploadingPhoto(false);
        } catch (err) {
            console.error('Failed to upload photo:', err);
            setPhotoUploadError('Failed to upload photo. Please try again.');
            setUploadingPhoto(false);
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress === 100) return 'text-green-600';
        if (progress >= 75) return 'text-blue-600';
        if (progress >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getProgressBgColor = (progress: number) => {
        if (progress === 100) return 'bg-green-50';
        if (progress >= 75) return 'bg-blue-50';
        if (progress >= 50) return 'bg-amber-50';
        return 'bg-red-50';
    };

    const getSeverityIcon = (severity: string) => {
        const icons: { [key: string]: string } = {
            critical: '🚨',
            high: '⚠️',
            medium: '⚡',
            low: 'ℹ️',
            info: '✓'
        };
        return icons[severity] || '•';
    };

    const getSeverityBorder = (severity: string) => {
        const borders: { [key: string]: string } = {
            critical: 'border-l-red-500',
            high: 'border-l-orange-500',
            medium: 'border-l-amber-500',
            low: 'border-l-blue-500',
            info: 'border-l-slate-300'
        };
        return borders[severity] || 'border-l-slate-300';
    };

    const getSeverityBg = (severity: string) => {
        const bgs: { [key: string]: string } = {
            critical: 'bg-red-50',
            high: 'bg-orange-50',
            medium: 'bg-amber-50',
            low: 'bg-blue-50',
            info: 'bg-slate-50'
        };
        return bgs[severity] || 'bg-slate-50';
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                {/* Modal Popup */}
                {popup.show && (
                    <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                                {popup.type === 'profile' ? 'Profil incomplet' :
                                    popup.type === 'availability' ? 'Disponibilité non configurée' :
                                        popup.type === 'break' ? 'Heures de pause non configurées' :
                                            'Configuration manquante'}
                            </h3>
                            <p className="text-slate-600 text-center mb-6">
                                {popup.message}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handlePopupAction}
                                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {popup.action}
                                </button>
                                <button
                                    onClick={closePopup}
                                    className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-6">
                            {expert?.picture && (
                                <div className="relative">
                                    <img
                                        src={expert.picture}
                                        alt={`${expert.firstname} ${expert.lastname}`}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>
                            )}
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                                    Bienvenue, {expert?.firstname}! 👋
                                </h1>
                                <p className="text-slate-600 text-lg">
                                    Voici votre tableau de bord de configuration et d'activité
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                                </div>
                                <p className="text-slate-600 font-medium">Chargement de votre progression...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && accountProgress && (
                        <>
                            {/* Main Progress Section */}
                            <div className="mb-12">
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                            <span className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">📊</span>
                                            </span>
                                            Configuration du compte
                                        </h2>
                                    </div>

                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Progress Circle */}
                                            <div className="flex flex-col items-center justify-center lg:border-r border-slate-100 lg:pr-8">
                                                <div className="relative w-40 h-40 mb-6">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                        <circle
                                                            cx="80"
                                                            cy="80"
                                                            r="70"
                                                            fill="none"
                                                            stroke={accountProgress.totalProgress === 100 ? '#16a34a' : accountProgress.totalProgress >= 75 ? '#2563eb' : accountProgress.totalProgress >= 50 ? '#d97706' : '#dc2626'}
                                                            strokeWidth="8"
                                                            strokeDasharray={`${accountProgress.totalProgress * 4.4} 440`}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-500"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <div className={`text-5xl font-bold ${getProgressColor(accountProgress.totalProgress)}`}>
                                                            {accountProgress.totalProgress}%
                                                        </div>
                                                        <div className="text-sm text-slate-600 mt-2">Complété</div>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getProgressBgColor(accountProgress.totalProgress)}`}>
                                                    {accountProgress.setupStatus === 'complete' ? '✓ Complété' :
                                                        accountProgress.setupStatus === 'almost-complete' ? '⚙️ Presque là' :
                                                            accountProgress.setupStatus === 'in-progress' ? '🔄 En cours' : '📝 À démarrer'}
                                                </div>
                                            </div>

                                            {/* Breakdown Grid */}
                                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                                {/* Profile */}
                                                <div
                                                    onClick={() => accountProgress.breakdown.profile.completed ? null : navigate('/myprofile')}
                                                    className={`p-4 rounded-lg ${getProgressBgColor(accountProgress.breakdown.profile.progress)} border border-slate-200 ${!accountProgress.breakdown.profile.completed ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">👤</span>
                                                        {accountProgress.breakdown.profile.completed && <span className="text-green-600 text-lg">✓</span>}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900 mb-1">{accountProgress.breakdown.profile.progress}%</div>
                                                    <div className="text-xs text-slate-600 mb-2">Profil expert</div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${accountProgress.breakdown.profile.progress === 100 ? 'bg-green-600' : accountProgress.breakdown.profile.progress >= 75 ? 'bg-blue-600' : accountProgress.breakdown.profile.progress >= 50 ? 'bg-amber-600' : 'bg-red-600'}`}
                                                             style={{ width: `${accountProgress.breakdown.profile.progress}%` }}></div>
                                                    </div>
                                                </div>

                                                {/* Availability */}
                                                <div
                                                    onClick={() => accountProgress.breakdown.availability.completed ? null : navigate('/planification')}
                                                    className={`p-4 rounded-lg ${getProgressBgColor(accountProgress.breakdown.availability.progress)} border border-slate-200 ${!accountProgress.breakdown.availability.completed ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">📅</span>
                                                        {accountProgress.breakdown.availability.completed && <span className="text-green-600 text-lg">✓</span>}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900 mb-1">{accountProgress.breakdown.availability.progress}%</div>
                                                    <div className="text-xs text-slate-600 mb-2">Disponibilité</div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${accountProgress.breakdown.availability.progress === 100 ? 'bg-green-600' : accountProgress.breakdown.availability.progress >= 75 ? 'bg-blue-600' : accountProgress.breakdown.availability.progress >= 50 ? 'bg-amber-600' : 'bg-red-600'}`}
                                                             style={{ width: `${accountProgress.breakdown.availability.progress}%` }}></div>
                                                    </div>
                                                </div>

                                                {/* Break Times */}
                                                <div
                                                    onClick={() => accountProgress.breakdown.breakTimes.completed ? null : navigate('/planification')}
                                                    className={`p-4 rounded-lg ${getProgressBgColor(accountProgress.breakdown.breakTimes.progress)} border border-slate-200 ${!accountProgress.breakdown.breakTimes.completed ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">☕</span>
                                                        {accountProgress.breakdown.breakTimes.completed && <span className="text-green-600 text-lg">✓</span>}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900 mb-1">{accountProgress.breakdown.breakTimes.progress}%</div>
                                                    <div className="text-xs text-slate-600 mb-2">Heures de pause</div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${accountProgress.breakdown.breakTimes.progress === 100 ? 'bg-green-600' : accountProgress.breakdown.breakTimes.progress >= 75 ? 'bg-blue-600' : accountProgress.breakdown.breakTimes.progress >= 50 ? 'bg-amber-600' : 'bg-red-600'}`}
                                                             style={{ width: `${accountProgress.breakdown.breakTimes.progress}%` }}></div>
                                                    </div>
                                                </div>

                                                {/* Overrides */}
                                                <div
                                                    onClick={() => accountProgress.breakdown.overrides.completed ? null : navigate('/planification')}
                                                    className={`p-4 rounded-lg ${getProgressBgColor(accountProgress.breakdown.overrides.progress)} border border-slate-200 ${!accountProgress.breakdown.overrides.completed ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">⚙️</span>
                                                        {accountProgress.breakdown.overrides.completed && <span className="text-green-600 text-lg">✓</span>}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900 mb-1">{accountProgress.breakdown.overrides.progress}%</div>
                                                    <div className="text-xs text-slate-600 mb-2">Modifications</div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${accountProgress.breakdown.overrides.progress === 100 ? 'bg-green-600' : accountProgress.breakdown.overrides.progress >= 75 ? 'bg-blue-600' : accountProgress.breakdown.overrides.progress >= 50 ? 'bg-amber-600' : 'bg-red-600'}`}
                                                             style={{ width: `${accountProgress.breakdown.overrides.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Message */}
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            {accountProgress.criticalBlockers ? (
                                                <div className="flex gap-3 items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <span className="text-2xl">🚨</span>
                                                    <div>
                                                        <p className="font-semibold text-red-900 mb-1">Éléments critiques à compléter</p>
                                                        <p className="text-sm text-red-800">Vous avez des éléments obligatoires à configurer avant de pouvoir accepter des réservations.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <span className="text-2xl">✨</span>
                                                    <div>
                                                        <p className="font-semibold text-green-900 mb-1">Excellent travail!</p>
                                                        <p className="text-sm text-green-800">Votre compte est bien configuré. Vous pouvez maintenant accepter des réservations!</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warnings & Actions Section */}
                            {accountProgress.warnings && accountProgress.warnings.length > 0 && (
                                <div className="mb-12">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                        <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <span className="text-lg">📋</span>
                                        </span>
                                        À compléter
                                    </h2>

                                    <div className="space-y-4">
                                        {accountProgress.warnings.map((warning, index) => (
                                            <div key={index} className={`border-l-4 ${getSeverityBorder(warning.severity)} ${getSeverityBg(warning.severity)} rounded-lg p-6 border-r border-t border-b border-slate-200`}>
                                                <div className="flex gap-4">
                                                    <div className="text-2xl mt-1 flex-shrink-0">{getSeverityIcon(warning.severity)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-slate-900 mb-2">{warning.message}</h3>

                                                        {warning.action && (
                                                            <p className="text-sm text-slate-700 mb-3">
                                                                <span className="font-medium">Action:</span> {warning.action}
                                                            </p>
                                                        )}

                                                        {/* Detailed Info */}
                                                        <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                                                            {warning.daysOfWeek && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-500">📅</span>
                                                                    <span className="text-slate-700"><span className="font-medium">Jours:</span> {warning.daysOfWeek}</span>
                                                                </div>
                                                            )}
                                                            {warning.workingHours && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-500">⏰</span>
                                                                    <span className="text-slate-700"><span className="font-medium">Heures:</span> {warning.workingHours}</span>
                                                                </div>
                                                            )}
                                                            {warning.configuredDays !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-500">✓</span>
                                                                    <span className="text-slate-700"><span className="font-medium">Configuré:</span> {warning.configuredDays} jour(s)</span>
                                                                </div>
                                                            )}
                                                            {warning.count !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-slate-500">📊</span>
                                                                    <span className="text-slate-700"><span className="font-medium">Modifications:</span> {warning.count}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        {warning.progress !== undefined && warning.progress !== 100 && warning.progress > 0 && (
                                                            <div className="mt-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs font-medium text-slate-600">Progression</span>
                                                                    <span className="text-xs font-medium text-slate-600">{warning.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${warning.progress}%` }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-lg">👥</span>
                                        </span>
                                        Informations du compte
                                    </h2>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            {/* Name */}
                                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Nom complet</p>
                                                <p className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                                                    <span className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                                        {expert?.firstname?.charAt(0).toUpperCase()}
                                                    </span>
                                                    {expert?.firstname} {expert?.lastname}
                                                </p>
                                            </div>

                                            {/* Email */}
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Adresse email</p>
                                                <p className="text-lg font-semibold text-slate-900 flex items-center gap-3 mb-2">
                                                    <span className="text-xl">✓</span>
                                                    {expert?.email}
                                                </p>
                                                <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                                    Vérifié
                                                </span>
                                            </div>

                                            {/* Role */}
                                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                                                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Type de compte</p>
                                                <p className="text-lg font-semibold text-slate-900 mb-2">Expert</p>
                                                <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                                                    Premium
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Column - Profile Picture */}
                                        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-slate-200">
                                            <div className="relative mb-6">
                                                <img
                                                    src={expert?.picture}
                                                    alt={`${expert?.firstname} ${expert?.lastname}`}
                                                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium mb-4">Photo de profil</p>

                                            {photoUploadError && (
                                                <p className="text-xs text-red-600 mb-3 text-center">{photoUploadError}</p>
                                            )}

                                            <label className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    disabled={uploadingPhoto}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                                        if (input) input.click();
                                                    }}
                                                    disabled={uploadingPhoto}
                                                    className={`px-6 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-white rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {uploadingPhoto ? 'Téléchargement...' : 'Changer de photo'}
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-md transition-shadow">
                                    <span className="text-4xl mb-3 inline-block">⚡</span>
                                    <p className="text-slate-600 text-sm font-medium mb-2">Status</p>
                                    <p className="text-2xl font-bold text-slate-900">Actif</p>
                                </div>
                                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-md transition-shadow">
                                    <span className="text-4xl mb-3 inline-block">📋</span>
                                    <p className="text-slate-600 text-sm font-medium mb-2">Profil</p>
                                    <p className="text-2xl font-bold text-slate-900">À jour</p>
                                </div>
                                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-md transition-shadow">
                                    <span className="text-4xl mb-3 inline-block">🎯</span>
                                    <p className="text-slate-600 text-sm font-medium mb-2">Complétion</p>
                                    <p className="text-2xl font-bold text-slate-900">{accountProgress.totalProgress}%</p>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}

export default Dashboard;