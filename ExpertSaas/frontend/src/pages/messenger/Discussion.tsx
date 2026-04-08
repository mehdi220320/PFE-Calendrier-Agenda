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

    useEffect(() => {
        if (conversation) {
            fetchMessages();
            fetchSharedFiles();
        }

        const unsubscribe = messengerService.onNewMessage((newMessage) => {
            if (conversation && newMessage.conversation === conversation.id) {
                if (!messageIdsRef.current.has(newMessage.id)) {
                    messageIdsRef.current.add(newMessage.id);
                    setMessages(prev => [...prev, newMessage]);
                    // Refresh files if new message has attachments
                    if (newMessage.pictures?.length > 0 || newMessage.files?.length > 0) {
                        fetchSharedFiles();
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

    const fetchSharedFiles = async () => {
        if (!conversation) return;

        try {
            const files = await messengerService.getFiles(conversation.id);
            setSharedFiles(files);
        } catch (err) {
            console.error('Error fetching shared files:', err);
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
                            const fileExtension = fileName.split('.').pop()?.toLowerCase();
                            const isPDF = fileExtension === 'pdf';
                            const isWord = ['doc', 'docx'].includes(fileExtension || '');
                            const isExcel = ['xls', 'xlsx'].includes(fileExtension || '');

                            let icon = '📎';
                            if (isPDF) icon = '📄';
                            if (isWord) icon = '📝';
                            if (isExcel) icon = '📊';

                            return (
                                <a
                                    key={idx}
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <span className="text-xl">{icon}</span>
                                    <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                        {fileName}
                                    </span>
                                </a>
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

    const hasAnyFiles = sharedFiles.pictures.length > 0 || sharedFiles.files.length > 0;

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

                        {/* Simple Files Button */}
                        {hasAnyFiles && (
                            <button
                                onClick={() => setShowFileViewer(true)}
                                className="text-gray-500 hover:text-indigo-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                title="Fichiers partagés"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                        )}
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
                    onClose={() => setShowFileViewer(false)}
                />
            )}
        </>
    );
};

export default Discussion;