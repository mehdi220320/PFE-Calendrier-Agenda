// components/Discussion.tsx
import React, { useEffect, useRef, useState } from 'react';
import messengerService, { type Conversation, type Message } from '../../services/messengerService.tsx';
import type { User } from '../../models/User';
import MessageInput from './MessageInput';
import FileViewer from './FileViewer';

interface DiscussionProps {
    conversation: Conversation | null;
    client: User | null;
}

const Discussion: React.FC<DiscussionProps> = ({ conversation, client }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [sharedFiles, setSharedFiles] = useState<{ pictures: string[], files: string[] }>({ pictures: [], files: [] });
    const [filesLoading, setFilesLoading] = useState(false);
    const [filesLoaded, setFilesLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageIdsRef = useRef<Set<string>>(new Set());

    const getUserInitials = (firstname?: string, lastname?: string) => {
        if (!firstname && !lastname) return "CL";
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                setCurrentUserId(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Reset files state when conversation changes
    useEffect(() => {
        setSharedFiles({ pictures: [], files: [] });
        setFilesLoaded(false);
        setShowFileViewer(false);

        if (conversation) {
            fetchMessages();
        }

        const unsubscribe = messengerService.onNewMessage((newMessage) => {
            if (conversation && newMessage.conversation === conversation.id) {
                if (!messageIdsRef.current.has(newMessage.id)) {
                    messageIdsRef.current.add(newMessage.id);
                    setMessages(prev => [...prev, newMessage]);
                    // Invalidate files cache so next open re-fetches
                    if (newMessage.pictures?.length > 0 || newMessage.files?.length > 0) {
                        setFilesLoaded(false);
                    }
                }
            }
        });

        return () => {
            unsubscribe();
            messageIdsRef.current.clear();
        };
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!conversation) return;
        try {
            setLoading(true);
            const data = await messengerService.getMessages(conversation.id);
            messageIdsRef.current.clear();
            data.forEach(msg => messageIdsRef.current.add(msg.id));
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Only fetches files when the button is clicked, not on mount
    const handleOpenFileViewer = async () => {
        setShowFileViewer(true);

        if (!filesLoaded && conversation) {
            try {
                setFilesLoading(true);
                const files = await messengerService.getFiles(conversation.id);
                setSharedFiles(files);
                setFilesLoaded(true);
            } catch (err) {
                console.error('Error fetching shared files:', err);
            } finally {
                setFilesLoading(false);
            }
        }
    };

    const handleSendMessage = async (messageText: string, files?: File[]) => {
        if (!conversation) return;
        try {
            setSending(true);
            const newMessage = await messengerService.sendMessage(conversation.id, messageText, files);
            if (!messageIdsRef.current.has(newMessage.id)) {
                messageIdsRef.current.add(newMessage.id);
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Échec de l\'envoi du message. Veuillez réessayer.');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Force download using fetch + blob to bypass Cloudinary's content-disposition
    const handleDownload = async (url: string, fileName: string) => {
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
            console.error('Download failed:', err);
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    const getFileIcon = (fileName: string): { icon: string; label: string; color: string } => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (ext === 'pdf') return { icon: '📄', label: 'PDF', color: 'bg-red-100 text-red-700 border-red-200' };
        if (['doc', 'docx'].includes(ext)) return { icon: '📝', label: 'Word', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (['xls', 'xlsx'].includes(ext)) return { icon: '📊', label: 'Excel', color: 'bg-green-100 text-green-700 border-green-200' };
        if (['txt', 'md'].includes(ext)) return { icon: '📃', label: 'Text', color: 'bg-gray-100 text-gray-700 border-gray-200' };
        if (['zip', 'rar', '7z'].includes(ext)) return { icon: '🗜️', label: 'Archive', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        if (['ppt', 'pptx'].includes(ext)) return { icon: '📊', label: 'PPT', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        if (['csv'].includes(ext)) return { icon: '📋', label: 'CSV', color: 'bg-teal-100 text-teal-700 border-teal-200' };
        return { icon: '📎', label: ext.toUpperCase() || 'FILE', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    };

    const renderAttachments = (message: Message) => {
        const hasPictures = message.pictures && message.pictures.length > 0;
        const hasFiles = message.files && message.files.length > 0;

        if (!hasPictures && !hasFiles) return null;

        return (
            <div className="mt-2 space-y-2">
                {hasPictures && (
                    <div className="flex flex-wrap gap-2">
                        {message.pictures.map((pic, idx) => (
                            <a
                                key={idx}
                                href={pic}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                            >
                                <img
                                    src={pic}
                                    alt={`Pièce jointe ${idx + 1}`}
                                    className="max-w-[200px] max-h-[150px] rounded-lg object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                />
                            </a>
                        ))}
                    </div>
                )}
                {hasFiles && (
                    <div className="flex flex-wrap gap-2">
                        {message.files.map((file, idx) => {
                            const fileName = file.split('/').pop() || 'file';
                            const { icon, label, color } = getFileIcon(fileName);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDownload(file, fileName)}
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${color}`}
                                    title={`Télécharger ${fileName}`}
                                >
                                    <span className="text-xl">{icon}</span>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                                        <p className="text-xs truncate max-w-[120px] leading-none opacity-75">{fileName}</p>
                                    </div>
                                    {/* Download arrow */}
                                    <svg className="w-3.5 h-3.5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (!conversation || !client) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune conversation sélectionnée</h3>
                    <p className="mt-1 text-sm text-gray-500">Sélectionnez une conversation dans la liste pour commencer à discuter</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex flex-col bg-gray-50">
                {/* Conversation Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {client.picture ? (
                                <img
                                    src={client.picture}
                                    alt={`${client.firstname} ${client.lastname}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-lg">
                                    {getUserInitials(client.firstname, client.lastname)}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {client.firstname} {client.lastname}
                                </h3>
                                <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                        </div>

                        {/* ✅ Files button - always visible, loads on click */}
                        <button
                            onClick={handleOpenFileViewer}
                            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors px-3 py-2 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200"
                            title="Fichiers partagés"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm font-medium">Fichiers</span>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="text-gray-500">Chargement des messages...</div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-center text-gray-500">
                                <p>Aucun message pour le moment</p>
                                <p className="text-sm">Envoyez un message pour commencer la conversation</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => {
                                const isOwnMessage = currentUserId === message.sender;
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                            <div
                                                className={`rounded-2xl px-4 py-2 shadow-sm ${
                                                    isOwnMessage
                                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                                                }`}
                                            >
                                                {message.message && (
                                                    <p className="text-sm break-words leading-relaxed">{message.message}</p>
                                                )}
                                                {renderAttachments(message)}
                                            </div>
                                            <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                                {formatTime(message.createdAt)}
                                                {isOwnMessage && ' ✓✓'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
            </div>

            {/* File Viewer Modal */}
            {showFileViewer && (
                <FileViewer
                    pictures={sharedFiles.pictures}
                    files={sharedFiles.files}
                    loading={filesLoading}
                    onClose={() => setShowFileViewer(false)}
                />
            )}
        </>
    );
};

export default Discussion;