import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users, Send, AlertCircle, Trash2 } from 'lucide-react';
import { documentService } from '../../services/documentService';
import { userService } from '../../services/userService';
import type { Document } from '../../models/Document';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document;
    onShareSuccess: () => void;
}

interface UserOption {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    picture?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   document,
                                                   onShareSuccess
                                               }) => {
    const [utilisateurs, setUtilisateurs] = useState<UserOption[]>([]);
    const [utilisateursSelectionnes, setUtilisateursSelectionnes] = useState<Set<string>>(new Set());
    const [utilisateursPartages, setUtilisateursPartages] = useState<UserOption[]>([]);
    const [termeRecherche, setTermeRecherche] = useState('');
    const [afficherListeUtilisateurs, setAfficherListeUtilisateurs] = useState(false);
    const [chargementUtilisateurs, setChargementUtilisateurs] = useState(false);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const [succes, setSucces] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && document) {
            const sharedSet = new Set(document.sharedWith || []);
            setUtilisateursSelectionnes(sharedSet);
            recupererUtilisateurs();
        }
    }, [isOpen, document]);

    const recupererUtilisateurs = async () => {
        try {
            setChargementUtilisateurs(true);
            const reponse = await userService.getAllclients();
            const utilisateursData = reponse.users || reponse;

            // Filter out current user
            const filtered = utilisateursData.filter((u: UserOption) =>
                u.id !== document.sender
            );
            setUtilisateurs(filtered);

            // Get details of already shared users
            const sharedUsers = filtered.filter((u: UserOption) =>
                document.sharedWith?.includes(u.id)
            );
            setUtilisateursPartages(sharedUsers);

        } catch (erreur) {
            console.error('Erreur lors de la récupération des utilisateurs:', erreur);
            setErreur('Impossible de récupérer la liste des utilisateurs');
        } finally {
            setChargementUtilisateurs(false);
        }
    };

    const handleSelectionUtilisateur = (utilisateur: UserOption) => {
        if (utilisateursSelectionnes.has(utilisateur.id)) {
            // Remove from selection
            setUtilisateursSelectionnes(prev => {
                const newSet = new Set(prev);
                newSet.delete(utilisateur.id);
                return newSet;
            });
            setUtilisateursPartages(prev => prev.filter(u => u.id !== utilisateur.id));
        } else {
            // Add to selection
            setUtilisateursSelectionnes(prev => new Set(prev).add(utilisateur.id));
            setUtilisateursPartages(prev => [...prev, utilisateur]);
        }
        setTermeRecherche('');
        setAfficherListeUtilisateurs(false);
    };

    const handlePartager = async () => {
        if (utilisateursSelectionnes.size === 0) {
            setErreur('Veuillez sélectionner au moins un utilisateur');
            return;
        }

        const userIds = Array.from(utilisateursSelectionnes);
        const alreadyShared = document.sharedWith || [];
        const newUsers = userIds.filter(id => !alreadyShared.includes(id));

        if (newUsers.length === 0) {
            setErreur('Ces utilisateurs sont déjà partagés');
            return;
        }

        setChargement(true);
        setErreur(null);
        setSucces(null);

        try {
            await documentService.shareDocument(document.id, { userIds: newUsers });
            setSucces(`Document partagé avec ${newUsers.length} utilisateur${newUsers.length > 1 ? 's' : ''}`);
            setTimeout(() => {
                onShareSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setErreur(err.response?.data?.message || 'Échec du partage du document');
        } finally {
            setChargement(false);
        }
    };

    const handleRetirerPartage = async (userId: string) => {
        setChargement(true);
        setErreur(null);

        try {
            await documentService.unshareDocument(document.id, userId);
            setUtilisateursSelectionnes(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            setUtilisateursPartages(prev => prev.filter(u => u.id !== userId));
            setSucces('Partage retiré avec succès');
            setTimeout(() => setSucces(null), 3000);
            onShareSuccess();
        } catch (err: any) {
            setErreur(err.response?.data?.message || 'Échec du retrait du partage');
        } finally {
            setChargement(false);
        }
    };

    const utilisateursFiltres = utilisateurs.filter(utilisateur =>
        !utilisateursSelectionnes.has(utilisateur.id) &&
        (utilisateur.firstname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
            utilisateur.lastname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
            utilisateur.email?.toLowerCase().includes(termeRecherche.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Partager le document
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    "{document.title}"
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                        {erreur && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800">Erreur</p>
                                    <p className="text-sm text-red-700 mt-1">{erreur}</p>
                                </div>
                            </div>
                        )}

                        {succes && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800">Succès</p>
                                    <p className="text-sm text-green-700 mt-1">{succes}</p>
                                </div>
                            </div>
                        )}

                        {/* Currently shared users */}
                        {utilisateursPartages.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <Users className="w-4 h-4 inline mr-2" />
                                    Partagé avec ({utilisateursPartages.length})
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                                    {utilisateursPartages.map((utilisateur) => (
                                        <div key={utilisateur.id} className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 overflow-hidden bg-gradient-to-br from-green-500 to-green-600">
                                                    {utilisateur.picture ? (
                                                        <img
                                                            src={utilisateur.picture}
                                                            alt={`${utilisateur.firstname} ${utilisateur.lastname}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {utilisateur.firstname?.[0]}{utilisateur.lastname?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {utilisateur.firstname} {utilisateur.lastname}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {utilisateur.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRetirerPartage(utilisateur.id)}
                                                disabled={chargement}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                                title="Retirer le partage"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add new users to share */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Ajouter des utilisateurs
                            </label>

                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={termeRecherche}
                                        onChange={(e) => {
                                            setTermeRecherche(e.target.value);
                                            setAfficherListeUtilisateurs(true);
                                        }}
                                        onFocus={() => setAfficherListeUtilisateurs(true)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Rechercher par nom, prénom ou email..."
                                    />
                                </div>

                                {afficherListeUtilisateurs && termeRecherche && (
                                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                        {chargementUtilisateurs ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                                                Chargement...
                                            </div>
                                        ) : utilisateursFiltres.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                Aucun utilisateur trouvé
                                            </div>
                                        ) : (
                                            utilisateursFiltres.map((utilisateur) => (
                                                <button
                                                    key={utilisateur.id}
                                                    type="button"
                                                    onClick={() => handleSelectionUtilisateur(utilisateur)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
                                                        {utilisateur.picture ? (
                                                            <img
                                                                src={utilisateur.picture}
                                                                alt={`${utilisateur.firstname} ${utilisateur.lastname}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>
                                                                {utilisateur.firstname?.[0]}{utilisateur.lastname?.[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {utilisateur.firstname} {utilisateur.lastname}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {utilisateur.email}
                                                        </p>
                                                    </div>
                                                    {utilisateursSelectionnes.has(utilisateur.id) && (
                                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hint text */}
                            {!afficherListeUtilisateurs && !termeRecherche && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Commencez à taper pour rechercher des utilisateurs...
                                </p>
                            )}
                        </div>

                        {/* Selected users summary */}
                        {utilisateursPartages.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700">
                                    <Check className="w-4 h-4 inline mr-1" />
                                    {utilisateursPartages.length} utilisateur{utilisateursPartages.length > 1 ? 's' : ''} partagé{utilisateursPartages.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handlePartager}
                            disabled={chargement || utilisateursSelectionnes.size === 0}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                        >
                            {chargement ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Partage en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Partager</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;