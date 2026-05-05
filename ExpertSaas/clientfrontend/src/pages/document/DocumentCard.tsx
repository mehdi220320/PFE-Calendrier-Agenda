// components/documents/DocumentCard.tsx
import React, { useState } from 'react';
import type { Document } from '../../models/Document';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentCardProps {
    document: Document;
    onView?: (document: Document) => void;
    onDelete?: (documentId: string) => void;
    isDeleting?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
                                                       document,
                                                       onView,
                                                       onDelete,
                                                       isDeleting = false
                                                   }) => {
    const [showFiles, setShowFiles] = useState(false);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-600',
            sent: 'bg-blue-50 text-blue-600',
            received: 'bg-purple-50 text-purple-600',
            viewed: 'bg-gray-100 text-gray-500'
        };
        const texts: Record<string, string> = {
            pending: 'En attente',
            sent: 'Envoyé',
            received: 'Reçu',
            viewed: 'Vu'
        };
        return { className: styles[status] || 'bg-gray-50 text-gray-600', text: texts[status] || status };
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 KB';
        const sizes = ['KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const badge = getStatusBadge(document.status);
    const isUnread = document.status !== 'viewed';

    return (
        <div className={`bg-white border rounded-xl transition-all duration-200 hover:shadow-md ${
            isUnread ? 'border-blue-200 shadow-sm' : 'border-gray-100'
        }`}>
            <div className="p-5">
                {/* Header with Title and Status */}
                <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                            <h3 className={`font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'} line-clamp-1`}>
                                {document.title}
                            </h3>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {badge.text}
                    </span>
                </div>

                {/* Description */}
                {document.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {document.description}
                    </p>
                )}

                {/* Expert Info - Full details on card */}
                {document.senderUser && (
                    <div className={`rounded-lg p-3 mb-3 ${isUnread ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className="flex items-start gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                isUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                            }`}>
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {document.senderUser.firstname} {document.senderUser.lastname}
                                </p>
                                <p className={`text-xs truncate ${isUnread ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {document.senderUser.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Date */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>📅 {format(new Date(document.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                </div>

                {/* Files Preview */}
                {document.files && document.files.length > 0 && (
                    <button
                        onClick={() => setShowFiles(!showFiles)}
                        className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-lg mb-3 transition-colors ${
                            isUnread ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <span className="flex items-center gap-1">
                            📎 {document.files.length} fichier(s)
                        </span>
                        <span>{showFiles ? '−' : '+'}</span>
                    </button>
                )}

                {/* Files List */}
                {showFiles && document.files && (
                    <div className="space-y-2 mb-4">
                        {document.files.map((file, idx) => (
                            <a
                                key={idx}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">
                                        {file.fileType === 'image' && '🖼️'}
                                        {file.fileType === 'application' && '📄'}
                                        {['video', 'audio'].includes(file.fileType) && '🎬'}
                                        {!['image', 'application', 'video', 'audio'].includes(file.fileType) && '📎'}
                                    </span>
                                    <span className="text-gray-700 text-xs truncate max-w-[150px]">{file.fileName}</span>
                                </div>
                                <span className="text-gray-400 text-xs">{formatFileSize(file.fileSize)}</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Actions - Colored Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {onView && (
                        <button
                            onClick={() => onView(document)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isUnread
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Voir détails
                        </button>
                    )}
                    {onDelete && document.status !== 'viewed' && (
                        <button
                            onClick={() => onDelete(document.id)}
                            disabled={isDeleting}
                            className="flex-1 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? '...' : 'Supprimer'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;