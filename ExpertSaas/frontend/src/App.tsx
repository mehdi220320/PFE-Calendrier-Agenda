import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authService } from './services/authservice.tsx';

import Login from './pages/login/Login.tsx';
import ForgotPassword from './pages/forgetPassword/ForgotPassword.tsx';
import ResetPassword from './pages/forgetPassword/ResetPassword.tsx';
import Settings from './pages/settings/Settings.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import CalendarPage from "./pages/calendar/Calendar.tsx";
import PlanificationPage from "./pages/calendar/PlanificationPage.tsx";
import AvailabilityPage from "./pages/calendar/AvailabilityPage.tsx";
import MyMeetingView from "./pages/meeting/MyMeetingView.tsx";
import JitsiRoom from "./pages/meeting/JitsiRoom.tsx";
import MyProfilePage from "./pages/myProfile/MyProfilePage.tsx";
import Messenger from "./pages/messenger/Messenger.tsx";
import NotesPage from "./pages/note/NotesPage.tsx";
import UserReclamationsPage from "./pages/reclamation/UserReclamationsPage.tsx";
import DocumentPage from "./pages/document/DocumentPage.tsx";

const Users = lazy(() => import('./admin/pages/users/Users.tsx'));
const Meetings = lazy(() => import('./admin/pages/Meetings.tsx'));
const AdminReclamationsPage = lazy(() => import('./admin/pages/reclamation/AdminReclamationsPage.tsx'));
const CategoriesManagement = lazy(() => import('./admin/pages/categories/CategoriesManagement.tsx'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard.tsx'));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

// Component to handle token expiration check
const TokenExpirationChecker = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkTokenExpiration = () => {
            if (!authService.isAuthenticated() && authService.getToken()) {
                // Token exists but is expired
                console.log('Token expired, logging out...');
                authService.logout();
                navigate('/login', { replace: true });
            }
        };

        // Check immediately
        checkTokenExpiration();

        // Set up interval to check every minute
        const interval = setInterval(checkTokenExpiration, 60000);

        // Also check when component mounts and when location changes
        return () => clearInterval(interval);
    }, [navigate, location]);

    return <>{children}</>;
};

// Role-based route guard
const RoleBasedRoute = ({
                            children,
                            allowedRoles
                        }: {
    children: JSX.Element;
    allowedRoles: string | string[];
}) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!userRole || !roles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'expert') {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Protected route for authenticated users only (no role check)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route wrapper - redirects to dashboard if already authenticated
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (isAuthenticated) {
        // Redirect to appropriate dashboard if already logged in
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'expert') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

// Root redirect based on authentication and role
const RootRedirect = () => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (isAuthenticated) {
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'expert') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Navigate to="/login" replace />;
};

// Main App component with auth wrapper
function AppContent() {
    return (
        <TokenExpirationChecker>
            <Routes>
                {/* Public Routes - Redirect to dashboard if already logged in */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                } />
                <Route path="/reset-password" element={
                    <PublicRoute>
                        <ResetPassword />
                    </PublicRoute>
                } />

                {/* Expert Routes (Normal User) */}
                <Route path="/dashboard" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <Dashboard />
                    </RoleBasedRoute>
                } />
                <Route path="/planification" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <PlanificationPage />
                    </RoleBasedRoute>
                } />
                <Route path="/calendar" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <CalendarPage />
                    </RoleBasedRoute>
                } />
                <Route path="/myavailability" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <AvailabilityPage />
                    </RoleBasedRoute>
                } />
                <Route path="/documents" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <DocumentPage />
                    </RoleBasedRoute>
                } />
                <Route path="/mymeetings" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <MyMeetingView />
                    </RoleBasedRoute>
                } />
                <Route path="/notes" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <NotesPage />
                    </RoleBasedRoute>
                } />
                <Route path="/reclamations" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <UserReclamationsPage />
                    </RoleBasedRoute>
                } />
                <Route path="/myprofile" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <MyProfilePage />
                    </RoleBasedRoute>
                } />
                <Route path="/settings" element={
                    <RoleBasedRoute allowedRoles="expert">
                        <Settings />
                    </RoleBasedRoute>
                } />
                <Route path="/messenger" element={
                    <RoleBasedRoute allowedRoles={["expert", "admin"]}>
                        <Messenger />
                    </RoleBasedRoute>
                } />
                <Route path="/meetings/:jitsiRoom" element={
                    <RoleBasedRoute allowedRoles={["expert", "admin"]}>
                        <JitsiRoom />
                    </RoleBasedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <RoleBasedRoute allowedRoles="admin">
                        <Suspense fallback={<PageLoader />}>
                            <AdminDashboard />
                        </Suspense>
                    </RoleBasedRoute>
                } />
                <Route path="/admin/users" element={
                    <RoleBasedRoute allowedRoles="admin">
                        <Suspense fallback={<PageLoader />}>
                            <Users />
                        </Suspense>
                    </RoleBasedRoute>
                } />
                <Route path="/admin/categories" element={
                    <RoleBasedRoute allowedRoles="admin">
                        <Suspense fallback={<PageLoader />}>
                            <CategoriesManagement />
                        </Suspense>
                    </RoleBasedRoute>
                } />
                <Route path="/admin/reclamations" element={
                    <RoleBasedRoute allowedRoles="admin">
                        <Suspense fallback={<PageLoader />}>
                            <AdminReclamationsPage />
                        </Suspense>
                    </RoleBasedRoute>
                } />
                <Route path="/admin/meetings" element={
                    <RoleBasedRoute allowedRoles="admin">
                        <Suspense fallback={<PageLoader />}>
                            <Meetings />
                        </Suspense>
                    </RoleBasedRoute>
                } />

                {/* Root Route */}
                <Route path="/" element={<RootRedirect />} />

                {/* Catch all - redirect based on auth status */}
                <Route path="*" element={<RootRedirect />} />
            </Routes>
        </TokenExpirationChecker>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;