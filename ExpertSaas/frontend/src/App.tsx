import React, { Suspense, lazy } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/login/Login.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import CalendarPage from "./pages/calendar/Calendar.tsx";

const Users = lazy(() => import('./admin/pages/Users.tsx'));
const Meetings = lazy(() => import('./admin/pages/Meetings.tsx'));
const Reclamations = lazy(() => import('./admin/pages/Reclamations.tsx'));
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />

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
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;