import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expertProfilService } from '../../services/expertProfileService.tsx';
import { userService } from '../../services/userService.tsx';
import type { ExpertProfil } from '../../models/ExpertProfil.tsx';
import type { User } from '../../models/User.tsx';
import Header from '../../Component/Header';
import ProfileView from './ProfileView';
import EditProfileForm from './EditProfileForm';

const MyProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ExpertProfil | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ category: string; nb_of_profiles: number }[]>([]);

    useEffect(() => {
        fetchUserAndProfile();
        fetchCategories();
    }, []);

    const fetchUserAndProfile = async () => {
        try {
            setLoading(true);
            // Fetch user data first
            const user = await userService.getMyData();
            setUserData(user);

            // Then fetch expert profile
            try {
                const data = await expertProfilService.getMyProfile();
                setProfile(data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('Profil non trouvé. Veuillez créer votre profil d\'abord.');
                } else {
                    console.error('Error fetching profile:', err);
                }
            }
            setError(null);
        } catch (err: any) {
            setError('Échec du chargement des données. Veuillez réessayer plus tard.');
            console.error('Erreur lors du chargement:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await expertProfilService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Erreur lors du chargement des catégories:', err);
        }
    };

    const handleSave = async (formData: any) => {
        try {
            setSaving(true);
            const updatedProfile = await expertProfilService.updateMyProfile(formData);
            setProfile(updatedProfile);
            setIsEditing(false);
            setError(null);
        } catch (err: any) {
            setError('Échec de la mise à jour du profil. Veuillez réessayer.');
            console.error('Erreur lors de la mise à jour du profil:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePicture = async (file: File) => {
        try {
            setSaving(true);
            const result = await userService.updateMyPicture(file);
            setUserData(result.user);
            setError(null);
            return result;
        } catch (err: any) {
            setError('Échec de la mise à jour de la photo. Veuillez réessayer.');
            console.error('Erreur lors de la mise à jour de la photo:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error && !profile && !userData) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const initialFormData = {
        headline: profile?.headline || '',
        bio: profile?.bio || '',
        category: profile?.category || '',
        experience: profile?.experience || 0,
        competences: profile?.competences || [],
        languages: profile?.languages || [],
        socialLinks: profile?.socialLinks || []
    };

    const userDetails = userData ? {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        picture: userData.picture
    } : null;

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Modifiez vos informations professionnelles' : 'Consultez vos informations personnelles et professionnelles'}
                            </p>
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="p-6">
                            {!isEditing ? (
                                <ProfileView
                                    profile={initialFormData}
                                    userDetails={userDetails}
                                    onEdit={() => setIsEditing(true)}
                                    onUpdatePicture={handleUpdatePicture}
                                    saving={saving}
                                />
                            ) : (
                                <EditProfileForm
                                    initialData={initialFormData}
                                    categories={categories}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    saving={saving}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfilePage;