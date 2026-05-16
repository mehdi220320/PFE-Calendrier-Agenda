import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import type { Document, CreateDocumentData, UpdateDocumentData } from '../../models/Document';
import DocumentCard from './DocumentCard';
import DocumentModal from './DocumentModal';
import ConfirmDialog from './ConfirmDialog';
import ShareModal from './ShareModal';
import { Plus, RefreshCw, FileText, Send, Eye } from 'lucide-react';
import Header from "../../Component/Header";

const DocumentPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [modalCreationOuverte, setModalCreationOuverte] = useState(false);
    const [modalEditionOuverte, setModalEditionOuverte] = useState(false);
    const [modalPartageOuverte, setModalPartageOuverte] = useState(false);
    const [documentSelectionne, setDocumentSelectionne] = useState<Document | null>(null);
    const [documentPartage, setDocumentPartage] = useState<Document | null>(null);
    const [dialogConfirmation, setDialogConfirmation] = useState<{
        estOuvert: boolean;
        titre: string;
        message: string;
        onConfirmer: () => void;
    }>({
        estOuvert: false,
        titre: '',
        message: '',
        onConfirmer: () => {}
    });
    const [filtre, setFiltre] = useState<'tous' | 'envoyes' | 'consultes'>('tous');

    const recupererDocuments = async () => {
        try {
            setChargement(true);
            setErreur(null);
            const reponse = await documentService.getSentDocuments();
            setDocuments(reponse.documents);
        } catch (err: any) {
            setErreur(err.response?.data?.message || 'Échec de la récupération des documents');
            console.error('Erreur lors de la récupération des documents:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        recupererDocuments();
    }, []);

    const handleCreerDocument = async (donnees: CreateDocumentData) => {
        try {
            const reponse = await documentService.sendDocument(donnees);
            setDocuments(prev => [reponse.document, ...prev]);
            setModalCreationOuverte(false);
        } catch (err: any) {
            console.error('Erreur lors de la création du document:', err);
            throw err;
        }
    };

    const handleModifierDocument = async (id: string, donnees: UpdateDocumentData) => {
        try {
            const reponse = await documentService.updateDocument(id, donnees);
            setDocuments(prev => prev.map(doc =>
                doc.id === id ? reponse.document : doc
            ));
            setModalEditionOuverte(false);
            setDocumentSelectionne(null);
        } catch (err: any) {
            console.error('Erreur lors de la modification du document:', err);
            throw err;
        }
    };

    const handleSupprimerDocument = async (id: string) => {
        setDialogConfirmation({
            estOuvert: true,
            titre: 'Supprimer le document',
            message: 'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.',
            onConfirmer: async () => {
                try {
                    await documentService.deleteDocument(id);
                    setDocuments(prev => prev.filter(doc => doc.id !== id));
                    setDialogConfirmation({ ...dialogConfirmation, estOuvert: false });
                } catch (err: any) {
                    console.error('Erreur lors de la suppression du document:', err);
                    setErreur(err.response?.data?.message || 'Échec de la suppression du document');
                    setDialogConfirmation({ ...dialogConfirmation, estOuvert: false });
                }
            }
        });
    };

    const handleClicModifier = (document: Document) => {
        if (document.status === 'viewed') {
            setErreur('Impossible de modifier un document consulté');
            setTimeout(() => setErreur(null), 3000);
            return;
        }
        setDocumentSelectionne(document);
        setModalEditionOuverte(true);
    };

    const handlePartagerDocument = (document: Document) => {
        if (document.status === 'viewed') {
            setErreur('Impossible de partager un document déjà consulté');
            setTimeout(() => setErreur(null), 3000);
            return;
        }
        setDocumentPartage(document);
        setModalPartageOuverte(true);
    };

    const handleShareSuccess = async () => {
        await recupererDocuments();
    };

    const documentsFiltres = documents.filter(doc => {
        if (filtre === 'tous') return true;
        if (filtre === 'envoyes') return doc.status === 'sent';
        if (filtre === 'consultes') return doc.status === 'viewed';
        return true;
    });

    const obtenirNombreParStatut = () => {
        return {
            total: documents.length,
            envoyes: documents.filter(d => d.status === 'sent').length,
            consultes: documents.filter(d => d.status === 'viewed').length,
        };
    };

    const nombreParStatut = obtenirNombreParStatut();

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100 from-blue-50 via-white to-purple-50">
                {/* En-tête */}
                <div className=" sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Gestion des documents
                                </h1>
                                <p className="text-gray-600 mt-1">Gérez et suivez vos documents envoyés</p>
                            </div>
                            <button
                                onClick={() => setModalCreationOuverte(true)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Enregistrer un document
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Cartes de statistiques */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Total documents</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{nombreParStatut.total}</p>
                                </div>
                                <div className="bg-blue-100 rounded-full p-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Documents envoyés</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{nombreParStatut.envoyes}</p>
                                </div>
                                <div className="bg-green-100 rounded-full p-3">
                                    <Send className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Documents consultés</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{nombreParStatut.consultes}</p>
                                </div>
                                <div className="bg-purple-100 rounded-full p-3">
                                    <Eye className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFiltre('tous')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                        filtre === 'tous'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tous ({nombreParStatut.total})
                                </button>
                                <button
                                    onClick={() => setFiltre('envoyes')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                        filtre === 'envoyes'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Envoyés ({nombreParStatut.envoyes})
                                </button>
                                <button
                                    onClick={() => setFiltre('consultes')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                        filtre === 'consultes'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Consultés ({nombreParStatut.consultes})
                                </button>
                            </div>
                            <button
                                onClick={recupererDocuments}
                                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${chargement ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>
                        </div>
                    </div>

                    {/* Message d'erreur */}
                    {erreur && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{erreur}</p>
                        </div>
                    )}

                    {/* Grille des documents */}
                    {chargement ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : documentsFiltres.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun document trouvé</h3>
                            <p className="text-gray-500 mb-6">
                                {filtre === 'tous'
                                    ? "Vous n'avez encore envoyé aucun document."
                                    : filtre === 'envoyes'
                                        ? "Aucun document envoyé trouvé."
                                        : "Aucun document consulté trouvé."}
                            </p>
                            {documents.length===0 ? (<button
                                onClick={() => setModalCreationOuverte(true)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                <Plus className="w-5 h-5 mr-2"/>
                                Envoyer votre premier document
                            </button>): (<></>)
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {documentsFiltres.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    onEdit={handleClicModifier}
                                    onDelete={handleSupprimerDocument}
                                    onShare={handlePartagerDocument}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modales */}
                <DocumentModal
                    isOpen={modalCreationOuverte}
                    onClose={() => setModalCreationOuverte(false)}
                    onSubmit={handleCreerDocument}
                    mode="create"
                />

                {documentSelectionne && (
                    <DocumentModal
                        isOpen={modalEditionOuverte}
                        onClose={() => {
                            setModalEditionOuverte(false);
                            setDocumentSelectionne(null);
                        }}
                        onSubmit={(donnees) => handleModifierDocument(documentSelectionne.id, donnees)}
                        mode="edit"
                        initialData={documentSelectionne}
                    />
                )}

                {/* Modal de partage */}
                {documentPartage && (
                    <ShareModal
                        isOpen={modalPartageOuverte}
                        onClose={() => {
                            setModalPartageOuverte(false);
                            setDocumentPartage(null);
                        }}
                        document={documentPartage}
                        onShareSuccess={handleShareSuccess}
                    />
                )}

                <ConfirmDialog
                    isOpen={dialogConfirmation.estOuvert}
                    title={dialogConfirmation.titre}
                    message={dialogConfirmation.message}
                    onConfirm={dialogConfirmation.onConfirmer}
                    onCancel={() => setDialogConfirmation({ ...dialogConfirmation, estOuvert: false })}
                />
            </div>
        </>
    );
};

export default DocumentPage;