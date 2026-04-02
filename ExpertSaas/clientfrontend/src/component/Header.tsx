import { useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Calendar, Video, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;


    const getUserId = () => {
        try {
            return localStorage.getItem('user');
        } catch (error) {
            console.error('Error getting userId:', error);
        }
        return null;
    };

    const userId = getUserId();

    return (
        <header className="fixed top-0 left-0 right-0 bg-white z-50">
            <div className="bg-gray-70">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="flex items-center justify-end py-2">
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/accueil"
                                className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                                    isActive('/accueil') || isActive('/experts')
                                        ? 'text-blue-600 bg-blue-100'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-200'
                                }`}
                            >
                                <Briefcase className="h-4 w-4" />
                                <span>Dashboard</span>
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

                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                            <NotificationBell userId={userId} />

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