import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime: string;
        date?: string;
    };
    end: {
        dateTime: string;
        date?: string;
    };
    attendees?: { email: string }[];
    hangoutLink?: string;
}

axios.defaults.withCredentials = true;

function Calendary() {
    const [date, setDate] = useState<Value>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("10:00");
    const [email, setEmail] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);
    const [meetingTitle, setMeetingTitle] = useState<string>("Réunion");
    const [meetingDuration, setMeetingDuration] = useState<number>(30);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
    const [showEvents, setShowEvents] = useState<boolean>(false);
    const [eventsRange, setEventsRange] = useState<{
        start: string;
        end: string;
    }>({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
    });

    const timeSlots = Array.from({ length: 21 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8;
        const minute = i % 2 === 0 ? "00" : "30";
        return `${hour.toString().padStart(2, "0")}:${minute}`;
    });

    useEffect(() => {
        checkAuthStatus();

        const params = new URLSearchParams(window.location.search);
        if (params.get('connected') === 'true') {
            checkAuthStatus();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (isConnected && user) {
            fetchEvents();
        }
    }, [isConnected, user]);

    useEffect(() => {
        if (date && !Array.isArray(date) && events.length > 0) {
            filterEventsByDate(date);
        }
    }, [date, events]);

    const checkAuthStatus = async () => {
        try {
            const res = await axios.get("http://localhost:5000/auth/status");
            setIsConnected(res.data.connected);
            setUser(res.data.user || null);
        } catch (err) {
            console.error("Erreur vérification auth:", err);
        }
    };

    const connectGoogle = (): void => {
        window.location.href = "http://localhost:5000/auth/google";
    };

    const disconnectGoogle = async (): Promise<void> => {
        try {
            await axios.post("http://localhost:5000/auth/logout");
            setIsConnected(false);
            setUser(null);
            setLink("");
            setEvents([]);
            setSelectedDateEvents([]);
        } catch (err) {
            console.error("Erreur déconnexion:", err);
        }
    };

    const fetchEvents = async () => {
        setEventsLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/calendar-events", {
                params: {
                    timeMin: new Date(eventsRange.start).toISOString(),
                    timeMax: new Date(eventsRange.end).toISOString()
                }
            });
            setEvents(res.data.events);
            if (date && !Array.isArray(date)) {
                filterEventsByDate(date, res.data.events);
            }
        } catch (err: any) {
            console.error("Erreur récupération événements:", err);
            if (err.response?.status === 401) {
                alert("Session expirée. Veuillez vous reconnecter.");
                setIsConnected(false);
                setUser(null);
            }
        } finally {
            setEventsLoading(false);
        }
    };

    const filterEventsByDate = (selectedDate: Date, eventsList: CalendarEvent[] = events) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const filtered = eventsList.filter(event => {
            const eventDate = event.start.dateTime
                ? new Date(event.start.dateTime).toISOString().split('T')[0]
                : event.start.date;
            return eventDate === dateStr;
        });
        setSelectedDateEvents(filtered);
    };

    const getDayEvents = (date: Date): CalendarEvent[] => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => {
            const eventDate = event.start.dateTime
                ? new Date(event.start.dateTime).toISOString().split('T')[0]
                : event.start.date;
            return eventDate === dateStr;
        });
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dayEvents = getDayEvents(date);
            if (dayEvents.length > 0) {
                return (
                    <div className="event-dot-container">
                        <span className="event-dot"></span>
                        {dayEvents.length > 1 && (
                            <span className="event-count">{dayEvents.length}</span>
                        )}
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dayEvents = getDayEvents(date);
            if (dayEvents.length > 0) {
                return 'has-events';
            }
        }
        return null;
    };

    const combineDateAndTime = (date: Date, time: string): Date => {
        const [hours, minutes] = time.split(":").map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
    };

    const bookMeeting = async (): Promise<void> => {
        if (!date || Array.isArray(date)) {
            alert("Veuillez sélectionner une date");
            return;
        }

        if (!email) {
            alert("Veuillez entrer l'email de l'invité");
            return;
        }

        const meetingDateTime = combineDateAndTime(date, selectedTime);

        if (meetingDateTime < new Date()) {
            alert("Veuillez sélectionner une date et heure future");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/create-meeting",
                {
                    dateTime: meetingDateTime.toISOString(),
                    email,
                    title: meetingTitle,
                    duration: meetingDuration,
                }
            );

            setLink(res.data.meetLink);

            if (res.data.emailSent) {
                alert(`✅ Réunion créée! Un email a été envoyé à ${email} et à ${res.data.organizer}`);
                // Refresh events after creating a new meeting
                fetchEvents();
            } else {
                alert(`⚠️ Réunion créée mais l'email n'a pas pu être envoyé: ${res.data.emailMessage}`);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                alert("Session expirée. Veuillez vous reconnecter.");
                setIsConnected(false);
                setUser(null);
            } else {
                alert("Erreur lors de la création de la réunion: " + err.response?.data?.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatEventTime = (dateTimeStr: string) => {
        return new Date(dateTimeStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container">
            <div className="header">
                <h1 className="title">
                    <span style={{ WebkitTextFillColor: "navy" }}>📅</span>
                    Planificateur de Réunions
                </h1>
                <p className="subtitle">Connectez-vous avec Google pour créer des réunions Meet</p>
            </div>

            {/* Section utilisateur */}
            <div className="user-section">
                {isConnected && user ? (
                    <div className="user-info">
                        <div className="user-details">
                            <div className="user-avatar">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                            </div>
                            <div>
                                <p className="user-name">{user.name}</p>
                                <p className="user-email">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={disconnectGoogle}
                            className="logout-button"
                        >
                            Se déconnecter
                        </button>
                    </div>
                ) : (
                    <div className="connect-prompt">
                        <p className="connect-text">Connectez-vous pour planifier des réunions</p>
                        <button
                            onClick={connectGoogle}
                            className="google-button"
                        >
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Se connecter avec Google
                        </button>
                    </div>
                )}
            </div>

            {/* Calendar Events Toggle */}
            {isConnected && (
                <div className="events-toggle-section">
                    <button
                        onClick={() => setShowEvents(!showEvents)}
                        className="events-toggle-button"
                    >
                        {showEvents ? '📅 Masquer le calendrier' : '📅 Afficher mon calendrier'}
                    </button>

                    {showEvents && (
                        <div className="events-range-selector">
                            <label>
                                Du:
                                <input
                                    type="date"
                                    value={eventsRange.start}
                                    onChange={(e) => setEventsRange({...eventsRange, start: e.target.value})}
                                    className="date-range-input"
                                />
                            </label>
                            <label>
                                Au:
                                <input
                                    type="date"
                                    value={eventsRange.end}
                                    onChange={(e) => setEventsRange({...eventsRange, end: e.target.value})}
                                    className="date-range-input"
                                />
                            </label>
                            <button
                                onClick={fetchEvents}
                                className="refresh-events-button"
                                disabled={eventsLoading}
                            >
                                {eventsLoading ? '🔄' : '⟳'} Actualiser
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Formulaire de réunion (visible seulement si connecté) */}
            {isConnected && (
                <div className="meeting-form">
                    <h2 className="section-title">Créer une nouvelle réunion</h2>

                    <div className="form-grid">
                        {/* Titre de la réunion */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">📝</span>
                                Titre de la réunion
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Réunion d'équipe"
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        {/* Email de l'invité */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">✉️</span>
                                Email de l'invité
                            </label>
                            <input
                                type="email"
                                placeholder="exemple@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        {/* Durée de la réunion */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">⏱️</span>
                                Durée (minutes)
                            </label>
                            <select
                                value={meetingDuration}
                                onChange={(e) => setMeetingDuration(Number(e.target.value))}
                                className="form-select"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>1 heure</option>
                                <option value={90}>1 heure 30</option>
                                <option value={120}>2 heures</option>
                            </select>
                        </div>
                    </div>

                    {/* Calendrier et sélecteur d'heure */}
                    <div className="datetime-section">
                        <div className="calendar-wrapper">
                            <label className="form-label">
                                <span className="label-icon">📅</span>
                                Sélectionnez une date
                                {showEvents && events.length > 0 && (
                                    <span className="events-indicator">
                                        ({events.length} événements trouvés)
                                    </span>
                                )}
                            </label>
                            <Calendar
                                onChange={setDate}
                                value={date}
                                minDate={new Date()}
                                className="custom-calendar"
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                            />

                            {/* Événements du jour sélectionné */}
                            {showEvents && selectedDateEvents.length > 0 && (
                                <div className="day-events-list">
                                    <h4 className="day-events-title">
                                        📋 Événements du {date && !Array.isArray(date) &&
                                        date.toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </h4>
                                    <div className="events-container">
                                        {selectedDateEvents.map((event) => (
                                            <div key={event.id} className="event-item">
                                                <div className="event-time">
                                                    {event.start.dateTime ? (
                                                        <>
                                                            {formatEventTime(event.start.dateTime)} -
                                                            {formatEventTime(event.end.dateTime)}
                                                        </>
                                                    ) : (
                                                        'Journée entière'
                                                    )}
                                                </div>
                                                <div className="event-details">
                                                    <strong>{event.summary}</strong>
                                                    {event.attendees && event.attendees.length > 0 && (
                                                        <div className="event-attendees">
                                                            👥 {event.attendees.length} participant(s)
                                                        </div>
                                                    )}
                                                    {event.hangoutLink && (
                                                        <a
                                                            href={event.hangoutLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="event-meet-link"
                                                        >
                                                            🎥 Lien Meet
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showEvents && selectedDateEvents.length === 0 && date && (
                                <div className="no-events-message">
                                    ✅ Aucun événement pour cette journée
                                </div>
                            )}
                        </div>

                        <div className="time-wrapper">
                            <label className="form-label">
                                <span className="label-icon">⏰</span>
                                Sélectionnez une heure
                            </label>
                            <div className="time-slots">
                                {timeSlots.map((time) => {
                                    // Check if time slot is available (not conflicting with existing events)
                                    const isTimeSlotAvailable = !selectedDateEvents.some(event => {
                                        if (!event.start.dateTime) return false;
                                        const eventStart = new Date(event.start.dateTime);
                                        const eventEnd = new Date(event.end.dateTime);
                                        const slotTime = combineDateAndTime(date as Date, time);
                                        return slotTime >= eventStart && slotTime < eventEnd;
                                    });

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''} 
                                                ${!isTimeSlotAvailable ? 'unavailable' : ''}`}
                                            disabled={!isTimeSlotAvailable}
                                            title={!isTimeSlotAvailable ? 'Créneau déjà occupé' : ''}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bouton de création */}
                    <button
                        onClick={bookMeeting}
                        disabled={loading}
                        className={`create-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Création en cours...
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🎥</span>
                                Créer la réunion Meet
                            </>
                        )}
                    </button>

                    {/* Lien de la réunion créée */}
                    {link && (
                        <div className="meeting-link-card">
                            <h3 className="success-title">✅ Réunion créée avec succès!</h3>
                            <p className="meeting-details">
                                <strong>Titre:</strong> {meetingTitle}<br />
                                <strong>Date:</strong> {date && !Array.isArray(date) &&
                                date.toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                            }<br />
                                <strong>Heure:</strong> {selectedTime}<br />
                                <strong>Durée:</strong> {meetingDuration} minutes<br />
                                <strong>Invité:</strong> {email}
                            </p>
                            <p className="link-label">Lien Google Meet :</p>
                            <div className="link-container">
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="meet-link"
                                >
                                    {link}
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(link);
                                        alert("Lien copié !");
                                    }}
                                    className="copy-button"
                                >
                                    📋 Copier
                                </button>
                            </div>
                            <p className="email-note">
                                Un email a été envoyé à {email} avec ce lien.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Calendary;