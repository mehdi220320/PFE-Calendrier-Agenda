import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import Header from '../../component/Header';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

interface MeetingDetails {
    id: string;
    summary: string;
    creator: string;
    expert: string;
    description: string;
    date: string;
    slotDuration: number;
    meetUrl: string;
    jitsiRoom: string;
    createdAt: string;
    updatedAt: string;
}

const JitsiRoom: React.FC = () => {
    const { jitsiRoom } = useParams<{ jitsiRoom: string }>();
    const navigate = useNavigate();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
    const [api, setApi] = useState<any>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(1);
    const [showChat, setShowChat] = useState(false);
    const [jitsiError, setJitsiError] = useState<string | null>(null);

    useEffect(() => {
        console.log('Component mounted, jitsiRoom:', jitsiRoom);
        setLoading(true);

        if (!jitsiRoom) {
            console.log('No jitsiRoom provided');
            setError('Le nom de la salle est requis');
            setLoading(false);
            return;
        }

        // Verify meeting exists and user has access
        const verifyMeeting = async () => {
            try {
                console.log('Verifying meeting with room:', jitsiRoom);
                const meeting = await meetingService.getMeetingByRoom(jitsiRoom);
                console.log('Meeting details received:', meeting);
                setMeetingDetails(meeting);

                // Load Jitsi API script after meeting is verified
                loadJitsiScript();
            } catch (err: any) {
                console.error('Error verifying meeting:', err);
                setError(err.response?.data?.message || 'Échec du chargement des détails de la réunion');
            }finally {
                setLoading(false);

            }
        };

        verifyMeeting();

        return () => {
            console.log('Component unmounting, cleaning up Jitsi API');
            if (api) {
                try {
                    api.dispose();
                } catch (e) {
                    console.error('Error disposing Jitsi API:', e);
                }
            }
        };
    }, [jitsiRoom]);

    // Use another useEffect to initialize Jitsi when script is loaded AND container is ready
    useEffect(() => {
        if (scriptLoaded && jitsiContainerRef.current && meetingDetails) {
            console.log('Script loaded and container ready, initializing Jitsi...');
            // Small delay to ensure DOM is fully rendered
            setTimeout(() => {
                initializeJitsi();
            }, 100);
        }
    }, [scriptLoaded, meetingDetails]);

    const loadJitsiScript = () => {
        console.log('Loading Jitsi script...');

        // Check if script is already loaded
        if (window.JitsiMeetExternalAPI) {
            console.log('Jitsi script already loaded');
            setScriptLoaded(true);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
        if (existingScript) {
            console.log('Jitsi script already being loaded, waiting...');
            // Wait for it to load
            const checkInterval = setInterval(() => {
                if (window.JitsiMeetExternalAPI) {
                    console.log('Jitsi script loaded via existing script');
                    clearInterval(checkInterval);
                    setScriptLoaded(true);
                }
            }, 100);
            return;
        }

        // Create and load the script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;

        script.onload = () => {
            console.log('Jitsi script loaded successfully');
            setScriptLoaded(true);
        };

        script.onerror = (error) => {
            console.error('Failed to load Jitsi script:', error);
            setJitsiError('Impossible de charger Jitsi Meet. Utilisez le lien Google Meet ci-dessous.');
            setLoading(false);
        };

        document.body.appendChild(script);
        console.log('Jitsi script appended to document');
    };

    const initializeJitsi = () => {
        console.log('Initializing Jitsi with room:', jitsiRoom);
        console.log('Container ref:', jitsiContainerRef.current);

        if (!jitsiContainerRef.current) {
            console.error('Jitsi container ref is null');
            setJitsiError('Erreur d\'initialisation. Utilisez le lien Google Meet ci-dessous.');
            setLoading(false);
            return;
        }

        if (!jitsiRoom) {
            console.error('No jitsiRoom provided');
            setJitsiError('Nom de salle manquant. Utilisez le lien Google Meet ci-dessous.');
            setLoading(false);
            return;
        }

        if (!window.JitsiMeetExternalAPI) {
            console.error('JitsiMeetExternalAPI not available');
            setJitsiError('API Jitsi non disponible. Utilisez le lien Google Meet ci-dessous.');
            setLoading(false);
            return;
        }

        try {
            console.log('Creating Jitsi instance with options:', {
                roomName: jitsiRoom,
                domain: 'meet.jit.si',
                containerExists: !!jitsiContainerRef.current
            });

            const domain = 'meet.jit.si';
            const options = {
                roomName: jitsiRoom,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    enableWelcomePage: false,
                    disableDeepLinking: true,
                    enableClosePage: true,
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#f3f4f6',
                    VERTICAL_FILMSTRIP: true,
                    filmStripOnly: false,
                },
                userInfo: {
                    displayName: 'User',
                }
            };

            console.log('Creating JitsiMeetExternalAPI instance...');
            const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
            console.log('Jitsi API instance created:', jitsiApi);

            setApi(jitsiApi);

            // Event listeners
            jitsiApi.addEventListeners({
                readyToClose: handleReadyToClose,
                participantJoined: handleParticipantJoined,
                participantLeft: handleParticipantLeft,
                videoConferenceJoined: (event: any) => {
                    console.log('Joined video conference:', event);
                    handleVideoConferenceJoined(event);
                },
                videoConferenceLeft: handleVideoConferenceLeft,
                audioMuteStatusChanged: handleAudioMuteStatus,
                videoMuteStatusChanged: handleVideoMuteStatus,
                errorOccurred: (error: any) => {
                    console.error('Jitsi error occurred:', error);
                    setJitsiError('Un problème est survenu avec Jitsi. Utilisez le lien Google Meet ci-dessous.');
                }
            });

            console.log('Jitsi event listeners added');
            setLoading(false);

        } catch (err) {
            console.error('Failed to initialize Jitsi:', err);
            setJitsiError(`Échec de l'initialisation: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        }finally {
            setLoading(false);

        }
    };

    // Event Handlers
    const handleReadyToClose = () => {
        console.log('Ready to close event received');
        navigate('/meetings');
    };

    const handleParticipantJoined = () => {
        console.log('Participant joined');
        setParticipantsCount(prev => prev + 1);
    };

    const handleParticipantLeft = () => {
        console.log('Participant left');
        setParticipantsCount(prev => Math.max(prev - 1, 0));
    };

    const handleVideoConferenceJoined = (event: any) => {
        console.log('Video conference joined successfully', event);
    };

    const handleVideoConferenceLeft = () => {
        console.log('Video conference left');
        navigate('/meetings');
    };

    const handleAudioMuteStatus = (payload: any) => {
        console.log('Audio mute status changed:', payload);
        setIsMuted(payload.muted);
    };

    const handleVideoMuteStatus = (payload: any) => {
        console.log('Video mute status changed:', payload);
        setIsVideoOff(payload.muted);
    };

    // Control functions
    const toggleAudio = () => {
        if (api) {
            api.executeCommand(isMuted ? 'unmute' : 'mute');
        }
    };

    const toggleVideo = () => {
        if (api) {
            api.executeCommand(isVideoOff ? 'unmute' : 'mute');
        }
    };

    const toggleChat = () => {
        if (api) {
            api.executeCommand('toggleChat');
            setShowChat(!showChat);
        }
    };

    const toggleScreenShare = () => {
        if (api) {
            api.executeCommand('toggleShareScreen');
        }
    };

    const hangup = () => {
        if (api) {
            api.executeCommand('hangup');
        }
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/mymeetings");
        }
    };

    const copyInviteLink = () => {
        const inviteLink = `${window.location.origin}/meetings/${jitsiRoom}`;
        navigator.clipboard.writeText(inviteLink);
        alert('Lien copié dans le presse-papier!');
    };

    const retryInitialization = () => {
        setError(null);
        setJitsiError(null);
        setLoading(true);
        setScriptLoaded(false);
        loadJitsiScript();
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                        <div className="text-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-100 border-t-indigo-600 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-6 font-medium text-lg">Initialisation de la réunion...</p>
                            <p className="text-sm text-gray-400 mt-2">Préparation de votre espace de réunion</p>
                            <p className="text-xs text-gray-300 mt-4">Room: {jitsiRoom}</p>
                            {meetingDetails && (
                                <p className="text-xs text-green-600 mt-2">✓ Réunion trouvée</p>
                            )}
                            {scriptLoaded && (
                                <p className="text-xs text-green-600">✓ API Jitsi chargée</p>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
                                <p className="text-gray-600 mb-2">{error}</p>
                                <p className="text-sm text-gray-500 mb-6">Room: {jitsiRoom}</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={retryInitialization}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Réessayer
                                    </button>
                                    <button
                                        onClick={() => navigate('/meetings')}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Retour aux réunions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/*<Header />*/}
            <div className="h-screen flex flex-col bg-gray-900">
                {/* Custom Toolbar */}
                <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-sm">Jitsi Meet</span>
                        </div>
                        <div className="h-4 w-px bg-gray-700"></div>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-300">Room:</span>
                            <span className="text-sm font-medium text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">
                                {jitsiRoom}
                            </span>
                        </div>

                        {/* Meeting Summary */}
                        {meetingDetails?.summary && (
                            <>
                                <div className="h-4 w-px bg-gray-700"></div>
                                <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                    </svg>
                                    <span className="text-sm text-gray-300">{meetingDetails.summary}</span>
                                </div>
                            </>
                        )}

                        {/* Participants Count */}
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-sm text-gray-300">{participantsCount} participant{participantsCount > 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Meeting Info Button */}
                    {meetingDetails && (
                        <div className="flex-1 flex justify-center">
                            <div className="bg-gray-800/50 rounded-lg px-3 py-1 flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs text-gray-300">Créateur: <span className="text-indigo-400 font-mono">{meetingDetails.creator.substring(0, 8)}...</span></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-gray-300">Expert: <span className="text-indigo-400 font-mono">{meetingDetails.expert.substring(0, 8)}...</span></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-gray-300">{meetingDetails.slotDuration} min</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Custom Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={copyInviteLink}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors group relative"
                            title="Copier le lien d'invitation"
                        >
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                        <button
                            onClick={hangup}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.684A1 1 0 008.279 3H5z" />
                            </svg>
                            <span>Quitter</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Jitsi Container - Single Video */}
                    <div className="flex-1 relative">
                        <div
                            ref={jitsiContainerRef}
                            className="absolute inset-0 w-full h-full"
                            style={{ minHeight: '500px', backgroundColor: '#1a1a1a' }}
                        />

                        {/* Custom Overlay Controls (visible when hovering) */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-3 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                                onClick={toggleAudio}
                                className={`p-3 rounded-full transition-colors ${
                                    isMuted
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
                            >
                                {isMuted ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`p-3 rounded-full transition-colors ${
                                    isVideoOff
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                title={isVideoOff ? 'Activer la caméra' : 'Désactiver la caméra'}
                            >
                                {isVideoOff ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={toggleScreenShare}
                                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                                title="Partager l'écran"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </button>

                            <button
                                onClick={toggleChat}
                                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                                title={showChat ? 'Cacher le chat' : 'Afficher le chat'}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Support Badge - Under the video */}
                    <div className="bg-gray-900 border-t border-gray-700 p-3">
                        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                            {/* Jitsi Error Message (if any) */}
                            {jitsiError && (
                                <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-sm">{jitsiError}</span>
                                </div>
                            )}

                            {/* Google Meet Link Badge */}
                            {meetingDetails?.meetUrl && (
                                <div className="flex items-center space-x-4 flex-wrap justify-center">
                                    <div className="flex items-center bg-indigo-900/30 text-indigo-300 px-4 py-2 rounded-lg">
                                        <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="text-sm">Lien de secours Google Meet :</span>
                                    </div>
                                    <a
                                        href={meetingDetails.meetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Rejoindre Google Meet
                                    </a>
                                </div>
                            )}

                            {/* Support Team Badge */}
                            <div className="flex items-center space-x-2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm">Support technique: <span className="text-indigo-400 font-medium">+33 1 23 45 67 89</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JitsiRoom;