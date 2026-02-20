import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Expert {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    picture: string;
    isActive: boolean;
}

function Dashboard() {
    const [expert, setExpert] = useState<Expert | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const expertData = localStorage.getItem('expert');
        const token = localStorage.getItem('token');

        if (!token || !expertData) {
            navigate('/login');
            return;
        }

        setExpert(JSON.parse(expertData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expert');
        localStorage.removeItem('tokenExpiration');
        navigate('/login');
    };

    if (!expert) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Chargement...
            </div>
        );
    }

    return (
        <div style={{ padding: '40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1>Bienvenue, {expert.firstname} {expert.lastname}!</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Déconnexion
                </button>
            </div>

            <div style={{
                backgroundColor: '#f9fafb',
                padding: '30px',
                borderRadius: '16px',
                maxWidth: '600px'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Informations du compte</h2>
                <p><strong>Email:</strong> {expert.email}</p>
                {expert.picture && (
                    <div style={{ marginTop: '20px' }}>
                        <strong>Photo de profil:</strong>
                        <div>
                            <img
                                src={expert.picture}
                                alt={expert.firstname}
                                style={{
                                    width: '100px',
                                    borderRadius: '50%',
                                    marginTop: '10px',
                                    border: '3px solid #6366f1'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;