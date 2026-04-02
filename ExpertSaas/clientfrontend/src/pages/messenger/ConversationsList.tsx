// components/ConversationsList.tsx
import React, { useEffect, useState } from 'react';
import messengerService, { type Conversation } from '../../services/messengerService.tsx';
import { UserServices } from '../../services/UserServices.tsx';
import type { User } from '../../models/User';

interface ConversationsListProps {
    onSelectConversation: (conversation: Conversation, expert: User) => void;
    selectedConversationId?: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
                                                                 onSelectConversation,
                                                                 selectedConversationId
                                                             }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [experts, setExperts] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to get user initials
    const getUserInitials = (firstname?: string, lastname?: string) => {
        if (!firstname && !lastname) return "EX";
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
            // Fetch expert details for the new conversation
            fetchExpertDetails(newConversation.expert);
        });

        return () => unsubscribe();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await messengerService.getClientConversations();
            console.log(data);
            setConversations(data);

            const expertIds = [...new Set(data.map(conv => conv.expert))];
            await Promise.all(expertIds.map(id => fetchExpertDetails(id)));

            setError(null);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchExpertDetails = async (expertId: string) => {
        if (experts.has(expertId)) return;

        try {
            const expert = await UserServices.getExpertById(expertId);
            setExperts(prev => new Map(prev).set(expertId, expert));
        } catch (err) {
            console.error('Error fetching expert details:', err);
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        const expert = experts.get(conversation.expert);
        if (expert) {
            onSelectConversation(conversation, expert);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading conversations...</div>
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
                    <p className="mt-2">No conversations yet</p>
                    <p className="text-sm">Start a chat with an expert from the list</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="space-y-1 p-3">
                {conversations.map((conversation) => {
                    const expert = experts.get(conversation.expert);
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
                                {expert?.picture ? (
                                    <img
                                        src={expert.picture}
                                        alt={`${expert.firstname} ${expert.lastname}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                        {expert ? getUserInitials(expert.firstname, expert.lastname) : 'EX'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {expert ? `${expert.firstname} ${expert.lastname}` : 'Expert'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conversation.id.slice(0, 8)}...
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