import React, { useEffect, useRef, useState } from 'react';
import messengerService, { type Conversation, type Message } from '../../services/messengerService.tsx';
import type { User } from '../../models/User';
import MessageInput from './MessageInput';

interface DiscussionProps {
    conversation: Conversation | null;
    client: User | null;
}

const Discussion: React.FC<DiscussionProps> = ({ conversation, client }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageIdsRef = useRef<Set<string>>(new Set());

    // Helper function to get user initials
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
        }

        const unsubscribe = messengerService.onNewMessage((newMessage) => {
            if (conversation && newMessage.conversation === conversation.id) {
                // Prevent duplicate messages using Set
                if (!messageIdsRef.current.has(newMessage.id)) {
                    messageIdsRef.current.add(newMessage.id);
                    setMessages(prev => [...prev, newMessage]);
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
            // Clear existing message IDs and add new ones
            messageIdsRef.current.clear();
            data.forEach(msg => messageIdsRef.current.add(msg.id));
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (messageText: string) => {
        if (!conversation) return;

        try {
            setSending(true);
            const newMessage = await messengerService.sendMessage(conversation.id, messageText);
            // Check if message already exists before adding
            if (!messageIdsRef.current.has(newMessage.id)) {
                messageIdsRef.current.add(newMessage.id);
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message. Please try again.');
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

    if (!conversation || !client) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Select a conversation from the list to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Conversation Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
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
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center">
                        <div className="text-gray-500">Loading messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500">
                            <p>No messages yet</p>
                            <p className="text-sm">Send a message to start the conversation</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => {
                            // Check if the message is from the current user (expert)
                            const isOwnMessage = currentUserId === message.sender;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${
                                                isOwnMessage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 border border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm break-words">{message.message}</p>
                                        </div>
                                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                            {formatTime(message.createdAt)}
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
    );
};

export default Discussion;