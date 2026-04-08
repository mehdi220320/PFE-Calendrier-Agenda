// components/ConversationsList.tsx
import React, { useEffect, useState } from 'react';
import messengerService, { type Conversation } from '../../services/messengerService.tsx';
import type { User } from '../../models/User';

interface ConversationsListProps {
    onSelectConversation: (conversation: Conversation, client: User) => void;
    selectedConversationId?: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
                                                                 onSelectConversation,
                                                                 selectedConversationId
                                                             }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getUserInitials = (firstname?: string, lastname?: string) => {
        if (!firstname && !lastname) return "CL";
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    useEffect(() => {
        fetchConversations();

        const unsubscribe = messengerService.onNewConversation((newConversation) => {
            setConversations(prev => {
                if (!prev.some(conv => conv.id === newConversation.id)) {
                    return [newConversation, ...prev];
                }
                return prev;
            });
        });

        return () => unsubscribe();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messengerService.getExpertConversations();
            console.log('API Response:', response);

            let conversationsData: Conversation[] = [];
            if (Array.isArray(response)) {
                conversationsData = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.conversations)) {
                    conversationsData = response.conversations;
                }
                else if (Array.isArray(response.data)) {
                    conversationsData = response.data;
                }
                else if (response.clientData && response.id) {
                    conversationsData = [response as Conversation];
                }
            }

            setConversations(conversationsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Échec du chargement des conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        const client = conversation.clientData as User;
        if (client) {
            onSelectConversation(conversation, client);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Chargement des conversations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="mt-2">Aucune conversation</p>
                    <p className="text-sm">Commencez une discussion avec un client</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="space-y-1 p-3">
                {conversations.map((conversation) => {
                    const client = conversation.clientData as User;
                    return (
                        <button
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                selectedConversationId === conversation.id
                                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                                    : 'hover:bg-gray-50 border-transparent'
                            } border`}
                        >
                            <div className="flex items-center space-x-3">
                                {client?.picture ? (
                                    <img
                                        src={client.picture}
                                        alt={`${client.firstname} ${client.lastname}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                        {client ? getUserInitials(client.firstname, client.lastname) : 'CL'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {client ? `${client.firstname} ${client.lastname}` : 'Client'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        Email: {client ? `${client.email}` : 'Client'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationsList;