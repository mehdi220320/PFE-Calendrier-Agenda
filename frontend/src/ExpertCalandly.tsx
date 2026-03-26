import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";

interface EventType {
    id: string;
    title: string;
    start: string;
    end?: string;
    meetLink?: string;
    attendees?: { email: string }[];
}

function ExpertCalendar() {
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<EventType[]>([]);
    const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'availability'>('calendar');
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availability, setAvailability] = useState({
        monday: { active: true, start: '09:00', end: '17:00' },
        tuesday: { active: true, start: '09:00', end: '17:00' },
        wednesday: { active: true, start: '09:00', end: '17:00' },
        thursday: { active: true, start: '09:00', end: '17:00' },
        friday: { active: true, start: '09:00', end: '17:00' },
        saturday: { active: false, start: '10:00', end: '14:00' },
        sunday: { active: false, start: '10:00', end: '14:00' },
    });

    const backendURL = "http://localhost:5000";

    // Modern color palette
    const colors = {
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f9fafb',
        surface: '#ffffff',
        text: '#1f2937',
        textLight: '#6b7280',
        border: '#e5e7eb',
        hover: '#f3f4f6',
    };

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${backendURL}/auth/status`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.connected) {
                setConnected(true);
                setUser(data.user);
                fetchEvents();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${backendURL}/calendar-events`, {
                credentials: "include",
            });

            const data = await res.json();

            const formattedEvents = data.events.map((event: any) => ({
                id: event.id,
                title: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                meetLink: event.conferenceData?.entryPoints?.[0]?.uri,
                attendees: event.attendees,
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = `${backendURL}/auth/google`;
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await fetch(`${backendURL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            setConnected(false);
            setEvents([]);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.startStr,
            end: clickInfo.event.endStr,
            meetLink: clickInfo.event.extendedProps.meetLink,
            attendees: clickInfo.event.extendedProps.attendees,
        });
    };

    const saveAvailability = () => {
        // Here you would save to backend
        console.log('Saving availability:', availability);
        alert('Disponibilités sauvegardées avec succès !');
    };

    const handleAvailabilityChange = (day: string, field: string, value: any) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day as keyof typeof prev],
                [field]: value
            }
        }));
    };

    const Navbar = () => (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                padding: '1rem 2rem',
                marginBottom: '2rem',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
            }}
        >
            <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '2rem' }}>📅</span>
                ExpertFlow
            </motion.div>

            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '12px' }}>
                {[
                    { id: 'calendar', label: 'Calendrier', icon: '📆' },
                    { id: 'events', label: 'Événements', icon: '📋' },
                    { id: 'availability', label: 'Disponibilités', icon: '⏰' }
                ].map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? colors.primary : 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {connected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>
                            👤
                        </div>
                        <span style={{ fontWeight: '500' }}>{user?.name}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        disabled={isLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.5)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            opacity: isLoading ? 0.5 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto'
                        }}
                    >
                        Déconnexion
                    </motion.button>
                </motion.div>
            )}
        </motion.nav>
    );

    const EventsList = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '20px' }}
        >
            <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '2rem' }}>📋</span>
                Événements à venir
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.length > 0 ? (
                    events
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .filter(event => new Date(event.start) > new Date())
                        .map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    backgroundColor: selectedEvent?.id === event.id ? `${colors.primary}10` : colors.surface,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                📅
                                            </div>
                                            <div>
                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: '1.2rem',
                                                    fontWeight: '600',
                                                    color: colors.primary
                                                }}>
                                                    {event.title}
                                                </h3>
                                                <p style={{
                                                    margin: '0.25rem 0 0',
                                                    fontSize: '0.9rem',
                                                    color: colors.textLight
                                                }}>
                                                    {new Date(event.start).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '2rem', marginLeft: '66px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: colors.textLight }}>⏰</span>
                                                <span style={{ fontSize: '0.95rem', color: colors.text }}>
                                                    {new Date(event.start).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {event.attendees && event.attendees.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ color: colors.textLight }}>👥</span>
                                                    <span style={{ fontSize: '0.95rem', color: colors.text }}>
                                                        {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {event.meetLink && (
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={event.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                                color: 'white',
                                                padding: '0.75rem 1.5rem',
                                                textDecoration: 'none',
                                                borderRadius: '12px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.95rem',
                                                fontWeight: '500',
                                                boxShadow: '0 4px 15px -5px rgba(99, 102, 241, 0.5)'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>📹</span>
                                            Rejoindre Meet
                                        </motion.a>
                                    )}
                                </div>
                            </motion.div>
                        ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: colors.surface,
                            borderRadius: '16px',
                            border: `2px dashed ${colors.border}`
                        }}
                    >
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                        <p style={{ color: colors.textLight, fontSize: '1.1rem' }}>
                            Aucun événement à venir
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    const AvailabilitySettings = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '20px' }}
        >
            <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '2rem' }}>⏰</span>
                Gérer mes disponibilités
            </h2>

            <div style={{
                backgroundColor: colors.surface,
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
            }}>
                <p style={{
                    marginBottom: '2rem',
                    color: colors.textLight,
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    Définissez vos heures de disponibilité pour chaque jour de la semaine
                </p>

                {Object.entries(availability).map(([day, config], index) => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            padding: '1rem',
                            backgroundColor: config.active ? `${colors.primary}05` : 'transparent',
                            borderRadius: '12px',
                            marginBottom: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            width: '120px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            color: colors.text,
                            fontSize: '1rem'
                        }}>
                            {day === 'monday' ? 'Lundi' :
                                day === 'tuesday' ? 'Mardi' :
                                    day === 'wednesday' ? 'Mercredi' :
                                        day === 'thursday' ? 'Jeudi' :
                                            day === 'friday' ? 'Vendredi' :
                                                day === 'saturday' ? 'Samedi' : 'Dimanche'}
                        </div>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={config.active}
                                onChange={(e) => handleAvailabilityChange(day, 'active', e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    accentColor: colors.primary
                                }}
                            />
                            <span style={{ color: colors.textLight }}>Disponible</span>
                        </label>

                        {config.active && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                            >
                                <input
                                    type="time"
                                    value={config.start}
                                    onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        color: colors.text,
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                    onBlur={(e) => e.target.style.borderColor = colors.border}
                                />
                                <span style={{ color: colors.textLight }}>à</span>
                                <input
                                    type="time"
                                    value={config.end}
                                    onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        color: colors.text,
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                    onBlur={(e) => e.target.style.borderColor = colors.border}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveAvailability}
                style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: 'white',
                    padding: '1rem 2.5rem',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <span>💾</span>
                Sauvegarder mes disponibilités
            </motion.button>
        </motion.div>
    );

    if (!connected) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
                    padding: '20px'
                }}
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        textAlign: 'center',
                        backgroundColor: colors.surface,
                        padding: '3rem',
                        borderRadius: '30px',
                        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)',
                        maxWidth: '400px',
                        width: '100%'
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    >
                        📅
                    </motion.div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        color: colors.text,
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ExpertFlow
                    </h1>
                    <p style={{ color: colors.textLight, marginBottom: '2rem' }}>
                        Connectez-vous avec Google pour gérer votre agenda
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogin}
                        disabled={isLoading}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                            opacity: isLoading ? 0.5 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto',
                            width: '100%'
                        }}
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter avec Google'}
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${colors.background} 0%, #ffffff 100%)`,
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <Navbar />

                <AnimatePresence mode="wait">
                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {selectedEvent && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        backgroundColor: `${colors.primary}10`,
                                        padding: '1rem 1.5rem',
                                        marginBottom: '1.5rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: `1px solid ${colors.primary}20`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📌</span>
                                        <div>
                                            <strong style={{ color: colors.primary }}>Événement sélectionné:</strong>
                                            <span style={{ marginLeft: '0.5rem', color: colors.text }}>
                                                {selectedEvent.title}
                                            </span>
                                            <span style={{ marginLeft: '1rem', color: colors.textLight, fontSize: '0.9rem' }}>
                                                {new Date(selectedEvent.start).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedEvent.meetLink && (
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={selectedEvent.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                textDecoration: 'none',
                                                borderRadius: '8px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <span>📹</span>
                                            Rejoindre Meet
                                        </motion.a>
                                    )}
                                </motion.div>
                            )}
                            <div style={{
                                backgroundColor: colors.surface,
                                borderRadius: '20px',
                                padding: '1.5rem',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
                            }}>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    height="70vh"
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    events={events}
                                    eventClick={handleEventClick}
                                    locale="fr"
                                    buttonText={{
                                        today: "Aujourd'hui",
                                        month: "Mois",
                                        week: "Semaine",
                                        day: "Jour"
                                    }}
                                    eventColor={colors.primary}
                                    eventTextColor="white"
                                    slotDuration="00:30:00"
                                    allDaySlot={false}
                                    slotLabelFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: false
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'events' && <EventsList />}
                    {activeTab === 'availability' && <AvailabilitySettings />}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ExpertCalendar;