import React, { useState, useRef } from 'react';
import {
    User, Briefcase, FileText, Globe, Link as LinkIcon,
    Layers, Award, Github, Twitter, Linkedin, Edit, Camera, Mail, Phone
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
        if (url.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
        if (url.includes('github')) return <Github className="w-5 h-5" />;
        if (url.includes('twitter')) return <Twitter className="w-5 h-5" />;
        return <LinkIcon className="w-5 h-5" />;
    };

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

            {/* Header Section with Profile Picture */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Profile Picture */}
                    <div className="relative group flex-shrink-0">
                        <div className="h-40 w-40 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-xl">
                            {userDetails?.picture ? (
                                <img
                                    src={userDetails.picture}
                                    alt={`${userDetails.firstname} ${userDetails.lastname}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-5xl font-bold">
                                    {userDetails?.firstname?.charAt(0)}{userDetails?.lastname?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={triggerFileInput}
                            disabled={uploading || saving}
                            className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 hover:scale-110"
                            title="Changer la photo de profil"
                        >
                            {uploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-indigo-600"></div>
                            ) : (
                                <Camera className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">
                            {userDetails?.firstname} {userDetails?.lastname}
                        </h2>
                        {profile.headline && (
                            <p className="text-lg text-indigo-600 font-semibold mt-2">
                                {profile.headline}
                            </p>
                        )}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>{userDetails?.email}</span>
                            </div>
                            {userDetails?.phone && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>{userDetails.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                    >
                        <Edit className="w-5 h-5" />
                        Modifier
                    </button>
                </div>
            </div>

            {/* Category & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            Catégorie
                        </div>
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                        {profile.category || <span className="text-slate-400">Non spécifié</span>}
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Expérience
                        </div>
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                        {profile.experience} {profile.experience === 1 ? 'an' : 'ans'}
                    </p>
                </div>
            </div>

            {/* Biography */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Biographie
                    </div>
                </label>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {profile.bio || <span className="text-slate-400">Aucune biographie fournie</span>}
                </p>
            </div>

            {/* Competences */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Compétences
                    </div>
                </label>
                <div className="flex flex-wrap gap-3">
                    {profile.competences.length > 0 ? (
                        profile.competences.map((comp, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold"
                            >
                                {comp}
                            </span>
                        ))
                    ) : (
                        <p className="text-slate-500 italic">Aucune compétence ajoutée</p>
                    )}
                </div>
            </div>

            {/* Languages */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        Langues
                    </div>
                </label>
                <div className="flex flex-wrap gap-3">
                    {profile.languages.length > 0 ? (
                        profile.languages.map((lang, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold"
                            >
                                {lang}
                            </span>
                        ))
                    ) : (
                        <p className="text-slate-500 italic">Aucune langue ajoutée</p>
                    )}
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-5 h-5 text-indigo-600" />
                        Liens sociaux
                    </div>
                </label>
                <div className="space-y-3">
                    {profile.socialLinks.length > 0 ? (
                        profile.socialLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                            >
                                <span className="text-indigo-600">
                                    {getSocialIcon(link)}
                                </span>
                                <span className="text-sm text-indigo-600 hover:text-indigo-700 font-medium truncate">
                                    {link}
                                </span>
                            </a>
                        ))
                    ) : (
                        <p className="text-slate-500 italic">Aucun lien social ajouté</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;