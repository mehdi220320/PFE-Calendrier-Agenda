import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

const Users = lazy(() => import('./admin/pages/users/Users.tsx'));
const Meetings = lazy(() => import('./admin/pages/Meetings.tsx'));
const Reclamations = lazy(() => import('./admin/pages/Reclamations.tsx'));
const CategoriesManagement = lazy(() => import('./admin/pages/categories/CategoriesManagement.tsx'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard.tsx'));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

const RootRedirect = () => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/planification" element={<ProtectedRoute><PlanificationPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/myavailability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
                <Route path="/mymeetings" element={<ProtectedRoute><MyMeetingView /></ProtectedRoute>} />
                <Route
                    path="/meetings/:jitsiRoom"
                    element={
                        <ProtectedRoute>
                            <JitsiRoom />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <Users />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <CategoriesManagement />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/meetings"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <Meetings />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reclamations"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <Reclamations />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                                <AdminDashboard />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<RootRedirect />} />

                <Route path="*" element={<RootRedirect />} />
            </Routes>
        </Router>
    );
}

export default App;