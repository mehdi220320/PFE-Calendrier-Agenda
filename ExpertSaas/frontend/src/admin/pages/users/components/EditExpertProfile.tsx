import React, { useState, useEffect } from 'react';
import { expertProfilService } from '../../../../services/expertProfileService.tsx';
import { type ExpertProfile, type ExpertProfileData } from '../../../../models/ExpertProfil.tsx';
import { type User } from '../../../../models/User.tsx';

interface EditExpertProfileProps {
    show: boolean;
    onClose: () => void;
    expertId: string;
    expertUserData?: User | null;
    onProfileUpdated: () => void;
    onUserPictureUpdated?: (updatedUser: User) => void;
}

const EditExpertProfile: React.FC<EditExpertProfileProps> = ({
                                                                 show,
                                                                 onClose,
                                                                 expertId,
                                                                 expertUserData,
                                                                 onProfileUpdated,
                                                                 onUserPictureUpdated
                                                             }) => {
    const [profile, setProfile] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tempCompetence, setTempCompetence] = useState('');
    const [tempLanguage, setTempLanguage] = useState('');
    const [tempSocialLink, setTempSocialLink] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false);
    const [otherCategoryValue, setOtherCategoryValue] = useState('');
    const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    const defaultCategories = [
        "Consultant Juridique",
        "Consultant Financier",
        "Consultant Divers"
    ];

    useEffect(() => {
        if (show && expertId) {
            fetchProfile();
            fetchCategories();
            // Set picture preview from existing user data if available
            if (expertUserData?.picture) {
                setPicturePreview(expertUserData.picture);
            }
        }
    }, [show, expertId, expertUserData]);

    // Clean up preview URL when component unmounts
    useEffect(() => {
        if (!show) {
            if (picturePreview && picturePreview.startsWith('blob:')) {
                URL.revokeObjectURL(picturePreview);
            }
            setSelectedPicture(null);
            setPicturePreview(null);
        }
    }, [show, picturePreview]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const categoriesData = await expertProfilService.getCategories();
            const categoryNames = categoriesData
                .map(item => item.category)
                .filter(cat => cat && cat !== 'null' && cat !== '');

            const allCategories = [...new Set([...defaultCategories, ...categoryNames])];
            setCategories(allCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories(defaultCategories);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await expertProfilService.getExpertProfile(expertId);
            setProfile(data);
            setError(null);
        } catch (err: any) {
            // Check if error is 404 (profile not found)
            if (err.response?.status === 404 || err.message?.includes('not found')) {
                setProfile(null);
                setError(null);
                // Auto-enter creation mode
                setIsCreating(true);
                setIsEditing(true);
                // Initialize empty profile data
                setProfile({
                    id: '',
                    expert: expertId,
                    bio: '',
                    category: '',
                    headline: '',
                    languages: [],
                    socialLinks: [],
                    competences: [],
                    experience: 10
                });
            } else {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
                setProfile(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La taille de l\'image ne doit pas dépasser 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Seules les images sont acceptées');
                return;
            }

            setSelectedPicture(file);

            // Create preview
            if (picturePreview && picturePreview.startsWith('blob:')) {
                URL.revokeObjectURL(picturePreview);
            }
            const preview = URL.createObjectURL(file);
            setPicturePreview(preview);
        }
    };

    const uploadUserPicture = async (): Promise<string | null> => {
        if (!selectedPicture) return expertUserData?.picture || null;

        try {
            setUploadingPicture(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('picture', selectedPicture);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/picture/${expertId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload picture');
            }

            const result = await response.json();

            // Notify parent component about picture update
            if (onUserPictureUpdated && result.user) {
                onUserPictureUpdated(result.user);
            }

            return result.user.picture;
        } catch (err) {
            console.error('Error uploading picture:', err);
            setError('Erreur lors du téléchargement de la photo');
            return expertUserData?.picture || null;
        } finally {
            setUploadingPicture(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'category') {
            if (value === 'other') {
                setShowOtherCategoryInput(true);
                setProfile(prev => prev ? { ...prev, category: '' } : null);
            } else {
                setShowOtherCategoryInput(false);
                setOtherCategoryValue('');
                setProfile(prev => prev ? { ...prev, category: value } : null);
            }
        } else {
            setProfile(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleOtherCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOtherCategoryValue(value);
        setProfile(prev => prev ? { ...prev, category: value } : null);
    };

    const addCompetence = () => {
        if (tempCompetence.trim() && profile) {
            setProfile({
                ...profile,
                competences: [...profile.competences, tempCompetence.trim()]
            });
            setTempCompetence('');
        }
    };

    const removeCompetence = (index: number) => {
        if (profile) {
            setProfile({
                ...profile,
                competences: profile.competences.filter((_, i) => i !== index)
            });
        }
    };

    const addLanguage = () => {
        if (tempLanguage.trim() && profile) {
            setProfile({
                ...profile,
                languages: [...profile.languages, tempLanguage.trim()]
            });
            setTempLanguage('');
        }
    };

    const removeLanguage = (index: number) => {
        if (profile) {
            setProfile({
                ...profile,
                languages: profile.languages.filter((_, i) => i !== index)
            });
        }
    };

    const addSocialLink = () => {
        if (tempSocialLink.trim() && profile) {
            setProfile({
                ...profile,
                socialLinks: [...profile.socialLinks, tempSocialLink.trim()]
            });
            setTempSocialLink('');
        }
    };

    const removeSocialLink = (index: number) => {
        if (profile) {
            setProfile({
                ...profile,
                socialLinks: profile.socialLinks.filter((_, i) => i !== index)
            });
        }
    };

    const handleCreate = async () => {
        if (!profile) return;

        try {
            setLoading(true);

            // Upload picture if selected
            const pictureUrl = await uploadUserPicture();

            await expertProfilService.addExpertProfile({
                expertId: profile.expert,
                category: profile.category || '',
                headline: profile.headline || '',
                bio: profile.bio || '',
                competences: profile.competences,
                languages: profile.languages,
                socialLinks: profile.socialLinks,
                experience: profile.experience
            });

            setIsCreating(false);
            setIsEditing(false);
            onProfileUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!profile) return;

        try {
            setLoading(true);

            // Upload picture if selected
            const pictureUrl = await uploadUserPicture();

            await expertProfilService.updateExpertProfile(profile.id, {
                category: profile.category || undefined,
                headline: profile.headline || undefined,
                bio: profile.bio || undefined,
                competences: profile.competences,
                languages: profile.languages,
                socialLinks: profile.socialLinks,
                experience: profile.experience
            });

            setIsEditing(false);
            onProfileUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (isCreating) {
            handleCreate();
        } else {
            handleUpdate();
        }
    };

    const handleCancel = () => {
        if (isCreating) {
            setIsCreating(false);
            setIsEditing(false);
            onClose();
        } else {
            setIsEditing(false);
            fetchProfile();
            // Reset picture preview to original
            if (expertUserData?.picture) {
                setPicturePreview(expertUserData.picture);
            } else {
                setPicturePreview(null);
            }
            setSelectedPicture(null);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {isCreating ? 'Créer un profil expert' :
                                        profile && !isEditing ? 'Profil expert' :
                                            'Modifier le profil expert'}
                                </h3>
                                {profile && !isEditing && !isCreating && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Consultez les informations du profil
                                    </p>
                                )}
                                {isEditing && (
                                    <p className="text-sm text-blue-600 mt-1">
                                        {isCreating ? 'Remplissez les informations pour créer le profil' : 'Mode édition - Modifiez les informations ci-dessous'}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {loading && !profile ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : profile ? (
                            <div className="space-y-4">
                                {/* Picture Upload Section */}
                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Photo de profil
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                {picturePreview ? (
                                                    <img
                                                        src={picturePreview}
                                                        alt="Preview"
                                                        className="h-20 w-20 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePictureChange}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    JPG, PNG, GIF (max. 5MB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie
                                    </label>
                                    {isEditing ? (
                                        <>
                                            {loadingCategories ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                                    <span className="text-sm text-gray-500">Chargement des catégories...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        name="category"
                                                        value={showOtherCategoryInput ? 'other' : (profile.category || '')}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Sélectionner une catégorie</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                        <option value="other">Autre (ajouter une nouvelle catégorie)</option>
                                                    </select>
                                                    {showOtherCategoryInput && (
                                                        <div className="mt-2">
                                                            <input
                                                                type="text"
                                                                value={otherCategoryValue}
                                                                onChange={handleOtherCategoryChange}
                                                                placeholder="Entrez une nouvelle catégorie"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                                            {profile.category || 'Non spécifié'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre / Headline
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="headline"
                                            value={profile.headline || ''}
                                            onChange={handleInputChange}
                                            placeholder="ex: Expert en droit des affaires"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                                            {profile.headline || 'Non spécifié'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            value={profile.bio || ''}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Décrivez votre parcours et votre expertise..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                                            {profile.bio || 'Non spécifié'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Années d'expérience
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="experience"
                                            value={profile.experience}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="50"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                                            {profile.experience} ans
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Compétences
                                    </label>
                                    {isEditing && (
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tempCompetence}
                                                onChange={(e) => setTempCompetence(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
                                                placeholder="Ajouter une compétence"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCompetence}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {profile.competences.map((comp, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                                                {comp}
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCompetence(index)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        {profile.competences.length === 0 && (
                                            <p className="text-gray-500 text-sm">Aucune compétence renseignée</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Langues
                                    </label>
                                    {isEditing && (
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tempLanguage}
                                                onChange={(e) => setTempLanguage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                                placeholder="Ajouter une langue"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={addLanguage}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {profile.languages.map((lang, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                                                {lang}
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLanguage(index)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        {profile.languages.length === 0 && (
                                            <p className="text-gray-500 text-sm">Aucune langue renseignée</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Liens sociaux
                                    </label>
                                    {isEditing && (
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                value={tempSocialLink}
                                                onChange={(e) => setTempSocialLink(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSocialLink())}
                                                placeholder="https://..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={addSocialLink}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {profile.socialLinks.map((link, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {link.length > 30 ? link.substring(0, 30) + '...' : link}
                                                </a>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSocialLink(index)}
                                                        className="text-purple-600 hover:text-purple-800"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        {profile.socialLinks.length === 0 && (
                                            <p className="text-gray-500 text-sm">Aucun lien social renseigné</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        {profile && !isEditing && !isCreating ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Modifier le profil
                                </button>
                            </>
                        ) : isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading || uploadingPicture}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading || uploadingPicture ? (isCreating ? 'Création...' : 'Enregistrement...') : (isCreating ? 'Créer le profil' : 'Enregistrer')}
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditExpertProfile;