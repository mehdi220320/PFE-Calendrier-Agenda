import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expert');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
    };

    const isAuthenticated = !!localStorage.getItem('token');

    const getUserId = () => {
        try {
            return localStorage.getItem('user');
        } catch (error) {
            console.error('Error getting userId:', error);
        }
        return null;
    };

    const userId = getUserId();

    const isActive = (path: string) => location.pathname === path;

    // Get user name from localStorage or use default
    const getUserName = () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                return userData.name || userData.email || 'User';
            }
        } catch (error) {
            console.error('Error getting user name:', error);
        }
        return 'John Doe';
    };

    const getUserEmail = () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                return userData.email || 'user@example.com';
            }
        } catch (error) {
            console.error('Error getting user email:', error);
        }
        return 'john.doe@example.com';
    };

    const getUserInitials = () => {
        const name = getUserName();
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const userName = getUserName();
    const userEmail = getUserEmail();
    const userInitials = getUserInitials();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5">
                        <span className="sr-only">ExpertFlow</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📅</span>
                            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                ExpertFlow
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg
                            className="size-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                {/* Desktop menu - Only show when authenticated */}
                {isAuthenticated && (
                    <div className="hidden lg:flex lg:gap-x-8">
                        <Link
                            to="/dashboard"
                            className={`text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-colors ${
                                isActive('/dashboard')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </span>
                        </Link>

                        <Link
                            to="/calendar"
                            className={`text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-colors ${
                                isActive('/calendar')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Agenda
                            </span>
                        </Link>

                        <Link
                            to="/planification"
                            className={`text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-colors ${
                                isActive('/planification') || isActive('/myavailability')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
                                </svg>
                                Planification
                            </span>
                        </Link>

                        <Link
                            to="/mymeetings"
                            className={`text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-colors ${
                                isActive('/mymeetings')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Réunions
                            </span>
                        </Link>

                        {/* Messenger Button */}
                        <Link
                            to="/messenger"
                            className={`text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-colors ${
                                isActive('/messenger')
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Messenger
                            </span>
                        </Link>


                    </div>
                )}

                {/* Right side - Notification Bell and Profile menu */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            {userId && <NotificationBell userId={userId} />}

                            {/* Profile menu with dropdown */}
                            <div className="relative">
                                {/* Profile button */}
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                        <span className="text-sm font-medium">{userInitials}</span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        {userName}
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>

                                {/* Dropdown menu */}
                                {isProfileMenuOpen && (
                                    <>
                                        {/* Backdrop click outside */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        />

                                        {/* Dropdown panel */}
                                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 overflow-hidden">
                                            {/* User info header */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{userName}</p>
                                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                            </div>

                                            {/* Menu items */}
                                            <div className="py-1">
                                                {/* Profile */}
                                                <button
                                                    onClick={() => {
                                                        navigate('/myprofile');
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                                                >
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>Mon profil</span>
                                                </button>

                                                {/* Settings */}
                                                <button
                                                    onClick={() => {
                                                        navigate('/settings');
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                                                >
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>Paramètres</span>
                                                </button>

                                                {/* Messenger in dropdown */}
                                                <button
                                                    onClick={() => {
                                                        navigate('/reclamation');
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>

                                                    <span>Réclamations</span>
                                                </button>

                                                {/* Divider */}
                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Logout */}
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                                                >
                                                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Déconnexion</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Connexion
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile menu dialog - Complete with all buttons */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile menu panel */}
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl transition-transform transform">
                        <div className="flex flex-col h-full">
                            {/* Header with close button */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📅</span>
                                    <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        ExpertFlow
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Navigation links */}
                            <div className="flex-1 overflow-y-auto py-6">
                                {isAuthenticated ? (
                                    <div className="space-y-1 px-4">
                                        {/* User info section */}
                                        <div className="flex items-center gap-3 px-3 py-4 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                                <span className="text-sm font-medium">{userInitials}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                            </div>
                                        </div>

                                        {/* Dashboard */}
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors ${
                                                isActive('/dashboard')
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Dashboard
                                        </Link>

                                        {/* Agenda */}
                                        <Link
                                            to="/calendar"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors ${
                                                isActive('/calendar')
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Agenda
                                        </Link>

                                        {/* Planification */}
                                        <Link
                                            to="/planification"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors ${
                                                isActive('/planification') || isActive('/myavailability')
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="8" strokeWidth={2} />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
                                            </svg>
                                            Planification
                                        </Link>

                                        {/* Réunions */}
                                        <Link
                                            to="/mymeetings"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors ${
                                                isActive('/mymeetings')
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Réunions
                                        </Link>

                                        {/* Messenger */}
                                        <Link
                                            to="/messenger"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 text-base font-semibold rounded-lg transition-colors ${
                                                isActive('/messenger')
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Messenger
                                        </Link>



                                        {/* Divider */}
                                        <div className="border-t border-gray-200 my-4"></div>

                                        {/* Profile Settings */}
                                        <button
                                            onClick={() => {
                                                navigate('/myprofile');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Mon profil
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigate('/settings');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Paramètres
                                        </button>

                                        {/* Logout button */}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-3 text-base font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Déconnexion
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-4 space-y-4">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Connexion
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            Inscription
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;