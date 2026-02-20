import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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

    // Check Google auth status
    const checkAuth = async () => {
        const res = await fetch(`${backendURL}/auth/status`, {
            credentials: "include",
        });
        const data = await res.json();

        if (data.connected) {
            setConnected(true);
            setUser(data.user);
            fetchEvents();
        }
    };

    // Fetch events
    const fetchEvents = async () => {
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
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = `${backendURL}/auth/google`;
    };

    const handleLogout = async () => {
        await fetch(`${backendURL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setConnected(false);
        setEvents([]);
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
        <nav style={{
            backgroundColor: '#1a73e8',
            padding: '1rem',
            marginBottom: '2rem',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Expert Calendar
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => setActiveTab('calendar')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: activeTab === 'calendar' ? 'white' : 'transparent',
                        color: activeTab === 'calendar' ? '#1a73e8' : 'white',
                        border: '1px solid white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Calendrier
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: activeTab === 'events' ? 'white' : 'transparent',
                        color: activeTab === 'events' ? '#1a73e8' : 'white',
                        border: '1px solid white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Liste des événements
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: activeTab === 'availability' ? 'white' : 'transparent',
                        color: activeTab === 'availability' ? '#1a73e8' : 'white',
                        border: '1px solid white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Mes disponibilités
                </button>
            </div>
            {connected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>👤 {user?.name}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
        </nav>
    );

    const EventsList = () => (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Liste des événements à venir</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {events.length > 0 ? (
                    events
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .filter(event => new Date(event.start) > new Date())
                        .map(event => (
                            <div
                                key={event.id}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    backgroundColor: selectedEvent?.id === event.id ? '#f0f7ff' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8' }}>{event.title}</h3>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>📅 Date:</strong> {new Date(event.start).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>⏰ Heure:</strong> {new Date(event.start).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </p>
                                        {event.attendees && event.attendees.length > 0 && (
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>👥 Participants:</strong> {event.attendees.map(a => a.email).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    {event.meetLink && (
                                        <a
                                            href={event.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                backgroundColor: '#1a73e8',
                                                color: 'white',
                                                padding: '10px 20px',
                                                textDecoration: 'none',
                                                borderRadius: '4px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            📹 Rejoindre Meet
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>Aucun événement à venir</p>
                )}
            </div>
        </div>
    );

    const AvailabilitySettings = () => (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Gérer mes disponibilités</h2>
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    Définissez vos heures de disponibilité pour chaque jour de la semaine
                </p>
                {Object.entries(availability).map(([day, config]) => (
                    <div
                        key={day}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '15px',
                            borderBottom: '1px solid #ddd',
                            backgroundColor: 'white',
                            marginBottom: '10px',
                            borderRadius: '4px'
                        }}
                    >
                        <div style={{ width: '120px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {day}
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="checkbox"
                                checked={config.active}
                                onChange={(e) => handleAvailabilityChange(day, 'active', e.target.checked)}
                            />
                            Disponible
                        </label>
                        {config.active && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="time"
                                        value={config.start}
                                        onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <span>à</span>
                                    <input
                                        type="time"
                                        value={config.end}
                                        onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <button
                onClick={saveAvailability}
                style={{
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    padding: '12px 30px',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
            >
                Sauvegarder mes disponibilités
            </button>
        </div>
    );

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            {!connected ? (
                <div style={{ textAlign: "center", marginTop: "100px" }}>
                    <h1>Connexion Google requise</h1>
                    <button
                        onClick={handleLogin}
                        style={{
                            padding: "15px 30px",
                            fontSize: "18px",
                            backgroundColor: "#4285F4",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Se connecter avec Google
                    </button>
                </div>
            ) : (
                <>
                    <Navbar />

                    {activeTab === 'calendar' && (
                        <>
                            {selectedEvent && (
                                <div style={{
                                    backgroundColor: '#e8f0fe',
                                    padding: '15px',
                                    marginBottom: '20px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>Événement sélectionné:</strong> {selectedEvent.title} - {new Date(selectedEvent.start).toLocaleString('fr-FR')}
                                    </div>
                                    {selectedEvent.meetLink && (
                                        <a
                                            href={selectedEvent.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                backgroundColor: '#1a73e8',
                                                color: 'white',
                                                padding: '8px 16px',
                                                textDecoration: 'none',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            Rejoindre Meet
                                        </a>
                                    )}
                                </div>
                            )}
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
                            />
                        </>
                    )}

                    {activeTab === 'events' && <EventsList />}
                    {activeTab === 'availability' && <AvailabilitySettings />}
                </>
            )}
        </div>
    );
}

export default ExpertCalendar;