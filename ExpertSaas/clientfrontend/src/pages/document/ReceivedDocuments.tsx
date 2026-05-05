// pages/documents/ReceivedDocuments.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../component/Header';
import DocumentCard from './DocumentCard';
import { documentService } from '../../services/documentService';
import type { Document } from '../../models/Document';
import { toast, Toaster } from 'react-hot-toast';

const ReceivedDocuments: React.FC = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchReceivedDocuments();
    }, []);

    // Auto-open document if documentId is in URL
    useEffect(() => {
        if (documentId && documents.length > 0) {
            const document = documents.find(doc => doc.id === documentId);
            if (document) {
                handleViewDocument(document);
                // Remove documentId from URL without refreshing
                navigate('/documents', { replace: true });
            }
        }
    }, [documentId, documents]);

    const fetchReceivedDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentService.getReceivedDocuments();
            setDocuments(response.documents);
        } catch (error) {
            console.error('Erreur lors du chargement des documents:', error);
            toast.error('Erreur lors du chargement de vos documents');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = async (document: Document) => {
        try {
            await documentService.markAsViewed(document.id);
            setDocuments(prevDocs =>
                prevDocs.map(doc =>
                    doc.id === document.id
                        ? { ...doc, status: 'viewed' }
                        : doc
                )
            );
            setSelectedDocument({ ...document, status: 'viewed' });
        } catch (error) {
            console.error('Erreur lors du marquage du document:', error);
            setSelectedDocument(document);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document de votre boîte de réception ?')) {
            return;
        }

        try {
            setDeletingId(documentId);
            await documentService.deleteFromInbox(documentId);
            toast.success('Document supprimé avec succès');
            fetchReceivedDocuments();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur lors de la suppression du document');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = [...documents];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(doc =>
                doc.title.toLowerCase().includes(term) ||
                (doc.description && doc.description.toLowerCase().includes(term)) ||
                (doc.senderUser?.firstname?.toLowerCase().includes(term)) ||
                (doc.senderUser?.lastname?.toLowerCase().includes(term)) ||
                (doc.senderUser?.email?.toLowerCase().includes(term))
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (sortOrder === 'desc') {
                    return titleB.localeCompare(titleA);
                }
                return titleA.localeCompare(titleB);
            }
        });

        return filtered;
    }, [documents, searchTerm, statusFilter, sortBy, sortOrder]);

    const stats = {
        total: documents.length,
        unread: documents.filter(d => d.status !== 'viewed').length,
        read: documents.filter(d => d.status === 'viewed').length
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <Toaster position="top-right" />
                <div className="min-h-screen bg-gray-50 pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-center items-center h-96">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-500">Chargement...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Mes documents</h1>
                        <p className="text-gray-500 text-sm mt-1">Documents reçus des experts</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Non lus</p>
                            <p className="text-2xl font-semibold text-blue-600">{stats.unread}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Lus</p>
                            <p className="text-2xl font-semibold text-gray-600">{stats.read}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un document..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 text-sm"
                                    />
                                </div>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 text-sm bg-white"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="sent">Envoyé</option>
                                <option value="received">Reçu</option>
                                <option value="viewed">Vu</option>
                            </select>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy as 'date' | 'title');
                                    setSortOrder(newSortOrder as 'asc' | 'desc');
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 text-sm bg-white"
                            >
                                <option value="date-desc">Plus récent d'abord</option>
                                <option value="date-asc">Plus ancien d'abord</option>
                                <option value="title-asc">Titre A → Z</option>
                                <option value="title-desc">Titre Z → A</option>
                            </select>

                            {(searchTerm || statusFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setSortBy('date');
                                        setSortOrder('desc');
                                    }}
                                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            {filteredAndSortedDocuments.length} document(s)
                            {searchTerm && ` · Recherche: "${searchTerm}"`}
                            {statusFilter !== 'all' && ` · Statut: ${statusFilter}`}
                        </p>
                    </div>

                    {filteredAndSortedDocuments.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                            <div className="text-5xl mb-3">📭</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document</h3>
                            <p className="text-gray-500 text-sm">
                                {searchTerm || statusFilter !== 'all'
                                    ? "Aucun document ne correspond à vos filtres."
                                    : "Vous n'avez encore reçu aucun document."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredAndSortedDocuments.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    document={doc}
                                    onView={handleViewDocument}
                                    onDelete={handleDeleteDocument}
                                    isDeleting={deletingId === doc.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Document Detail Modal */}
                    {selectedDocument && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedDocument(null)}
                        >
                            <div
                                className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">{selectedDocument.title}</h2>
                                    <button
                                        onClick={() => setSelectedDocument(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {selectedDocument.senderUser && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                👤
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {selectedDocument.senderUser.firstname} {selectedDocument.senderUser.lastname}
                                                </p>
                                                <p className="text-blue-600 text-sm">{selectedDocument.senderUser.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedDocument.description && (
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</h3>
                                            <p className="text-sm text-gray-700">{selectedDocument.description}</p>
                                        </div>
                                    )}

                                    {selectedDocument.summary && (
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Résumé</h3>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedDocument.summary}</p>
                                        </div>
                                    )}

                                    {selectedDocument.files && selectedDocument.files.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Fichiers joints</h3>
                                            <div className="space-y-2">
                                                {selectedDocument.files.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">
                                                                {file.fileType === 'image' && '🖼️'}
                                                                {file.fileType === 'application' && '📄'}
                                                                {file.fileType === 'video' && '🎬'}
                                                                {file.fileType === 'audio' && '🎵'}
                                                                {!['image', 'application', 'video', 'audio'].includes(file.fileType) && '📎'}
                                                            </span>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{file.fileName}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-blue-500 text-sm font-medium">Télécharger ↓</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                                        <span>Reçu le {formatDate(selectedDocument.createdAt)}</span>
                                        <span className="capitalize">{getStatusText(selectedDocument.status)}</span>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => setSelectedDocument(null)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'pending': return 'En attente';
        case 'sent': return 'Envoyé';
        case 'received': return 'Reçu';
        case 'viewed': return 'Vu';
        default: return status;
    }
};

export default ReceivedDocuments;