import React, { useState } from 'react';
import type { Document } from '../../models/Document';
import { documentService } from '../../services/documentService';
import { iaService } from '../../services/iaService';
import {
    Download,
    Edit2,
    Trash2,
    User,
    Calendar,
    Paperclip,
    ChevronDown,
    ChevronUp,
    Share2,
    Users,
    Sparkles,
    X,
    Loader2,
    FileText,
    Brain,
    Tag,
    AlertCircle
} from 'lucide-react';

interface DocumentCardProps {
    document: Document;
    onEdit: (document: Document) => void;
    onDelete: (id: string) => void;
    onShare?: (document: Document) => void;
}

interface AISummaryData {
    summary: string;
    themes: string[];
    keyPoints: string[];
    documentType: string;
    sentiment: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit, onDelete, onShare }) => {
    const [estDeplie, setEstDeplie] = useState(false);
    const [estEnTelechargement, setEstEnTelechargement] = useState<string | null>(null);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const obtenirCouleurStatut = (statut: string) => {
        switch (statut) {
            case 'sent':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'viewed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'received':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const obtenirIconeStatut = (statut: string) => {
        switch (statut) {
            case 'sent':
                return '📤';
            case 'viewed':
                return '👁️';
            case 'pending':
                return '⏳';
            case 'received':
                return '📥';
            default:
                return '📄';
        }
    };

    const handleTelecharger = (urlFichier: string, nomFichier: string) => {
        try {
            setEstEnTelechargement(nomFichier);
            window.open(urlFichier, '_blank');
            setTimeout(() => {
                setEstEnTelechargement(null);
            }, 500);
        } catch (erreur: any) {
            console.error('Erreur lors du téléchargement:', erreur);
            setEstEnTelechargement(null);
        }
    };

    const handleAIAnalysis = async () => {
        if (!document.files || document.files.length === 0) {
            setAiError("Aucun fichier à analyser");
            setShowAIPopup(true);
            return;
        }

        setIsAnalyzing(true);
        setAiError(null);
        setShowAIPopup(true);

        try {
            // Get the first file from the document
            const firstFile = document.files[0];

            // Analyze the file from URL
            const result = await iaService.analyzeFromUrl(firstFile.fileUrl, firstFile.fileName);

            if (result.status === 'success' && result.data) {
                setAiSummary({
                    summary: result.data.aiSummary.summary,
                    themes: result.data.aiSummary.themes,
                    keyPoints: result.data.aiSummary.keyPoints,
                    documentType: result.data.aiSummary.documentType,
                    sentiment: result.data.aiSummary.sentiment
                });
            } else {
                setAiError("L'analyse n'a pas pu être complétée");
            }
        } catch (error: any) {
            console.error('AI Analysis error:', error);
            setAiError(error.error || "Erreur lors de l'analyse du document");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formaterDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tronquerTexte = (texte: string, longueurMax: number) => {
        if (texte.length <= longueurMax) return texte;
        return texte.substring(0, longueurMax) + '...';
    };

    const getSentimentColor = (sentiment: string) => {
        const sentimentLower = sentiment.toLowerCase();
        if (sentimentLower.includes('positive') || sentimentLower.includes('optimistic')) {
            return 'text-green-600 bg-green-50';
        } else if (sentimentLower.includes('negative') || sentimentLower.includes('pessimistic')) {
            return 'text-red-600 bg-red-50';
        } else if (sentimentLower.includes('neutral')) {
            return 'text-gray-600 bg-gray-50';
        } else if (sentimentLower.includes('professional')) {
            return 'text-blue-600 bg-blue-50';
        } else {
            return 'text-purple-600 bg-purple-50';
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                {/* En-tête */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {document.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${obtenirCouleurStatut(document.status)}`}>
                                    <span>{obtenirIconeStatut(document.status)}</span>
                                    <span className="capitalize">
                                        {document.status === 'sent' ? 'envoyé' :
                                            document.status === 'viewed' ? 'consulté' :
                                                document.status === 'pending' ? 'en attente' :
                                                    document.status === 'received' ? 'reçu' : document.status}
                                    </span>
                                </span>
                                {document.files && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        <Paperclip className="w-3 h-3" />
                                        {document.files.length} fichier{document.files.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {document.sharedWith && document.sharedWith.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                        <Users className="w-3 h-3" />
                                        Partagé ({document.sharedWith.length})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2">
                            {/* AI Summary Button */}
                            {document.files && document.files.length > 0 && (
                                <button
                                    onClick={handleAIAnalysis}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group relative"
                                    title="Analyser avec l'IA"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span className="absolute inset-0 rounded-lg ring-2 ring-purple-400 ring-opacity-0 group-hover:ring-opacity-50 transition-all"></span>
                                </button>
                            )}
                            {document.status !== 'viewed' && (
                                <button
                                    onClick={() => onEdit(document)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier le document"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                            {document.status !== 'viewed' && onShare && (
                                <button
                                    onClick={() => onShare(document)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Partager le document"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            )}
                            {document.status !== 'viewed' && (
                                <button
                                    onClick={() => onDelete(document.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer le document"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Informations destinataire */}
                    <div className="flex justify-between items-start text-sm text-gray-600 mb-2">
                        {/* LEFT SIDE */}
                        {document.receiverUser !== null && (
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 mt-0.5" />
                                <div className="flex flex-col">
                                    <span>
                                        Envoyé à:{' '}
                                        <span className="font-medium">
                                            {document.receiverUser?.name || document.receiver}
                                        </span>
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {document.receiverUser?.email}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* RIGHT SIDE (DATE) */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formaterDate(document.createdAt)}</span>
                        </div>
                    </div>

                    {/* Afficher les utilisateurs avec qui le document est partagé */}
                    {document.sharedWith && document.sharedWith.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-start gap-2">
                                <Users className="w-4 h-4 text-purple-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                        Partagé avec {document.sharedWith.length} personne{document.sharedWith.length !== 1 ? 's' : ''} :
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {document.sharedWith.map((userId, index) => (
                                            <span key={index} className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                                {userId.substring(0, 8)}...
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Corps - Flex grow pour repousser le footer vers le bas */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {document.description && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description :</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {estDeplie ? document.description : tronquerTexte(document.description, 150)}
                                {document.description.length > 150 && (
                                    <button
                                        onClick={() => setEstDeplie(!estDeplie)}
                                        className="ml-2 text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-sm"
                                    >
                                        {estDeplie ? (
                                            <>Voir moins <ChevronUp className="w-3 h-3" /></>
                                        ) : (
                                            <>Lire la suite <ChevronDown className="w-3 h-3" /></>
                                        )}
                                    </button>
                                )}
                            </p>
                        </div>
                    )}

                    {document.summary && (
                        <div className="mb-4 bg-blue-50 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Résumé :</h4>
                            <p className="text-blue-800 text-sm">{document.summary}</p>
                        </div>
                    )}

                    {/* Section des fichiers */}
                    {document.files && document.files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Fichiers joints ({document.files.length})
                            </h4>
                            <div className="space-y-2">
                                {document.files.map((fichier, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="text-2xl">
                                                {documentService.getFileIcon(fichier.fileType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {fichier.fileName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {documentService.formatFileSize(fichier.fileSize)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleTelecharger(fichier.fileUrl, fichier.fileName)}
                                            disabled={estEnTelechargement === fichier.fileName}
                                            className="ml-3 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Télécharger le fichier"
                                        >
                                            {estEnTelechargement === fichier.fileName ? (
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pied de page - Fixé au bas grâce à flex layout */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 mt-auto">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>ID du document : {document.id.slice(0, 8)}...</span>
                        <span>Dernière mise à jour : {formaterDate(document.updatedAt)}</span>
                    </div>
                </div>
            </div>

            {/* AI Summary Popup Modal */}
            {showAIPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-50 flex items-center justify-center p-4  ">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Analyse IA du Document
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {document.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAIPopup(false);
                                    setAiSummary(null);
                                    setAiError(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                                    <p className="text-gray-600 font-medium">Analyse du document en cours...</p>
                                    <p className="text-sm text-gray-400 mt-2">Cela peut prendre quelques secondes</p>
                                </div>
                            ) : aiError ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur d'analyse</h3>
                                    <p className="text-red-600">{aiError}</p>
                                    <button
                                        onClick={handleAIAnalysis}
                                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            ) : aiSummary && (
                                <div className="space-y-6">
                                    {/* Summary Section */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-semibold text-gray-800">Résumé Général</h3>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {aiSummary.summary}
                                        </p>
                                    </div>

                                    {/* Document Type & Sentiment */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Type de document</h4>
                                            <p className="text-gray-800 font-medium">{aiSummary.documentType}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ton général</h4>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(aiSummary.sentiment)}`}>
                                                {aiSummary.sentiment}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Key Points */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1 bg-green-100 rounded">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-800">Points Clés</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {aiSummary.keyPoints.map((point, index) => (
                                                <li key={index} className="flex items-start gap-2 text-gray-700">
                                                    <span className="text-green-500 mt-1">•</span>
                                                    <span className="text-sm">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Themes */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Tag className="w-4 h-4 text-purple-600" />
                                            <h3 className="font-semibold text-gray-800">Thèmes Principaux</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {aiSummary.themes.map((theme, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                                                >
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowAIPopup(false);
                                    setAiSummary(null);
                                    setAiError(null);
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DocumentCard;