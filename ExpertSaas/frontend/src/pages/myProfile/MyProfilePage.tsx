import React, { useState, useEffect } from 'react';
import { expertProfilService } from '../../services/expertProfileService.tsx';
import { userService } from '../../services/userService.tsx';
import type { ExpertProfil } from '../../models/ExpertProfil.tsx';
import type { User } from '../../models/User.tsx';
import Header from '../../Component/Header';
import ProfileView from './ProfileView';
import EditProfileForm from './EditProfileForm';

const MyProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<ExpertProfil | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ category: string; nb_of_profiles: number }[]>([]);
    const [profileNotFound, setProfileNotFound] = useState(false);

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
                setProfileNotFound(false);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setProfileNotFound(true);
                    setProfile(null);
                } else {
                    console.error('Error fetching profile:', err);
                    setError('Erreur lors du chargement du profil.');
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
            let updatedProfile;

            if (profileNotFound) {
                // IMPORTANT: Add the expertId from userData when creating a new profile
                if (!userData?.id) {
                    throw new Error("User ID not found");
                }

                const profileData = {
                    ...formData,
                    expertId: userData.id
                };

                console.log("Creating profile with data:", profileData); // Debug log
                updatedProfile = await expertProfilService.addExpertProfile(profileData);
                setProfileNotFound(false);
            } else {
                // Update existing profile
                updatedProfile = await expertProfilService.updateMyProfile(formData);
            }

            setProfile(updatedProfile);
            setIsEditing(false);
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Échec de la mise à jour du profil. Veuillez réessayer.';
            setError(errorMessage);
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

    const handleCreateProfile = () => {
        setIsEditing(true);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                        </div>
                        <p className="mt-4 text-slate-600 font-medium">Chargement du profil...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error && !profile && !userData && !profileNotFound) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const initialFormData = profile ? {
        headline: profile?.headline || '',
        bio: profile?.bio || '',
        category: profile?.category || '',
        experience: profile?.experience || 0,
        competences: profile?.competences || [],
        languages: profile?.languages || [],
        socialLinks: profile?.socialLinks || []
    } : {
        headline: '',
        bio: '',
        category: '',
        experience: 0,
        competences: [],
        languages: [],
        socialLinks: []
    };

    const userDetails = userData ? {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        picture: userData.picture
    } : null;

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                            <h1 className="text-3xl font-bold text-slate-900">Mon Profil Expert</h1>
                            <p className="text-slate-600 mt-2">
                                {isEditing
                                    ? 'Modifiez vos informations professionnelles'
                                    : profileNotFound
                                        ? 'Créez votre profil expert pour commencer'
                                        : 'Consultez et modifiez votre profil professionnel'}
                            </p>
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="p-8">
                            {profileNotFound && !isEditing ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun profil trouvé</h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        Vous n'avez pas encore créé votre profil expert. Commencez maintenant pour pouvoir accepter des réservations!
                                    </p>
                                    <button
                                        onClick={handleCreateProfile}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
                                    >
                                        Créer mon profil expert
                                    </button>
                                </div>
                            ) : !isEditing ? (
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
                                    userDetails={userDetails}
                                    onUpdatePicture={handleUpdatePicture}
                                    isCreating={profileNotFound}
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