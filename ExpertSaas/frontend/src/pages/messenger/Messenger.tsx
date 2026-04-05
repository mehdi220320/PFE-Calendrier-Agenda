import React, { useEffect, useState } from 'react';
import Header from '../../Component/Header';
import ConversationsList from './ConversationsList';
import Discussion from './Discussion';
import messengerService, { type Conversation } from '../../services/messengerService.tsx';
import type { User } from '../../models/User';

const Messenger: React.FC = () => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [user, setUser] = useState<string | null>(null);

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

    const handleSelectConversation = (conversation: Conversation, client: User) => {
        setSelectedConversation(conversation);
        setSelectedClient(client);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
                            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                                <p className="text-sm text-gray-500">Chat with your clients</p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ConversationsList
                                    onSelectConversation={handleSelectConversation}
                                    selectedConversationId={selectedConversation?.id}
                                />
                            </div>
                        </div>

                        {/* Discussion Area */}
                        <div className="flex-1">
                            <Discussion
                                conversation={selectedConversation}
                                client={selectedClient}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messenger;