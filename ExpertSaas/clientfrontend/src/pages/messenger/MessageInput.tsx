// components/MessageInput.tsx
import React, { useState, useRef } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string, files?: File[]) => void;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
        const files = Array.from(e.target.files || []);

        let validFiles = files;
        if (type === 'image') {
            validFiles = files.filter(file => file.type.startsWith('image/'));
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);

            validFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreviewUrls(prev => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((message.trim() || selectedFiles.length > 0) && !disabled && !uploading) {
            setUploading(true);
            try {
                await onSendMessage(message, selectedFiles);
                setMessage('');
                setSelectedFiles([]);
                setPreviewUrls([]);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !uploading) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('word')) return '📝';
        if (file.type.includes('excel')) return '📊';
        return '📎';
    };

    return (
        <div className="border-t border-gray-200 bg-white">
            {selectedFiles.length > 0 && (
                <div className="p-3 border-b border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.type.startsWith('image/') && previewUrls[index] ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrls[index]}
                                            alt={`Aperçu ${index}`}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={uploading}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                                            <span className="text-2xl">{getFileIcon(file)}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-full px-1">
                                                {file.name.substring(0, 10)}...
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={uploading}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex space-x-3">
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={disabled || uploading}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Ajouter des images"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || uploading}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Ajouter des fichiers"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                    </div>

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e, 'image')}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e, 'file')}
                        className="hidden"
                    />

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={disabled ? "Démarrage de la conversation..." : (uploading ? "Envoi en cours..." : "Tapez votre message...")}
                        disabled={disabled || uploading}
                        rows={1}
                        className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={(!message.trim() && selectedFiles.length === 0) || disabled || uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Envoi...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>Envoyer</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageInput;