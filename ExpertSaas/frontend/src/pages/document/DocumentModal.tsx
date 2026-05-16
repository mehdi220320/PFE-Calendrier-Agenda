import React, { useState, useEffect } from 'react';
import type { CreateDocumentData, UpdateDocumentData, Document } from '../../models/Document';
import { X, Upload, Trash2, FileText, AlertCircle, Search, User, Check, Send, Save, FileUp } from 'lucide-react';
import { userService } from '../../services/userService';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateDocumentData | UpdateDocumentData) => Promise<void>;
    mode: 'create' | 'edit';
    initialData?: Document;
}

interface UserOption {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    picture?: string;
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
    const [utilisateurs, setUtilisateurs] = useState<UserOption[]>([]);
    const [termeRecherche, setTermeRecherche] = useState('');
    const [afficherListeUtilisateurs, setAfficherListeUtilisateurs] = useState(false);
    const [chargementUtilisateurs, setChargementUtilisateurs] = useState(false);
    const [afficherDestinataire, setAfficherDestinataire] = useState(false);

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
            setDestinataireId(initialData.receiver || '');
            // Si un destinataire existe déjà, afficher le champ
            if (initialData.receiver && initialData.receiver !== 'undefined') {
                setAfficherDestinataire(true);
                const utilisateurTrouve = utilisateurs.find(u => u.id === initialData.receiver);
                if (utilisateurTrouve) {
                    setTermeRecherche(`${utilisateurTrouve.firstname} ${utilisateurTrouve.lastname} (${utilisateurTrouve.email})`);
                } else {
                    setTermeRecherche('Destinataire sélectionné');
                }
            }
        } else {
            reinitialiserFormulaire();
        }
    }, [mode, initialData, isOpen, utilisateurs]);

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
        setAfficherDestinataire(false);
    };

    const handleSoumettre = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titre.trim()) {
            setErreur('Le titre est requis');
            return;
        }

        if (mode === 'create' && fichiers.length === 0) {
            setErreur('Au moins un fichier est requis');
            return;
        }

        // Validate UUID format if receiver is provided
        if (destinataireId && destinataireId !== 'undefined') {
            const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!regexUUID.test(destinataireId)) {
                setErreur('Format UUID invalide. Veuillez sélectionner un utilisateur valide dans la liste.');
                return;
            }
        }

        setChargement(true);
        setErreur(null);

        try {
            if (mode === 'create') {
                const donnees: CreateDocumentData = {
                    title: titre.trim(),
                    description: description.trim() || undefined,
                    summary: resume.trim() || undefined,
                    receiverId: destinataireId && destinataireId !== 'undefined' ? destinataireId : undefined,
                    files: fichiers
                };
                await onSubmit(donnees);
            } else {
                const donnees: UpdateDocumentData = {};
                if (titre !== initialData?.title) donnees.title = titre.trim();
                if (description !== (initialData?.description || '')) donnees.description = description.trim() || undefined;
                if (resume !== (initialData?.summary || '')) donnees.summary = resume.trim() || undefined;
                if (destinataireId !== (initialData?.receiver || '')) {
                    donnees.receiverId = destinataireId && destinataireId !== 'undefined' ? destinataireId : undefined;
                }

                if (Object.keys(donnees).length > 0) {
                    await onSubmit(donnees);
                } else {
                    setErreur('Aucune modification à enregistrer');
                    setChargement(false);
                    return;
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

    const handleSelectionUtilisateur = (utilisateur: UserOption) => {
        setDestinataireId(utilisateur.id);
        setTermeRecherche(`${utilisateur.firstname} ${utilisateur.lastname} (${utilisateur.email})`);
        setAfficherListeUtilisateurs(false);
    };

    const handleViderDestinataire = () => {
        setDestinataireId('');
        setTermeRecherche('');
        setAfficherDestinataire(false);
    };

    const handleActiverDestinataire = () => {
        setAfficherDestinataire(true);
    };

    const utilisateursFiltres = utilisateurs.filter(utilisateur =>
        utilisateur.firstname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        utilisateur.lastname?.toLowerCase().includes(termeRecherche.toLowerCase()) ||
        utilisateur.email?.toLowerCase().includes(termeRecherche.toLowerCase())
    );

    // Déterminer le titre de la modal
    const getModalTitle = () => {
        if (mode === 'edit') return 'Modifier le document';
        if (afficherDestinataire && destinataireId) return 'Envoyer le document';
        if (afficherDestinataire && !destinataireId) return 'Envoyer le document - Choisir destinataire';
        return 'Enregistrer le document';
    };

    // Déterminer le texte du bouton principal
    const getSubmitButtonText = () => {
        if (chargement) {
            return mode === 'create' ? 'Envoi en cours...' : 'Enregistrement...';
        }
        if (mode === 'edit') return 'Enregistrer les modifications';
        if (afficherDestinataire && destinataireId) return 'Envoyer le document';
        if (afficherDestinataire && !destinataireId) return 'Continuer vers l\'envoi';
        return 'Enregistrer le document';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Fond d'arrière-plan */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Conteneur de la modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all">
                    <form onSubmit={handleSoumettre}>
                        {/* En-tête simplifié */}
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {getModalTitle()}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {mode === 'create'
                                            ? 'Remplissez les informations ci-dessous'
                                            : 'Modifiez les informations du document'
                                        }
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

                        {/* Corps */}
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

                            <div className="space-y-5">
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={titre}
                                        onChange={(e) => setTitre(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Ex: Contrat de vente, Facture, Rapport..."
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                        placeholder="Description détaillée du document..."
                                    />
                                </div>

                                {/* Résumé */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Résumé
                                    </label>
                                    <textarea
                                        value={resume}
                                        onChange={(e) => setResume(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                        placeholder="Résumé rapide du contenu..."
                                    />
                                </div>

                                {/* Upload fichiers - seulement en mode création */}
                                {mode === 'create' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pièces jointes <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                                dragActif
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('fichier-upload')?.click()}
                                        >
                                            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-base text-gray-600 mb-2">
                                                Glissez-déposez vos fichiers ici
                                            </p>
                                            <p className="text-sm text-gray-500 mb-3">
                                                ou
                                            </p>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById('fichier-upload')?.click();
                                                }}
                                            >
                                                <Upload className="w-4 h-4" />
                                                Parcourir les fichiers
                                            </button>
                                            <p className="text-xs text-gray-400 mt-3">
                                                Taille maximale : 100 Mo par fichier
                                            </p>
                                            <input
                                                type="file"
                                                id="fichier-upload"
                                                multiple
                                                onChange={handleSelectionFichiers}
                                                className="hidden"
                                            />
                                        </div>

                                        {fichiers.length > 0 && (
                                            <div className="mt-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-medium text-gray-700">
                                                        Fichiers sélectionnés ({fichiers.length})
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFichiers([])}
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                    >
                                                        Tout supprimer
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                                                    {fichiers.map((fichier, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-sm transition-shadow">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 truncate">{fichier.name}</span>
                                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                                    ({(fichier.size / 1024 / 1024).toFixed(2)} Mo)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => supprimerFichier(index)}
                                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
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

                                {/* Section Destinataire - Dernier champ */}
                                <div className="pt-2">
                                    {!afficherDestinataire && mode === 'create' && (
                                        <button
                                            type="button"
                                            onClick={handleActiverDestinataire}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
                                        >
                                            <Send className="w-5 h-5" />
                                            <span>Envoyer à quelqu'un</span>
                                        </button>
                                    )}

                                    {(afficherDestinataire || mode === 'edit') && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Destinataire
                                                    <span className="text-gray-400 text-xs ml-2 font-normal">(Optionnel)</span>
                                                </label>
                                                {mode === 'create' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleViderDestinataire}
                                                        className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Retirer
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                        placeholder="Rechercher par nom, prénom ou email..."
                                                    />
                                                </div>

                                                {afficherListeUtilisateurs && (
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
                                                        ) :
                                                            (utilisateursFiltres.map((utilisateur) => (
                                                                    <button
                                                                        key={utilisateur.id}
                                                                        type="button"
                                                                        onClick={() => handleSelectionUtilisateur(utilisateur)}
                                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                                                                    >
                                                                        {/* Avatar avec photo ou initiales */}
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
                                                                    </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {destinataireId && (
                                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                    <p className="text-sm text-blue-700">
                                                        Document sera envoyé à ce destinataire
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pied de page */}
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={chargement}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                            >
                                {chargement ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{mode === 'create' ? 'Envoi...' : 'Enregistrement...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'create' && !afficherDestinataire && <Save className="w-4 h-4" />}
                                        {mode === 'create' && afficherDestinataire && <Send className="w-4 h-4" />}
                                        {mode === 'edit' && <Save className="w-4 h-4" />}
                                        <span>{getSubmitButtonText()}</span>
                                    </>
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