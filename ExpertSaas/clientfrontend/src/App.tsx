import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from "./pages/home/HomePage.tsx";
import ExpertsList from "./pages/experts/ExpertsList.tsx";
import ExpertView from "./pages/experts/ExpertView.tsx";
import Login from "./pages/auth/Login.tsx";
import { authService } from "./services/authService";
import MyMeetingView from "./pages/meeting/MyMeetingView.tsx";
import Calendar from "./pages/calendar/Calendar.tsx";
import JitsiRoom from "./pages/meeting/JitsiRoom.tsx";

const LoadingSpinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = authService.isLoggedIn();
            setIsAuthenticated(authenticated);

            if (!authenticated) {
                authService.logout();
            }
        };

        checkAuth();

        // Optional: Listen for storage events (if user logs out in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'isLoggedIn' || e.key === 'google_tokens') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (isAuthenticated === null) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/accueil"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/experts"
                    element={
                        <ProtectedRoute>
                            <ExpertsList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/expert/:id"
                    element={
                        <ProtectedRoute>
                            <ExpertView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meetings"
                    element={
                        <ProtectedRoute>
                            <MyMeetingView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meetings/:jitsiRoom"
                    element={
                        <ProtectedRoute>
                            <JitsiRoom />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/agenda"
                    element={
                        <ProtectedRoute>
                            <Calendar />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<RootRedirect />} />
            </Routes>
        </Router>
    );
}

const RootRedirect = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectTo, setRedirectTo] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthAndRedirect = () => {
            const isAuthenticated = authService.isLoggedIn();

            if (isAuthenticated) {
                setRedirectTo('/accueil');
            } else {
                authService.logout(); // Clean up any stale data
                setRedirectTo('/login');
            }

            setIsLoading(false);
        };

        checkAuthAndRedirect();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return <Navigate to={redirectTo || '/login'} replace />;
};

export default App;