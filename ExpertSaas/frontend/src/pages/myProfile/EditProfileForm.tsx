import React, { useState, useEffect, useRef } from 'react';
import {
    User, Briefcase, FileText, Globe, Link as LinkIcon,
    Layers, Award, Plus, X, Trash2, Save, Camera,
    Github, Twitter, Linkedin
} from 'lucide-react';

interface EditProfileFormProps {
    initialData: {
        headline: string;
        bio: string;
        category: string;
        experience: number;
        competences: string[];
        languages: string[];
        socialLinks: string[];
    };
    categories: { category: string; nb_of_profiles: number }[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
    userDetails: any;
    onUpdatePicture: (file: File) => Promise<void>;
    isCreating?: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
                                                             initialData,
                                                             categories,
                                                             onSave,
                                                             onCancel,
                                                             saving,
                                                             userDetails,
                                                             onUpdatePicture,
                                                             isCreating = false
                                                         }) => {
    const [formData, setFormData] = useState(initialData);
    const [newCompetence, setNewCompetence] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newSocialLink, setNewSocialLink] = useState('');
    const [showOtherCategory, setShowOtherCategory] = useState(false);
    const [otherCategory, setOtherCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formData.category && !categories.some(cat => cat.category === formData.category)) {
            setShowOtherCategory(true);
            setOtherCategory(formData.category);
        }
    }, [formData.category, categories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'other') {
            setShowOtherCategory(true);
            setFormData({ ...formData, category: '' });
        } else {
            setShowOtherCategory(false);
            setOtherCategory('');
            setFormData({ ...formData, category: value });
        }
    };

    const handleOtherCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOtherCategory(value);
        setFormData({ ...formData, category: value });
    };

    // Handle picture upload
    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('La taille de l\'image ne doit pas dépasser 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Seules les images sont acceptées');
            return;
        }

        try {
            setUploading(true);
            await onUpdatePicture(file);
        } catch (error) {
            console.error('Error uploading picture:', error);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Array management functions
    const addCompetence = () => {
        if (newCompetence.trim()) {
            setFormData({
                ...formData,
                competences: [...formData.competences, newCompetence.trim()]
            });
            setNewCompetence('');
        }
    };

    const removeCompetence = (index: number) => {
        setFormData({
            ...formData,
            competences: formData.competences.filter((_, i) => i !== index)
        });
    };

    const addLanguage = () => {
        if (newLanguage.trim()) {
            setFormData({
                ...formData,
                languages: [...formData.languages, newLanguage.trim()]
            });
            setNewLanguage('');
        }
    };

    const removeLanguage = (index: number) => {
        setFormData({
            ...formData,
            languages: formData.languages.filter((_, i) => i !== index)
        });
    };

    const addSocialLink = () => {
        if (newSocialLink.trim()) {
            setFormData({
                ...formData,
                socialLinks: [...formData.socialLinks, newSocialLink.trim()]
            });
            setNewSocialLink('');
        }
    };

    const removeSocialLink = (index: number) => {
        setFormData({
            ...formData,
            socialLinks: formData.socialLinks.filter((_, i) => i !== index)
        });
    };

    const getSocialIcon = (url: string) => {
        if (url.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (url.includes('github')) return <Github className="w-4 h-4" />;
        if (url.includes('twitter')) return <Twitter className="w-4 h-4" />;
        return <LinkIcon className="w-4 h-4" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                accept="image/*"
                className="hidden"
            />

            {/* Profile Picture Section */}
            {userDetails && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Photo de profil</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                                {userDetails.picture ? (
                                    <img
                                        src={userDetails.picture}
                                        alt={`${userDetails.firstname} ${userDetails.lastname}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-4xl font-bold">
                                        {userDetails.firstname?.charAt(0)}{userDetails.lastname?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={uploading || saving}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 hover:scale-110"
                                title="Changer la photo de profil"
                            >
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-indigo-600"></div>
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">
                                {userDetails.firstname} {userDetails.lastname}
                            </h4>
                            <p className="text-sm text-slate-600 mb-4">
                                {userDetails.email}
                            </p>
                            <p className="text-sm text-slate-600">
                                Cliquez sur le bouton caméra pour mettre à jour votre photo
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Titre professionnel */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Titre professionnel
                    </div>
                </label>
                <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Ex: Développeur Full Stack Senior avec plus de 8 ans d'expérience"
                />
            </div>

            {/* Catégorie et expérience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            Catégorie
                        </div>
                    </label>
                    <select
                        value={showOtherCategory ? 'other' : formData.category}
                        onChange={handleCategoryChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                            <option key={cat.category} value={cat.category}>
                                {cat.category} ({cat.nb_of_profiles} experts)
                            </option>
                        ))}
                        <option value="other">Autre (catégorie personnalisée)</option>
                    </select>

                    {showOtherCategory && (
                        <input
                            type="text"
                            value={otherCategory}
                            onChange={handleOtherCategoryChange}
                            placeholder="Entrez votre catégorie personnalisée"
                            className="mt-3 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            autoFocus
                        />
                    )}
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Expérience (Années)
                        </div>
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="70"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Biographie */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Biographie
                    </div>
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Parlez de votre parcours professionnel, de votre expertise et de vos réalisations..."
                />
            </div>

            {/* Compétences */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Compétences
                    </div>
                </label>
                <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.competences.map((comp, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                            >
                                {comp}
                                <button
                                    type="button"
                                    onClick={() => removeCompetence(index)}
                                    className="hover:text-indigo-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCompetence}
                            onChange={(e) => setNewCompetence(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Ajouter une compétence (ex: React, Python, Gestion)"
                        />
                        <button
                            type="button"
                            onClick={addCompetence}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Langues */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        Langues
                    </div>
                </label>
                <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.languages.map((lang, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                                {lang}
                                <button
                                    type="button"
                                    onClick={() => removeLanguage(index)}
                                    className="hover:text-green-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Ajouter une langue (ex: Français, Anglais)"
                        />
                        <button
                            type="button"
                            onClick={addLanguage}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Liens sociaux */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-5 h-5 text-indigo-600" />
                        Liens sociaux
                    </div>
                </label>
                <div>
                    <div className="space-y-3 mb-4">
                        {formData.socialLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg hover:border-slate-400 transition-colors">
                                <div className="text-slate-500">
                                    {getSocialIcon(link)}
                                </div>
                                <span className="flex-1 text-sm text-slate-700 truncate">{link}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSocialLink(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={newSocialLink}
                            onChange={(e) => setNewSocialLink(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSocialLink())}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Ajouter un lien social (ex: https://linkedin.com/in/utilisateur)"
                        />
                        <button
                            type="button"
                            onClick={addSocialLink}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving || uploading}
                    className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-all font-semibold disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Enregistrement...' : isCreating ? 'Créer mon profil' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};

export default EditProfileForm;