import React, { useState, useEffect } from 'react';
import type { CreateDocumentData, UpdateDocumentData, Document } from '../../models/Document';
import { X, Upload, Trash2, FileText, AlertCircle, Search, User } from 'lucide-react';
import { userService } from '../../services/userService';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateDocumentData | UpdateDocumentData) => Promise<void>;
    mode: 'create' | 'edit';
    initialData?: Document;
}

interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onSubmit,
                                                         mode,
                                                         initialData
                                                     }) => {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [resume, setResume] = useState('');
    const [destinataireId, setDestinataireId] = useState('');
    const [fichiers, setFichiers] = useState<File[]>([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const [dragActif, setDragActif] = useState(false);
    const [utilisateurs, setUtilisateurs] = useState<User[]>([]);
    const [termeRecherche, setTermeRecherche] = useState('');
    const [afficherListeUtilisateurs, setAfficherListeUtilisateurs] = useState(false);
    const [chargementUtilisateurs, setChargementUtilisateurs] = useState(false);

    // Récupérer les utilisateurs lorsque la modal s'ouvre
    useEffect(() => {
        if (isOpen && mode === 'create') {
            recupererUtilisateurs();
        }
    }, [isOpen, mode]);

    // Empêcher le défilement du body lorsque la modal est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setTitre(initialData.title);
            setDescription(initialData.description || '');
            setResume(initialData.summary || '');
            setDestinataireId(initialData.receiver);
        } else {
            reinitialiserFormulaire();
        }
    }, [mode, initialData, isOpen]);

    const recupererUtilisateurs = async () => {
        try {
            setChargementUtilisateurs(true);
            const reponse = await userService.getAllclients();
            setUtilisateurs(reponse.users || reponse);
        } catch (erreur) {
            console.error('Erreur lors de la récupération des utilisateurs:', erreur);
        } finally {
            setChargementUtilisateurs(false);
        }
    };

    const reinitialiserFormulaire = () => {
        setTitre('');
        setDescription('');
        setResume('');
        setDestinataireId('');
        setFichiers([]);
        setErreur(null);
        setTermeRecherche('');
        setAfficherListeUtilisateurs(false);
    };

    const handleSoumettre = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titre.trim()) {
            setErreur('Le titre est requis');
            return;
        }

        if (mode === 'create' && !destinataireId.trim()) {
            setErreur('Le destinataire est requis');
            return;
        }

        if (mode === 'create' && fichiers.length === 0) {
            setErreur('Au moins un fichier est requis');
            return;
        }

        // Valider le format UUID
        const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (mode === 'create' && !regexUUID.test(destinataireId)) {
            setErreur('Format UUID invalide. Veuillez sélectionner un utilisateur valide dans la liste.');
            return;
        }

        setChargement(true);
        setErreur(null);

        try {
            if (mode === 'create') {
                const donnees: CreateDocumentData = {
                    title: titre.trim(),
                    description: description.trim() || undefined,
                    summary: resume.trim() || undefined,
                    receiverId: destinataireId.trim(),
                    files: fichiers
                };
                await onSubmit(donnees);
            } else {
                const donnees: UpdateDocumentData = {};
                if (titre !== initialData?.title) donnees.title = titre.trim();
                if (description !== (initialData?.description || '')) donnees.description = description.trim() || undefined;
                if (resume !== (initialData?.summary || '')) donnees.summary = resume.trim() || undefined;

                if (Object.keys(donnees).length > 0) {
                    await onSubmit(donnees);
                }
            }
            onClose();
            reinitialiserFormulaire();
        } catch (err: any) {
            setErreur(err.response?.data?.message || 'Échec de l\'enregistrement du document');
        } finally {
            setChargement(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActif(true);
        } else if (e.type === 'dragleave') {
            setDragActif(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActif(false);
        const fichiersDeposes = Array.from(e.dataTransfer.files);
        setFichiers(prev => [...prev, ...fichiersDeposes]);
    };

    const handleSelectionFichiers = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fichiersSelectionnes = Array.from(e.target.files);
            setFichiers(prev => [...prev, ...fichiersSelectionnes]);
        }
    };

    const supprimerFichier = (index: number) => {
        setFichiers(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelectionUtilisateur = (utilisateur: User) => {
        setDestinataireId(utilisateur.id);
        setTermeRecherche(`${utilisateur.firstname} ${utilisateur.lastname} (${utilisateur.email})`);
        setAfficherListeUtilisateurs(false);
    };

    const utilisateursFiltres = utilisateurs.filter(utilisateur =>
        utilisateur.firstname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        utilisateur.lastname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        utilisateur.email?.toLowerCase().includes(termeRecherche.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Fond d'arrière-plan */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Conteneur de la modal */}
            <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-8 mb-8">
                    <form onSubmit={handleSoumettre}>
                        {/* En-tête */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white">
                                    {mode === 'create' ? 'Envoyer un document' : 'Modifier le document'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Corps */}
                        <div className="px-6 py-4">
                            {erreur && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{erreur}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre *
                                    </label>
                                    <input
                                        type="text"
                                        value={titre}
                                        onChange={(e) => setTitre(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        placeholder="Saisir le titre du document"
                                        required
                                    />
                                </div>

                                {mode === 'create' && (
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Destinataire *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={termeRecherche}
                                                onChange={(e) => {
                                                    setTermeRecherche(e.target.value);
                                                    setAfficherListeUtilisateurs(true);
                                                    if (!e.target.value) {
                                                        setDestinataireId('');
                                                    }
                                                }}
                                                onFocus={() => setAfficherListeUtilisateurs(true)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow pl-10"
                                                placeholder="Rechercher un utilisateur par nom ou email..."
                                            />
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        </div>

                                        {afficherListeUtilisateurs && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {chargementUtilisateurs ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        Chargement des utilisateurs...
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
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-0"
                                                        >
                                                            {utilisateur.picture ? (
                                                                <img
                                                                    src={utilisateur.picture}
                                                                    alt={`${utilisateur.firstname} ${utilisateur.lastname}`}
                                                                    className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {utilisateur.firstname} {utilisateur.lastname}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {utilisateur.email}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {destinataireId && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Utilisateur sélectionné
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        placeholder="Saisir la description du document"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Résumé
                                    </label>
                                    <textarea
                                        value={resume}
                                        onChange={(e) => setResume(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        placeholder="Saisir le résumé du document"
                                    />
                                </div>

                                {mode === 'create' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pièces jointes * (10 fichiers maximum)
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                                                dragActif
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('fichier-upload')?.click()}
                                        >
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner
                                            </p>
                                            <input
                                                type="file"
                                                id="fichier-upload"
                                                multiple
                                                onChange={handleSelectionFichiers}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById('fichier-upload')?.click();
                                                }}
                                            >
                                                Parcourir les fichiers
                                            </button>
                                            <p className="text-xs text-gray-500 mt-3">
                                                Taille maximale : 100 Mo par fichier
                                            </p>
                                        </div>

                                        {fichiers.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <h4 className="text-sm font-medium text-gray-700">
                                                    Fichiers sélectionnés ({fichiers.length}) :
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                                    {fichiers.map((fichier, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 truncate">{fichier.name}</span>
                                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                                    ({(fichier.size / 1024 / 1024).toFixed(2)} Mo)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => supprimerFichier(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pied de page */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={chargement}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {chargement ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {mode === 'create' ? 'Envoi...' : 'Enregistrement...'}
                                    </div>
                                ) : (
                                    mode === 'create' ? 'Envoyer le document' : 'Enregistrer les modifications'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;