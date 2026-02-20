

import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    const expert = localStorage.getItem('expert');

    if (!token || !expert) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    const googleClientId = "443091369200-5r7561s88i58cjv11sh9ccbfb2al2ppn.apps.googleusercontent.com";

    if (!googleClientId) {
        console.error('Google Client ID is missing. Check your .env file');
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                Error: Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;