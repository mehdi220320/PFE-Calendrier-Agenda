import React, { useState, useEffect } from 'react';
import { expertProfilService } from '../../../../services/expertProfileService.tsx';
import {  type ExpertProfileData } from '../../../../models/ExpertProfil.tsx'
import {  type NewUser } from '../../../../models/User.tsx'





interface AddUserProps {
    show: boolean;
    onClose: () => void;
    onUserCreated: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const AddUser: React.FC<AddUserProps> = ({
                                             show,
                                             onClose,
                                             onUserCreated,
                                             loading,
                                             setLoading,
                                             setError
                                         }) => {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<NewUser>({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        role: 'expert',
        isActive: true
    });
    const [expertData, setExpertData] = useState<ExpertProfileData>({
        category: '',
        headline: '',
        bio: '',
        competences: [],
        languages: [],
        socialLinks: [],
        experience: 10
    });
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewUser, string>>>({});
    const [expertErrors, setExpertErrors] = useState<Partial<Record<keyof ExpertProfileData, string>>>({});
    const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);
    const [tempCompetence, setTempCompetence] = useState('');
    const [tempLanguage, setTempLanguage] = useState('');
    const [tempSocialLink, setTempSocialLink] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false);
    const [otherCategoryValue, setOtherCategoryValue] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);

    // Fetch categories from backend
    useEffect(() => {
        if (show && step === 2) {
            fetchCategories();
        }
    }, [show, step]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const categoriesData = await expertProfilService.getCategories();
            const categoryNames = categoriesData
                .map(item => item.category)
                .filter(cat => cat && cat !== 'null' && cat !== '');

            // Add default categories if not exist
            const defaultCategories = [
                "Consultant Juridique",
                "Consultant Financier",
                "Consultant Divers"
            ];

            const allCategories = [...new Set([...defaultCategories, ...categoryNames])];
            setCategories(allCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
            // Fallback to default categories
            setCategories([
                "Consultant Juridique",
                "Consultant Financier",
                "Consultant Divers"
            ]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<Record<keyof NewUser, string>> = {};

        if (!formData.firstname.trim()) {
            errors.firstname = 'Le prénom est requis';
        }

        if (!formData.lastname.trim()) {
            errors.lastname = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email invalide';
        }

        if (formData.phone && !/^[0-9+\-\s]+$/.test(formData.phone)) {
            errors.phone = 'Numéro de téléphone invalide';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateExpertForm = (): boolean => {
        const errors: Partial<Record<keyof ExpertProfileData, string>> = {};

        if (!expertData.category) {
            errors.category = 'La catégorie est requise';
        }

        if (expertData.competences.length === 0) {
            errors.competences = 'Au moins une compétence est requise';
        }

        setExpertErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            role: 'expert',
            isActive: true
        });
        setExpertData({
            category: '',
            headline: '',
            bio: '',
            competences: [],
            languages: [],
            socialLinks: [],
            experience: 10
        });
        setFormErrors({});
        setExpertErrors({});
        setStep(1);
        setUserId(null);
        setTempCompetence('');
        setTempLanguage('');
        setTempSocialLink('');
        setShowOtherCategoryInput(false);
        setOtherCategoryValue('');
        setIsCreatingUser(false);
        setIsCreatingProfile(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        if (formErrors[name as keyof NewUser]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleExpertInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'category') {
            if (value === 'other') {
                setShowOtherCategoryInput(true);
                setExpertData(prev => ({ ...prev, category: '' }));
            } else {
                setShowOtherCategoryInput(false);
                setOtherCategoryValue('');
                setExpertData(prev => ({ ...prev, category: value }));
            }
        } else {
            setExpertData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (expertErrors[name as keyof ExpertProfileData]) {
            setExpertErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleOtherCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOtherCategoryValue(value);
        setExpertData(prev => ({ ...prev, category: value }));
        if (expertErrors.category) {
            setExpertErrors(prev => ({ ...prev, category: undefined }));
        }
    };

    const addCompetence = () => {
        if (tempCompetence.trim()) {
            setExpertData(prev => ({
                ...prev,
                competences: [...prev.competences, tempCompetence.trim()]
            }));
            setTempCompetence('');
            if (expertErrors.competences) {
                setExpertErrors(prev => ({ ...prev, competences: undefined }));
            }
        }
    };

    const removeCompetence = (index: number) => {
        setExpertData(prev => ({
            ...prev,
            competences: prev.competences.filter((_, i) => i !== index)
        }));
    };

    const addLanguage = () => {
        if (tempLanguage.trim()) {
            setExpertData(prev => ({
                ...prev,
                languages: [...prev.languages, tempLanguage.trim()]
            }));
            setTempLanguage('');
        }
    };

    const removeLanguage = (index: number) => {
        setExpertData(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const addSocialLink = () => {
        if (tempSocialLink.trim()) {
            setExpertData(prev => ({
                ...prev,
                socialLinks: [...prev.socialLinks, tempSocialLink.trim()]
            }));
            setTempSocialLink('');
        }
    };

    const removeSocialLink = (index: number) => {
        setExpertData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const createUser = async (): Promise<string> => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/adduser`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const result = await response.json();
            return result.user.id;
        } catch (err) {
            throw err;
        }
    };

    const createExpertProfile = async (userId: string) => {
        try {
            await expertProfilService.addExpertProfile({
                expertId: userId,
                category: expertData.category,
                headline: expertData.headline,
                bio: expertData.bio,
                competences: expertData.competences,
                languages: expertData.languages,
                socialLinks: expertData.socialLinks,
                experience: expertData.experience
            });
        } catch (err) {
            throw err;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (formData.role === 'admin') {
            setShowAdminConfirmModal(true);
        } else if (formData.role === 'expert') {
            await handleUserCreation();
        } else {
            // For regular users, just create the user and close
            await handleUserCreation();
        }
    };

    const handleUserCreation = async () => {
        try {
            setIsCreatingUser(true);
            setLoading(true);
            const newUserId = await createUser();

            if (formData.role === 'expert') {
                setUserId(newUserId);
                setStep(2);
                setIsCreatingUser(false);
                setLoading(false);
            } else {
                onUserCreated();
                resetForm();
                onClose();
                setIsCreatingUser(false);
                setLoading(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsCreatingUser(false);
            setLoading(false);
        }
    };

    const handleExpertProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateExpertForm()) {
            return;
        }

        try {
            setIsCreatingProfile(true);
            setLoading(true);
            if (userId) {
                await createExpertProfile(userId);
                onUserCreated();
                resetForm();
                onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsCreatingProfile(false);
            setLoading(false);
        }
    };

    const handleBackToUserForm = () => {
        setStep(1);
    };

    if (!show) return null;

    return (
        <>
            {/* Create User Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {step === 1 ? (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Créer un nouvel utilisateur
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formData.role === 'expert' ? 'Étape 1/2 - Informations personnelles' : 'Informations personnelles'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                onClose();
                                            }}
                                            className="text-gray-400 hover:text-gray-500 transition-colors"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Prénom *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstname"
                                                    value={formData.firstname}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                        formErrors.firstname ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {formErrors.firstname && (
                                                    <p className="mt-1 text-xs text-red-500">{formErrors.firstname}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nom *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastname"
                                                    value={formData.lastname}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                        formErrors.lastname ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {formErrors.lastname && (
                                                    <p className="mt-1 text-xs text-red-500">{formErrors.lastname}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {formErrors.phone && (
                                                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rôle *
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="user">Utilisateur</option>
                                                <option value="expert">Expert</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Compte actif
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            onClose();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingUser}
                                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isCreatingUser ? 'Création...' : (formData.role === 'expert' ? 'Suivant' : 'Créer')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleExpertProfileSubmit}>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Compléter le profil expert
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Étape 2/2 - Informations professionnelles
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                onClose();
                                            }}
                                            className="text-gray-400 hover:text-gray-500 transition-colors"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Catégorie *
                                            </label>
                                            {loadingCategories ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                                    <span className="text-sm text-gray-500">Chargement des catégories...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        name="category"
                                                        value={showOtherCategoryInput ? 'other' : expertData.category}
                                                        onChange={handleExpertInputChange}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                            expertErrors.category ? 'border-red-500' : 'border-gray-300'
                                                        }`}
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
                                            {expertErrors.category && (
                                                <p className="mt-1 text-xs text-red-500">{expertErrors.category}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Titre / Headline
                                            </label>
                                            <input
                                                type="text"
                                                name="headline"
                                                value={expertData.headline}
                                                onChange={handleExpertInputChange}
                                                placeholder="ex: Expert en droit des affaires"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={expertData.bio}
                                                onChange={handleExpertInputChange}
                                                rows={3}
                                                placeholder="Décrivez votre parcours et votre expertise..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Années d'expérience
                                            </label>
                                            <input
                                                type="number"
                                                name="experience"
                                                value={expertData.experience}
                                                onChange={handleExpertInputChange}
                                                min="0"
                                                max="50"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Compétences *
                                            </label>
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
                                            {expertErrors.competences && (
                                                <p className="mt-1 text-xs text-red-500">{expertErrors.competences}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {expertData.competences.map((comp, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                                                        {comp}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCompetence(index)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Langues
                                            </label>
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
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {expertData.languages.map((lang, index) => (
                                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                                                        {lang}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLanguage(index)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Liens sociaux
                                            </label>
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
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {expertData.socialLinks.map((link, index) => (
                                                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                                                        {link.length > 30 ? link.substring(0, 30) + '...' : link}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSocialLink(index)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-3 flex justify-between gap-3 rounded-b-lg">
                                    <button
                                        type="button"
                                        onClick={handleBackToUserForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                onClose();
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreatingProfile}
                                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isCreatingProfile ? 'Création...' : 'Créer le profil'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Confirmation Modal */}
            {showAdminConfirmModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Confirmation création admin
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Êtes-vous sûr de vouloir créer un compte administrateur ?
                                            Les administrateurs ont tous les droits sur la plateforme.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminConfirmModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUserCreation}
                                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddUser;