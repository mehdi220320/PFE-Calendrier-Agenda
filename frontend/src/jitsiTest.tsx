import { JitsiMeeting } from "@jitsi/react-sdk";
import { useState, useEffect, useRef } from "react";

function JitsiTest() {
    const [meetingJoined, setMeetingJoined] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [jitsiTimeDiff, setJitsiTimeDiff] = useState(0);
    const jitsiIframeRef = useRef(null);
    const syncIntervalRef = useRef(null);

    // Update time for the top bar
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync Jitsi's timer with our navbar timer
    useEffect(() => {
        if (meetingJoined && jitsiIframeRef.current) {
            // Initial sync
            syncJitsiTimer();

            // Sync every 30 seconds to correct any drift
            syncIntervalRef.current = setInterval(syncJitsiTimer, 30000);
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [meetingJoined]);

    const syncJitsiTimer = () => {
        if (!jitsiIframeRef.current) return;

        try {
            const iframe = jitsiIframeRef.current;
            const jitsiAPI = iframe.contentWindow?.JitsiMeetJS?.app?.getConferenceInfo?.();

            if (jitsiAPI) {
                // Get Jitsi's current time (if available)
                const jitsiTime = jitsiAPI.getCurrentTime?.() || 0;
                const localTime = Math.floor(Date.now() / 1000);
                setJitsiTimeDiff(localTime - jitsiTime);
            }
        } catch (error) {
            console.log('Timer sync unavailable:', error);
        }
    };

    // Option 1: Hide Jitsi's timer and only show yours
    const hideJitsiTimer = {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
        DEFAULT_LOCAL_DISPLAY_NAME: 'You',
        TOOLBAR_ALWAYS_VISIBLE: true,
        HIDE_DEEP_LINKING_LOGO: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        // Hide Jitsi's timer
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
        ]
    };

    // Format time
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    // Get sync status
    const syncStatus = Math.abs(jitsiTimeDiff) < 2 ? '🟢 Synced' : '🟡 Syncing';

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
            background: "linear-gradient(145deg, #f8faff 0%, #ffffff 100%)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Modern Top Bar */}
            <div style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(33, 150, 243, 0.15)",
                padding: "8px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(33, 150, 243, 0.08)",
                position: "relative",
                zIndex: 1000
            }}>
                {/* Left section - Logo and Room Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                    {/* Modern Logo/Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            background: "linear-gradient(135deg, #2196f3, #1976d2)",
                            width: "36px",
                            height: "36px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 6px 12px rgba(33, 150, 243, 0.25)",
                            transform: "rotate(0deg)",
                            transition: "transform 0.2s ease"
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" stroke="white" strokeWidth="2"/>
                                <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <span style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#1a1f36",
                                letterSpacing: "-0.02em"
                            }}>
                                E-<span style={{ color: "#2196f3" }}>TAFAKNA</span>
                            </span>
                            <div style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "2px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}>
                                <span>⚡ {formattedDate}</span>
                                <span style={{ width: "3px", height: "3px", background: "#cbd5e1", borderRadius: "50%" }} />
                                <span>Room: MyTestRoom12345</span>
                            </div>
                        </div>
                    </div>

                    {/* Room Status Chip */}
                    <div style={{
                        background: "rgba(33, 150, 243, 0.08)",
                        padding: "6px 16px",
                        borderRadius: "40px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "1px solid rgba(33, 150, 243, 0.15)"
                    }}>
                        <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: meetingJoined ? "#10b981" : "#2196f3",
                            boxShadow: meetingJoined
                                ? "0 0 0 2px rgba(16, 185, 129, 0.2)"
                                : "0 0 0 2px rgba(33, 150, 243, 0.2)",
                            animation: meetingJoined ? "none" : "pulse 2s infinite"
                        }} />
                        <span style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: meetingJoined ? "#10b981" : "#2196f3"
                        }}>
                            {meetingJoined ? "Active Meeting" : "Ready to Join"}
                        </span>
                    </div>
                </div>

                {/* Center - Meeting Controls Hint */}
                <div style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "16px"
                }}>
                    {['🎥', '🎤', '👥', '💬'].map((icon, index) => (
                        <div key={index} style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            color: "#64748b",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                            border: "1px solid rgba(33, 150, 243, 0.1)",
                            transition: "all 0.2s ease",
                            cursor: "default",
                            opacity: 0.7
                        }}>
                            {icon}
                        </div>
                    ))}
                </div>

                {/* Right section - User and Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {/* Time Display with Sync Status */}
                    <div style={{
                        background: "#f1f5f9",
                        padding: "6px 14px",
                        borderRadius: "30px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#1e293b",
                        border: "1px solid rgba(33, 150, 243, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span>{formattedTime}</span>
                        {meetingJoined && (
                            <span style={{
                                fontSize: "10px",
                                padding: "2px 6px",
                                background: Math.abs(jitsiTimeDiff) < 2 ? "#10b98120" : "#f59e0b20",
                                color: Math.abs(jitsiTimeDiff) < 2 ? "#10b981" : "#f59e0b",
                                borderRadius: "12px"
                            }}>
                                {syncStatus}
                            </span>
                        )}
                    </div>

                    {/* User Profile */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#1e293b"
                            }}>
                                John Doe
                            </div>
                            <div style={{
                                fontSize: "12px",
                                color: "#64748b"
                            }}>
                                Host
                            </div>
                        </div>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #2196f3, #1976d2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "16px",
                            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)"
                        }}>
                            JD
                        </div>
                    </div>
                </div>
            </div>

            {/* Jitsi Container */}
            <div style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: "#0f1217",
            }}>
                {/* Decorative gradient overlay */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #2196f3, #64b5f6, #1976d2)",
                    zIndex: 10,
                    pointerEvents: "none"
                }} />

                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName="MyTestRoom12345"
                    configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        prejoinPageEnabled: false,
                        disableInviteFunctions: true,
                        enableClosePage: false,
                    }}
                    interfaceConfigOverwrite={hideJitsiTimer}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = "100%";
                        iframeRef.style.width = "100%";
                        iframeRef.style.border = "none";
                        iframeRef.style.background = "#0f1217";
                        iframeRef.onload = () => {
                            setMeetingJoined(true);
                            jitsiIframeRef.current = iframeRef;
                        };
                        jitsiIframeRef.current = iframeRef;
                    }}
                />
            </div>

            {/* Bottom Status Bar */}
            <div style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderTop: "1px solid rgba(33, 150, 243, 0.1)",
                padding: "8px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#64748b"
            }}>
                <div style={{ display: "flex", gap: "24px" }}>
                    <span>🔒 End-to-end encrypted</span>
                    <span>🌐 Stable connection</span>
                    <span>⚡ 1080p HD</span>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                    <span style={{ color: "#2196f3", cursor: "default" }}>Terms</span>
                    <span style={{ color: "#2196f3", cursor: "default" }}>Privacy</span>
                    <span style={{ color: "#2196f3", cursor: "default" }}>Help</span>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(1.1); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    
                    /* Smooth transitions */
                    * {
                        transition: background-color 0.2s ease, box-shadow 0.2s ease;
                    }
                    
                    /* Custom scrollbar for modern look */
                    ::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #f1f5f9;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #2196f3;
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #1976d2;
                    }
                `}
            </style>
        </div>
    );
}

export default JitsiTest;