// components/FileViewer.tsx
import React, { useState } from 'react';

interface FileViewerProps {
    pictures: string[];
    files: string[];
    loading?: boolean;
    onClose: () => void;
}

interface FileTypeInfo {
    icon: JSX.Element;
    label: string;
    bgColor: string;
    iconBg: string;
    textColor: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ pictures, files, loading = false, onClose }) => {
    const [activeTab, setActiveTab] = useState<'pictures' | 'files'>('pictures');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

    const getFileTypeInfo = (fileName: string): FileTypeInfo => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        const types: Record<string, FileTypeInfo> = {
            pdf: {
                label: 'PDF',
                bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
                iconBg: 'bg-red-100',
                textColor: 'text-red-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6" y="18" fontSize="5" fill="#ef4444" fontWeight="bold">PDF</text>
                    </svg>
                ),
            },
            doc: {
                label: 'Word',
                bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                iconBg: 'bg-blue-100',
                textColor: 'text-blue-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="5" y="18" fontSize="4.5" fill="#3b82f6" fontWeight="bold">DOC</text>
                    </svg>
                ),
            },
            docx: {
                label: 'Word',
                bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                iconBg: 'bg-blue-100',
                textColor: 'text-blue-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="5" y="18" fontSize="4.5" fill="#3b82f6" fontWeight="bold">DOC</text>
                    </svg>
                ),
            },
            xls: {
                label: 'Excel',
                bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
                iconBg: 'bg-green-100',
                textColor: 'text-green-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6" y="18" fontSize="4.5" fill="#22c55e" fontWeight="bold">XLS</text>
                    </svg>
                ),
            },
            xlsx: {
                label: 'Excel',
                bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
                iconBg: 'bg-green-100',
                textColor: 'text-green-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6" y="18" fontSize="4.5" fill="#22c55e" fontWeight="bold">XLS</text>
                    </svg>
                ),
            },
            txt: {
                label: 'Text',
                bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
                iconBg: 'bg-gray-100',
                textColor: 'text-gray-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#6b7280" opacity="0.2" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6.5" y="18" fontSize="4.5" fill="#6b7280" fontWeight="bold">TXT</text>
                    </svg>
                ),
            },
            csv: {
                label: 'CSV',
                bgColor: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
                iconBg: 'bg-teal-100',
                textColor: 'text-teal-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#14b8a6" opacity="0.2" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6.5" y="18" fontSize="4.5" fill="#14b8a6" fontWeight="bold">CSV</text>
                    </svg>
                ),
            },
            ppt: {
                label: 'PowerPoint',
                bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
                iconBg: 'bg-orange-100',
                textColor: 'text-orange-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#f97316" opacity="0.2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6" y="18" fontSize="4.5" fill="#f97316" fontWeight="bold">PPT</text>
                    </svg>
                ),
            },
            zip: {
                label: 'Archive',
                bgColor: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
                iconBg: 'bg-yellow-100',
                textColor: 'text-yellow-700',
                icon: (
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#eab308" opacity="0.2" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="6" y="18" fontSize="4.5" fill="#eab308" fontWeight="bold">ZIP</text>
                    </svg>
                ),
            },
        };

        // Map pptx -> ppt, rar/7z -> zip
        const normalized: Record<string, string> = { pptx: 'ppt', rar: 'zip', '7z': 'zip' };
        const lookup = normalized[ext] || ext;

        return types[lookup] || {
            label: ext.toUpperCase() || 'FILE',
            bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
            iconBg: 'bg-gray-100',
            textColor: 'text-gray-700',
            icon: (
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#9ca3af" opacity="0.2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
        };
    };

    const formatFileName = (url: string) => url.split('/').pop() || 'fichier';

    // ✅ Force download via blob — bypasses Cloudinary's content-disposition header
    const handleDownload = async (url: string, idx: number) => {
        const fileName = formatFileName(url);
        setDownloadingIndex(idx);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download error:', err);
            window.open(url, '_blank');
        } finally {
            setDownloadingIndex(null);
        }
    };

    const formatFileSize = (url: string) => {
        // Can't get size from URL alone, but show ext clearly
        return formatFileName(url).split('.').pop()?.toUpperCase() || '';
    };

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-gray-900 opacity-60" onClick={onClose}></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Fichiers partagés</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {pictures.length} image{pictures.length !== 1 ? 's' : ''} · {files.length} fichier{files.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 px-6">
                            <button
                                onClick={() => setActiveTab('pictures')}
                                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                    activeTab === 'pictures'
                                        ? 'text-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                🖼️ Images
                                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{pictures.length}</span>
                                {activeTab === 'pictures' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                    activeTab === 'files'
                                        ? 'text-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                📎 Fichiers
                                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{files.length}</span>
                                {activeTab === 'files' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Loading state */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm text-gray-500">Chargement des fichiers...</p>
                                </div>
                            ) : activeTab === 'pictures' ? (
                                pictures.length === 0 ? (
                                    <div className="text-center text-gray-400 py-16">
                                        <svg className="mx-auto h-14 w-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="font-medium">Aucune image partagée</p>
                                        <p className="text-xs mt-1">Les images envoyées dans la conversation apparaîtront ici</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {pictures.map((pic, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
                                                onClick={() => setSelectedImage(pic)}
                                            >
                                                <img
                                                    src={pic}
                                                    alt={`Image ${idx + 1}`}
                                                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-25 transition-all duration-200 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                files.length === 0 ? (
                                    <div className="text-center text-gray-400 py-16">
                                        <svg className="mx-auto h-14 w-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <p className="font-medium">Aucun fichier partagé</p>
                                        <p className="text-xs mt-1">Les fichiers envoyés dans la conversation apparaîtront ici</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {files.map((file, idx) => {
                                            const fileName = formatFileName(file);
                                            const { icon, label, bgColor, textColor } = getFileTypeInfo(fileName);
                                            const isDownloading = downloadingIndex === idx;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleDownload(file, idx)}
                                                    disabled={isDownloading}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group ${bgColor} disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]`}
                                                >
                                                    {/* File icon */}
                                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm">
                                                        {icon}
                                                    </div>

                                                    {/* File info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-semibold text-sm truncate ${textColor}`}>{fileName}</p>
                                                        <span className={`inline-block text-xs font-bold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded-md bg-white bg-opacity-60 ${textColor}`}>
                                                            {label}
                                                        </span>
                                                    </div>

                                                    {/* Download icon / spinner */}
                                                    <div className="flex-shrink-0">
                                                        {isDownloading ? (
                                                            <svg className={`animate-spin h-5 w-5 ${textColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className={`w-5 h-5 ${textColor} opacity-50 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-2xl border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[60]">
                    <div className="fixed inset-0 bg-black opacity-90" onClick={() => setSelectedImage(null)}></div>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="relative max-w-5xl max-h-[90vh]">
                            <img
                                src={selectedImage}
                                alt="Plein écran"
                                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-3 right-3 text-white bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {/* Download button in lightbox */}
                            <button
                                onClick={() => handleDownload(selectedImage, -1)}
                                className="absolute top-3 left-3 text-white bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 transition-colors"
                                title="Télécharger"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FileViewer;