import React, { useState, useEffect } from 'react';
import {
    User, Briefcase, FileText, Globe, Link as LinkIcon,
    Layers, Award, Plus, X, Trash2, Save,
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
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
                                                             initialData,
                                                             categories,
                                                             onSave,
                                                             onCancel,
                                                             saving
                                                         }) => {
    const [formData, setFormData] = useState(initialData);
    const [newCompetence, setNewCompetence] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newSocialLink, setNewSocialLink] = useState('');
    const [showOtherCategory, setShowOtherCategory] = useState(false);
    const [otherCategory, setOtherCategory] = useState('');

    useEffect(() => {
        // Vérifier si la catégorie actuelle n'est pas dans la liste prédéfinie
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

    // Fonctions de gestion des tableaux
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
            {/* Titre professionnel */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Titre professionnel
                    </div>
                </label>
                <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Développeur Full Stack Senior avec plus de 8 ans d'expérience"
                />
            </div>

            {/* Catégorie et expérience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Catégorie
                        </div>
                    </label>
                    <select
                        value={showOtherCategory ? 'other' : formData.category}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                            <option key={cat.category} value={cat.category}>
                                {cat.category} ({cat.nb_of_profiles} experts)
                            </option>
                        ))}
                        <option value="other">Autre (Ajouter une catégorie personnalisée)</option>
                    </select>

                    {showOtherCategory && (
                        <input
                            type="text"
                            value={otherCategory}
                            onChange={handleOtherCategoryChange}
                            placeholder="Entrez votre catégorie personnalisée"
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Expérience (Années)
                        </div>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Biographie */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Biographie
                    </div>
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Parlez de votre parcours professionnel, de votre expertise et de vos réalisations..."
                />
            </div>

            {/* Compétences */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Compétences / Savoir-faire
                    </div>
                </label>
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.competences.map((comp, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                {comp}
                                <button
                                    type="button"
                                    onClick={() => removeCompetence(index)}
                                    className="hover:text-blue-600 ml-1"
                                >
                  <X className="w-3 h-3" />
                </button>
              </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCompetence}
                            onChange={(e) => setNewCompetence(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCompetence()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ajouter une compétence (ex: React, Python, Gestion de projet)"
                        />
                        <button
                            type="button"
                            onClick={addCompetence}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Langues */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Langues
                    </div>
                </label>
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.languages.map((lang, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                {lang}
                                <button
                                    type="button"
                                    onClick={() => removeLanguage(index)}
                                    className="hover:text-green-600 ml-1"
                                >
                  <X className="w-3 h-3" />
                </button>
              </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ajouter une langue (ex: Français, Anglais, Espagnol)"
                        />
                        <button
                            type="button"
                            onClick={addLanguage}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Liens sociaux */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Liens sociaux
                    </div>
                </label>
                <div>
                    <div className="space-y-2 mb-3">
                        {formData.socialLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                                    {getSocialIcon(link)}
                                    <span className="text-sm text-gray-600 truncate">{link}</span>
                                </div>
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
                            onKeyPress={(e) => e.key === 'Enter' && addSocialLink()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ajouter un lien social (ex: https://linkedin.com/in/utilisateur)"
                        />
                        <button
                            type="button"
                            onClick={addSocialLink}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions du formulaire */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>
        </form>
    );
};

export default EditProfileForm;