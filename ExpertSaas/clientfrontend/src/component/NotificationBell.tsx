// components/NotificationBell.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { type Notification } from '../models/Notification';
import { Bell, ChevronDown, X, User, Calendar, Video, Clock, FileText } from 'lucide-react';
import { type Meeting } from '../models/Meeting';
import { meetingService } from '../services/meetingService';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
    userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [isMeetingLoading, setIsMeetingLoading] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const notificationsContainerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await notificationService.getNotifications();
            console.log('Setting notifications:', data);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleNewNotification = useCallback((newNotification: Notification) => {
        console.log('🎯 HANDLING NEW NOTIFICATION IN COMPONENT:', newNotification);

        setNotifications(prev => {
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) {
                console.log('Notification already exists, skipping');
                return prev;
            }
            console.log('Adding new notification to state');
            return [newNotification, ...prev];
        });

        if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
                body: newNotification.description,
                icon: '/notification-icon.png'
            });
        }
    }, []);

    const getMeeting = useCallback(async (meetingId: string) => {
        if (!meetingId) return null;

        try {
            setIsMeetingLoading(true);
            const meeting = await meetingService.getMeetingById(meetingId);
            console.log("meeting : " + meeting.id);
            return meeting;
        } catch (error) {
            console.error('Error fetching meeting:', error);
            return null;
        } finally {
            setIsMeetingLoading(false);
        }
    }, []);

    const handleDocumentNotification = (documentId: string) => {
        setShowDropdown(false);
        navigate(`/documents/${documentId}`);
    };

    useEffect(() => {
        const getUserId = () => {
            if (userId) return userId;

            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const parsedUser = JSON.parse(user);
                    return parsedUser.id || parsedUser;
                }
            } catch (error) {
                console.error('Error getting userId:', error);
            }
            return null;
        };

        const currentUserId = getUserId();

        if (currentUserId) {
            console.log('🚀 Initializing notification service with userId:', currentUserId);

            notificationService.initialize(currentUserId);

            fetchNotifications();

            const unsubscribe = notificationService.onNotification(handleNewNotification);

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }

            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setShowDropdown(false);
                    setShowAllNotifications(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                unsubscribe();
            };
        } else {
            console.warn('No userId available for notifications');
            setIsLoading(false);
        }
    }, [userId, fetchNotifications, handleNewNotification]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
        console.log('Unread count updated:', notifications.filter(n => !n.read).length);
    }, [notifications]);

    const markAsRead = async (notification: Notification) => {
        try {
            await notificationService.readNotification(notification.id);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );

            // Handle different notification types
            if (notification.document) {
                // Document notification - navigate to document page
                handleDocumentNotification(notification.document);
            } else if (notification.meeting) {
                // Meeting notification - show meeting details
                const meetingData = await getMeeting(notification.meeting);
                if (meetingData) {
                    setSelectedMeeting(meetingData);
                    setShowDialog(true);
                    setShowDropdown(false);
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (isMarkingAll) return;

        setIsMarkingAll(true);

        try {
            const unreadNotifications = notifications.filter(n => !n.read);

            for (const notification of unreadNotifications) {
                try {
                    await notificationService.readNotification(notification.id);
                    console.log(`Marked notification ${notification.id} as read`);
                } catch (error) {
                    console.error(`Error marking notification ${notification.id} as read:`, error);
                }
            }

            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );

            console.log(`Marked ${unreadNotifications.length} notifications as read`);
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
        } finally {
            setIsMarkingAll(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString();
    };

    const formatMeetingDate = (date: string | Date) => {
        const meetingDate = new Date(date);
        return meetingDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMeetingLinkMessage = (date: string | Date) => {
        const meetingDate = new Date(date);
        const day = meetingDate.getDate();
        const month = meetingDate.getMonth() + 1;
        const year = meetingDate.getFullYear();
        return `serait disponible le jour de la réunion le ${day}/${month}/${year}`;
    };

    const getNotificationIcon = (type: string, hasDocument?: boolean, hasMeeting?: boolean) => {
        if (hasDocument) {
            return {
                icon: FileText,
                bgColor: 'bg-blue-100',
                iconColor: 'text-blue-600'
            };
        }
        if (hasMeeting) {
            return {
                icon: Calendar,
                bgColor: 'bg-purple-100',
                iconColor: 'text-purple-600'
            };
        }
        return {
            icon: Bell,
            bgColor: 'bg-gray-100',
            iconColor: 'text-gray-600'
        };
    };

    const toggleShowAllNotifications = () => {
        setShowAllNotifications(!showAllNotifications);

        setTimeout(() => {
            if (notificationsContainerRef.current && showAllNotifications) {
                notificationsContainerRef.current.scrollTop = 0;
            }
        }, 100);
    };

    const displayedNotifications = showAllNotifications
        ? notifications
        : notifications.slice(0, 3);

    const hasMoreNotifications = notifications.length > 3;

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-200"
                    disabled={isLoading}
                >
                    <Bell className="h-4 w-4" />
                    <ChevronDown className={`h-3 w-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={isMarkingAll}
                                    className={`text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors ${
                                        isMarkingAll ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isMarkingAll ? 'Marquage...' : 'Marquer tout comme lu'}
                                </button>
                            )}
                        </div>

                        <div
                            ref={notificationsContainerRef}
                            className="overflow-y-auto transition-all duration-300 ease-in-out"
                            style={{
                                maxHeight: showAllNotifications ? '480px' : '360px',
                                transition: 'max-height 0.3s ease-in-out'
                            }}
                        >
                            {isLoading ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    Chargement...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    Aucune notification
                                </div>
                            ) : (
                                <>
                                    {displayedNotifications.map((notification) => {
                                        const { icon: IconComponent, bgColor, iconColor } = getNotificationIcon(
                                            notification.type || 'default',
                                            !!notification.document,
                                            !!notification.meeting
                                        );
                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => markAsRead(notification)}
                                                className={`flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${
                                                    !notification.read ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className={`flex-shrink-0 w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                                                    <IconComponent className={`h-4 w-4 ${iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {notification.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDate(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {!showAllNotifications && hasMoreNotifications && (
                                        <div className="px-4 py-2 text-center text-xs text-gray-400 border-t border-gray-100">
                                            + {notifications.length - 3} notification{notifications.length - 3 > 1 ? 's' : ''} non affichée{notifications.length - 3 > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={toggleShowAllNotifications}
                                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium w-full transition-colors"
                                >
                                    {showAllNotifications ? 'Voir moins' : 'Voir toutes les notifications'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Meeting Details Dialog */}
            {showDialog && selectedMeeting && (
                <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        ref={dialogRef}
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Détails de la réunion
                            </h2>
                            <button
                                onClick={() => {
                                    setShowDialog(false);
                                    setSelectedMeeting(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {isMeetingLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-gray-500">Chargement des détails...</div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {selectedMeeting.summary && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {selectedMeeting.summary}
                                        </h3>
                                    </div>
                                )}

                                {selectedMeeting.description && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {selectedMeeting.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-3">
                                        <User className="h-5 w-5 text-green-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Expert</p>
                                            <p className="text-gray-900">{selectedMeeting.expert}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Date et heure</p>
                                            <p className="text-gray-900">{formatMeetingDate(selectedMeeting.date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Durée</p>
                                            <p className="text-gray-900">{selectedMeeting.slotDuration} minutes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-3">Liens de la réunion</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-2">
                                            <Video className="h-4 w-4 text-red-500 mt-0.5" />
                                            <div className="flex-1">
                                                {selectedMeeting.meetUrl ? (
                                                    <a
                                                        href={selectedMeeting.meetUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                                                    >
                                                        {selectedMeeting.meetUrl}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-600">
                                                        Google Meet: {getMeetingLinkMessage(selectedMeeting.date)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2">
                                            <Video className="h-4 w-4 text-green-500 mt-0.5" />
                                            <div className="flex-1">
                                                {selectedMeeting.jitsiRoom ? (
                                                    <a
                                                        href={`/meetings/${selectedMeeting.jitsiRoom}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                    >
                                                        Rejoindre la salle Jitsi
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-600">
                                                        Jitsi: {getMeetingLinkMessage(selectedMeeting.date)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                                    <button
                                        onClick={() => {
                                            setShowDialog(false);
                                            setSelectedMeeting(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Fermer
                                    </button>
                                    <a
                                        href="/meetings"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Consulter la liste des réunions
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;