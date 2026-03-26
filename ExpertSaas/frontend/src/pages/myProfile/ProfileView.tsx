import React from 'react';
import {
    User, Briefcase, FileText, Globe, Link as LinkIcon,
    Layers, Award, Github, Twitter, Linkedin, Edit
} from 'lucide-react';

interface ProfileViewProps {
    profile: {
        headline: string | null;
        bio: string | null;
        category: string | null;
        experience: number;
        competences: string[];
        languages: string[];
        socialLinks: string[];
    };
    onEdit: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit }) => {
    const getSocialIcon = (url: string) => {
        if (url.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (url.includes('github')) return <Github className="w-4 h-4" />;
        if (url.includes('twitter')) return <Twitter className="w-4 h-4" />;
        return <LinkIcon className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec bouton d'édition */}
            <div className="flex justify-end">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    Modifier le profil
                </button>
            </div>

            {/* Titre professionnel */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Titre professionnel
                    </div>
                </label>
                <p className="text-gray-800">{profile.headline || 'Non spécifié'}</p>
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
                    <p className="text-gray-800">{profile.category || 'Non spécifié'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Expérience (Années)
                        </div>
                    </label>
                    <p className="text-gray-800">
                        {profile.experience} {profile.experience === 1 ? 'an' : 'ans'}
                    </p>
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
                <p className="text-gray-800 whitespace-pre-wrap">
                    {profile.bio || 'Aucune biographie fournie'}
                </p>
            </div>

            {/* Compétences */}
            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Compétences / Savoir-faire
                    </div>
                </label>
                <div className="flex flex-wrap gap-2">
                    {profile.competences.length > 0 ? (
                        profile.competences.map((comp, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                {comp}
              </span>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucune compétence ajoutée</p>
                    )}
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
                <div className="flex flex-wrap gap-2">
                    {profile.languages.length > 0 ? (
                        profile.languages.map((lang, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                {lang}
              </span>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucune langue ajoutée</p>
                    )}
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
                <div className="space-y-2">
                    {profile.socialLinks.length > 0 ? (
                        profile.socialLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {getSocialIcon(link)}
                                <span className="text-sm truncate">{link}</span>
                            </a>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucun lien social ajouté</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;