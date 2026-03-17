import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Briefcase, Calendar, Video, Menu, X, ChevronDown, MessageCircle, ThumbsUp, UserPlus, Clock } from 'lucide-react';
import {authService} from "../services/authService.tsx";

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const location = useLocation();
    const notificationRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = [
        {
            id: 1,
            type: 'like',
            icon: ThumbsUp,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            message: 'Marie Dupont a aimé votre publication',
            time: '5 min',
            read: false
        },
        {
            id: 2,
            type: 'comment',
            icon: MessageCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            message: 'Pierre Martin a commenté votre article',
            time: '15 min',
            read: false
        },
        {
            id: 3,
            type: 'invitation',
            icon: UserPlus,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            message: "Sophie Bernard souhaite rejoindre votre réseau",
            time: '1 heure',
            read: true
        },
        {
            id: 4,
            type: 'reminder',
            icon: Clock,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            message: 'Réunion d\'équipe dans 30 minutes',
            time: '30 min',
            read: true
        }
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const logout = ()=> authService.logout();
    return (
        <header className="fixed top-0 left-0 right-0 bg-white z-50">
            {/* Header content with bg-gray-50 */}
            <div className="bg-gray-70">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="flex items-center justify-end py-2">
                        {/* All elements aligned to the right */}
                        <div className="flex items-center space-x-3">
                            {/* Navigation Links with Icons */}
                            <Link
                                to="/accueil"
                                className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                                    isActive('/accueil') || isActive('/experts')
                                        ? 'text-blue-600 bg-blue-100'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
                                }`}
                            >
                                <Briefcase className="h-4 w-4" />
                                <span>Offres d'emploi</span>
                            </Link>

                            <Link
                                to="/agenda"
                                className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                                    isActive('/agenda')
                                        ? 'text-blue-600 bg-blue-100'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>Mon Agenda</span>
                            </Link>

                            <Link
                                to="/meetings"
                                className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                                    isActive('/meetings')
                                        ? 'text-blue-600 bg-blue-100'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
                                }`}
                            >
                                <Video className="h-4 w-4" />
                                <span>Mes Réunions</span>
                            </Link>

                            {/* Divider */}
                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                            {/* Notification Button with Facebook-style dropdown */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="relative flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-200"
                                >
                                    <Bell className="h-4 w-4" />
                                    <ChevronDown className={`h-3 w-3 transition-transform ${isNotificationsOpen ? 'rotate-180' : ''}`} />
                                    {/* Notification badge with count */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Facebook-style Notifications Dropdown */}
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                                            <h3 className="font-semibold text-gray-700">Notifications</h3>
                                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                                Marquer tout comme lu
                                            </button>
                                        </div>

                                        {/* Notifications List */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notification) => {
                                                const IconComponent = notification.icon;
                                                return (
                                                    <div
                                                        key={notification.id}
                                                        className={`flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${
                                                            !notification.read ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <div className={`flex-shrink-0 w-8 h-8 ${notification.iconBg} rounded-full flex items-center justify-center`}>
                                                            <IconComponent className={`h-4 w-4 ${notification.iconColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">Il y a {notification.time}</p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                            <Link
                                                to="/notifications-page"
                                                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                onClick={() => setIsNotificationsOpen(false)}
                                            >
                                                Voir toutes les notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-200"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-0 H-px bg-white" />
        </header>
    );
}

export default Header;