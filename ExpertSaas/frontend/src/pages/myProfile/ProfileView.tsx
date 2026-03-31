import React, { useState, useRef } from 'react';
import {
    User, Briefcase, FileText, Globe, Link as LinkIcon,
    Layers, Award, Github, Twitter, Linkedin, Edit, Camera, Mail, Phone, MapPin
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
    userDetails: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string | null;
        picture: string | null;
    } | null;
    onEdit: () => void;
    onUpdatePicture: (file: File) => Promise<void>;
    saving: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({
                                                     profile,
                                                     userDetails,
                                                     onEdit,
                                                     onUpdatePicture,
                                                     saving
                                                 }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getSocialIcon = (url: string) => {
        if (url.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (url.includes('github')) return <Github className="w-4 h-4" />;
        if (url.includes('twitter')) return <Twitter className="w-4 h-4" />;
        return <LinkIcon className="w-4 h-4" />;
    };

    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La taille de l\'image ne doit pas dépasser 5MB');
            return;
        }

        // Validate file type
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

    return (
        <div className="space-y-6">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                accept="image/*"
                className="hidden"
            />

            {/* En-tête avec photo et informations utilisateur */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Photo de profil avec upload */}
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                            {userDetails?.picture ? (
                                <img
                                    src={userDetails.picture}
                                    alt={`${userDetails.firstname} ${userDetails.lastname}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-3xl font-bold">
                                    {userDetails?.firstname?.charAt(0)}{userDetails?.lastname?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={triggerFileInput}
                            disabled={uploading || saving}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            title="Changer la photo de profil"
                        >
                            {uploading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Informations utilisateur */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {userDetails?.firstname} {userDetails?.lastname}
                        </h2>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{userDetails?.email}</span>
                            </div>
                            {userDetails?.phone && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{userDetails.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bouton d'édition */}
                    <div>
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Modifier le profil
                        </button>
                    </div>
                </div>
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