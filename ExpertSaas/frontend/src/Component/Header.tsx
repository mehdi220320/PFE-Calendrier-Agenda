import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

    const isActive = (path: string) => location.pathname === path;

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
                            to="/meetings"
                            className="text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Réunions
                            </span>
                        </Link>

                        <Link
                            to="/complaints"
                            className="text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Réclamations
                            </span>
                        </Link>
                    </div>
                )}

                {/* Right side - Profile menu with dropdown */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    {isAuthenticated ? (
                        <div className="relative">
                            {/* Profile button */}
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                    <span className="text-sm font-medium">JD</span>
                                </div>
                                <span className="flex items-center gap-1">
                                    John Doe
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
                                            <p className="text-sm font-medium text-gray-900">John Doe</p>
                                            <p className="text-xs text-gray-500 truncate">john.doe@example.com</p>
                                        </div>

                                        {/* Menu items */}
                                        <div className="py-1">
                                            {/* Profile */}
                                            <button
                                                onClick={() => {
                                                    navigate('/profile');
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

            {/* Mobile menu dialog - reste identique */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* ... le code mobile existant ... */}
                </div>
            )}
        </header>
    );
}

export default Header;