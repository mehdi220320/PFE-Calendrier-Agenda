// Messenger.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserServices } from '../../services/UserServices.tsx';
import expertProfilService from '../../services/expertProfileService.tsx';
import Header from '../../component/Header';
import ConversationsList from './ConversationsList';
import Discussion from './Discussion';
import messengerService, { type Conversation } from '../../services/messengerService.tsx';
import type { User } from '../../models/User';

const Messenger: React.FC = () => {
    const [searchParams] = useSearchParams();
    const expertIdFromUrl = searchParams.get('expertId');

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'conversations' | 'experts'>('conversations');
    const [user, setUser] = useState<string | null>(null);
    const [autoStartingChat, setAutoStartingChat] = useState(false);

    const [experts, setExperts] = useState<User[]>([]);
    const [loadingExperts, setLoadingExperts] = useState(false);
    const [startingChat, setStartingChat] = useState<string | null>(null);

    const getUserInitials = (firstname?: string, lastname?: string) => {
        if (!firstname && !lastname) return "EX";
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                setUser(user);
                messengerService.initialize(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        return () => {
            messengerService.cleanup();
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'experts') {
            fetchAllExperts();
        }
    }, [activeTab]);

    useEffect(() => {
        if (expertIdFromUrl && user && !autoStartingChat) {
            startChatWithExpert(expertIdFromUrl);
        }
    }, [expertIdFromUrl, user]);

    const fetchAllExperts = async () => {
        try {
            setLoadingExperts(true);
            const response = await expertProfilService.getAllExperts();
            const expertsList = response.map(item => item.expertUser);
            setExperts(expertsList);
        } catch (err) {
            console.error('Error fetching experts:', err);
        } finally {
            setLoadingExperts(false);
        }
    };

    const startChatWithExpert = async (expertId: string) => {
        try {
            setAutoStartingChat(true);
            const expert = await UserServices.getExpertById(expertId);
            const result = await messengerService.createConversationWithExpert(expertId);

            setSelectedConversation(result.conversation);
            setSelectedExpert(expert);
            setActiveTab('conversations');
        } catch (err) {
            console.error('Error starting chat:', err);
        } finally {
            setAutoStartingChat(false);
        }
    };

    const handleStartChat = async (expert: User) => {
        try {
            setStartingChat(expert.id);
            const result = await messengerService.createConversationWithExpert(expert.id);
            setSelectedConversation(result.conversation);
            setSelectedExpert(expert);
            setActiveTab('conversations');
        } catch (err) {
            console.error('Error starting chat:', err);
            alert('Échec du démarrage de la conversation. Veuillez réessayer.');
        } finally {
            setStartingChat(null);
        }
    };

    const handleSelectConversation = (conversation: Conversation, expert: User) => {
        setSelectedConversation(conversation);
        setSelectedExpert(expert);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-19">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                    <div className="flex h-full">
                        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('conversations')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                                        activeTab === 'conversations'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Conversations</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('experts')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                                        activeTab === 'experts'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Experts</span>
                                    </div>
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {activeTab === 'conversations' ? (
                                    <ConversationsList
                                        onSelectConversation={handleSelectConversation}
                                        selectedConversationId={selectedConversation?.id}
                                    />
                                ) : (
                                    <div className="h-full overflow-y-auto">
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experts disponibles</h2>
                                            {loadingExperts ? (
                                                <div className="text-gray-500 text-center py-8">Chargement des experts...</div>
                                            ) : experts.length === 0 ? (
                                                <div className="text-center text-gray-500 py-8">
                                                    <p>Aucun expert disponible</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {experts.map((expert) => (
                                                        <div
                                                            key={expert.id}
                                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3 flex-1">
                                                                    {expert.picture ? (
                                                                        <img
                                                                            src={expert.picture}
                                                                            alt={`${expert.firstname} ${expert.lastname}`}
                                                                            className="w-12 h-12 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                                                            {getUserInitials(expert.firstname, expert.lastname)}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <h3 className="font-semibold text-gray-900">
                                                                            {expert.firstname} {expert.lastname}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-500">{expert.email}</p>
                                                                        {expert.phone && (
                                                                            <p className="text-xs text-gray-400">{expert.phone}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleStartChat(expert)}
                                                                    disabled={startingChat === expert.id}
                                                                    className="ml-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                                    title="Commencer la discussion"
                                                                >
                                                                    {startingChat === expert.id ? (
                                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <Discussion
                                conversation={selectedConversation}
                                expert={selectedExpert}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messenger;