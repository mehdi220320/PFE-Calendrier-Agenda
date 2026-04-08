// components/FileViewer.tsx
import React, { useState } from 'react';

interface FileViewerProps {
    pictures: string[];
    files: string[];
    onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ pictures, files, onClose }) => {
    const [activeTab, setActiveTab] = useState<'pictures' | 'files'>('pictures');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return '📄';
        if (['doc', 'docx'].includes(extension || '')) return '📝';
        if (['xls', 'xlsx'].includes(extension || '')) return '📊';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return '🖼️';
        return '📎';
    };

    const formatFileName = (url: string) => {
        return url.split('/').pop() || 'fichier';
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Fichiers partagés
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-200 px-6">
                            <button
                                onClick={() => setActiveTab('pictures')}
                                className={`px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'pictures'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Images ({pictures.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'files'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Fichiers ({files.length})
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'pictures' ? (
                                pictures.length === 0 ? (
                                    <div className="text-center text-gray-500 py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2">Aucune image partagée</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {pictures.map((pic, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group cursor-pointer"
                                                onClick={() => setSelectedImage(pic)}
                                            >
                                                <img
                                                    src={pic}
                                                    alt={`Image ${idx + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                                                />
                                                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                files.length === 0 ? (
                                    <div className="text-center text-gray-500 py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <p className="mt-2">Aucun fichier partagé</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {files.map((file, idx) => {
                                            const fileName = formatFileName(file);
                                            return (
                                                <a
                                                    key={idx}
                                                    href={file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{getFileIcon(fileName)}</span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{fileName}</p>
                                                            <p className="text-xs text-gray-500">Cliquez pour télécharger</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-500 opacity-80"></div>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="relative max-w-7xl max-h-[90vh]">
                            <img
                                src={selectedImage}
                                alt="Plein écran"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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