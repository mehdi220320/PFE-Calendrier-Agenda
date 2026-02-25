import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Component/Header';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    location?: string;
    attendees?: Array<{ email: string; responseStatus: string }>;
    conferenceData?: {
        entryPoints?: Array<{ uri: string; entryPointType: string }>;
    };
}

interface Calendar {
    id: string;
    summary: string;
    description?: string;
    primary?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
}

// Static mock data
const MOCK_CALENDARS: Calendar[] = [
    {
        id: 'primary',
        summary: 'Mon calendrier',
        description: 'Calendrier principal',
        primary: true,
        backgroundColor: '#4285f4',
        foregroundColor: '#ffffff'
    },
    {
        id: 'work',
        summary: 'Travail',
        description: 'Calendrier professionnel',
        backgroundColor: '#0b8043',
        foregroundColor: '#ffffff'
    },
    {
        id: 'personal',
        summary: 'Personnel',
        description: 'Événements personnels',
        backgroundColor: '#a142f4',
        foregroundColor: '#ffffff'
    }
];

const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        summary: 'Réunion d\'équipe',
        description: 'Point hebdomadaire avec l\'équipe développement',
        start: {
            dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString()
        },
        attendees: [
            { email: 'jean@exemple.com', responseStatus: 'accepted' },
            { email: 'marie@exemple.com', responseStatus: 'accepted' },
            { email: 'pierre@exemple.com', responseStatus: 'needsAction' }
        ],
        conferenceData: {
            entryPoints: [{ uri: 'https://meet.google.com/abc-defg-hij', entryPointType: 'video' }]
        }
    },
    {
        id: '2',
        summary: 'Déjeuner client',
        description: 'Restaurant Le Central',
        start: {
            dateTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString()
        },
        location: 'Le Central, Paris'
    },
    {
        id: '3',
        summary: 'Revue de code',
        description: 'Review du nouveau composant',
        start: {
            dateTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString()
        }
    },
    {
        id: '4',
        summary: 'Formation React',
        description: 'Nouvelles fonctionnalités',
        start: {
            date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]
        },
        end: {
            date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]
        }
    },
    {
        id: '5',
        summary: 'Deadline projet',
        description: 'Rendu final du projet',
        start: {
            date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]
        },
        end: {
            date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]
        }
    },
    {
        id: '6',
        summary: 'Rendez-vous médecin',
        start: {
            dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
        }
    },
    {
        id: '7',
        summary: 'Sport',
        description: 'Séance de musculation',
        start: {
            dateTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(19, 30, 0, 0)).toISOString()
        }
    },
    {
        id: '8',
        summary: 'Conference call',
        description: 'Avec l\'équipe internationale',
        start: {
            dateTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString()
        }
    },
    {
        id: '9',
        summary: 'Brainstorming',
        description: 'Nouvelles idées pour le projet',
        start: {
            dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString()
        }
    },
    {
        id: '10',
        summary: 'Workshop Design',
        description: 'Atelier UX/UI',
        start: {
            dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString()
        },
        end: {
            dateTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString()
        }
    }
];

const generateMarchEvents = (): CalendarEvent[] => {
    const year = 2026;
    const month = 2; // March

    return Array.from({ length: 50 }, (_, index) => {
        const day = (index % 31) + 1;
        const hourStart = 8 + (index % 10); // Entre 8h et 17h

        const startDate = new Date(year, month, day, hourStart, 0, 0);
        const endDate = new Date(year, month, day, hourStart + 1, 0, 0);

        return {
            id: `march-${index + 1}`,
            summary: `Événement Mars ${index + 1}`,
            description: `Description de l'événement ${index + 1}`,
            start: {
                dateTime: startDate.toISOString()
            },
            end: {
                dateTime: endDate.toISOString()
            }
        };
    });
};

MOCK_EVENTS.push(...generateMarchEvents());

function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [selectedCalendar, setSelectedCalendar] = useState<string>('primary');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const navigate = useNavigate();

    // Constants for working hours
    const WORK_HOURS_START = 8;
    const WORK_HOURS_END = 18;

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const expert = localStorage.getItem('expert');

        if (!token ) {
            navigate('/login');
            return;
        }

        // Load static data
        setCalendars(MOCK_CALENDARS);

        // Simulate loading
        setTimeout(() => {
            setEvents(MOCK_EVENTS);
            setIsLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        // Filter events based on selected calendar (simulated)
        if (selectedCalendar === 'primary') {
            setEvents(MOCK_EVENTS);
        } else if (selectedCalendar === 'work') {
            setEvents(MOCK_EVENTS.filter(e =>
                e.summary.includes('Réunion') || e.summary.includes('Conference') || e.summary.includes('Brainstorming') || e.summary.includes('Workshop')
            ));
        } else if (selectedCalendar === 'personal') {
            setEvents(MOCK_EVENTS.filter(e =>
                e.summary.includes('Déjeuner') || e.summary.includes('Sport') || e.summary.includes('Rendez-vous') || e.summary.includes('Formation')
            ));
        }
    }, [selectedCalendar]);

    const formatEventTime = (event: CalendarEvent) => {
        if (event.start.dateTime) {
            return new Date(event.start.dateTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (event.start.date) {
            return 'Journée';
        }
        return '';
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            if (view === 'month') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else if (view === 'week') {
                newDate.setDate(newDate.getDate() - 7);
            } else {
                newDate.setDate(newDate.getDate() - 1);
            }
        } else {
            if (view === 'month') {
                newDate.setMonth(newDate.getMonth() + 1);
            } else if (view === 'week') {
                newDate.setDate(newDate.getDate() + 7);
            } else {
                newDate.setDate(newDate.getDate() + 1);
            }
        }
        setCurrentDate(newDate);
    };

    const getDateRangeText = () => {
        if (view === 'month') {
            return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const start = getWeekStart(currentDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    const getWeekStart = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDay() === 0 ? 6 : start.getDay() - 1;
        start.setDate(start.getDate() - diff);
        return start;
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = startPadding; i > 0; i--) {
            const date = new Date(year, month, 1 - i);
            days.push({ date, isCurrentMonth: false });
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push({ date, isCurrentMonth: true });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }

        return days;
    };

    const getWeekDays = () => {
        const start = getWeekStart(currentDate);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getWorkHours = () => {
        const hours = [];
        for (let i = WORK_HOURS_START; i < WORK_HOURS_END; i++) {
            hours.push(i);
        }
        return hours;
    };

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = event.start.dateTime
                ? new Date(event.start.dateTime)
                : event.start.date
                    ? new Date(event.start.date)
                    : null;

            if (!eventDate) return false;

            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getEventsForHour = (date: Date, hour: number) => {
        return events.filter(event => {
            if (!event.start.dateTime) return false;

            const eventDate = new Date(event.start.dateTime);
            return eventDate.toDateString() === date.toDateString() &&
                eventDate.getHours() === hour;
        });
    };

    const monthDays = getDaysInMonth();
    const weekDays = getWeekDays();
    const workHours = getWorkHours();
    const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const handleRefresh = () => {
        setIsLoading(true);
        // Simulate refresh
        setTimeout(() => {
            setEvents(MOCK_EVENTS);
            setIsLoading(false);
        }, 500);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Render Month View
    const renderMonthView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {weekDayNames.map((day) => (
                    <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
                {monthDays.map(({ date, isCurrentMonth }, index) => {
                    const dayEvents = getEventsForDay(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.002 }}
                            className={`min-h-32 p-2 ${
                                isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                            } ${isToday ? 'ring-2 ring-indigo-400 ring-inset' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={`text-sm font-medium ${
                                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                    } ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : ''}`}
                                >
                                    {date.getDate()}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                        {dayEvents.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                                {dayEvents.slice(0, 3).map((event) => {
                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="text-xs p-1.5 rounded-md bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 truncate cursor-pointer hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 border-l-2 border-indigo-500"
                                            title={event.summary}
                                        >
                                            <span className="font-semibold">{formatEventTime(event)}</span>{' '}
                                            <span className="opacity-90">{event.summary}</span>
                                        </div>
                                    );
                                })}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-gray-500 pl-1 font-medium">
                                        +{dayEvents.length - 3} événement(s)
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    // Render Week View (restricted to 8h-18h)
    const renderWeekView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="py-3 px-2 text-center text-sm font-semibold text-gray-600 border-r border-gray-200">
                    Heure
                </div>
                {weekDays.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                        <div key={index} className="py-3 text-center">
                            <div className="text-sm font-semibold text-gray-600">
                                {weekDayNames[index]}
                            </div>
                            <div className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300">
                {workHours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px] hover:bg-gray-50/50">
                        <div className="py-2 px-2 text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50/50">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                        {weekDays.map((date, index) => {
                            const hourEvents = getEventsForHour(date, hour);
                            const isCurrentHour = date.toDateString() === new Date().toDateString() &&
                                hour === new Date().getHours();

                            return (
                                <div
                                    key={index}
                                    className={`relative p-1 ${isCurrentHour ? 'bg-indigo-50/50' : ''}`}
                                >
                                    {hourEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="absolute inset-x-1 p-1.5 text-xs rounded-md bg-gradient-to-r from-indigo-500 to-indigo-600 text-white truncate cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm z-10"
                                            style={{
                                                top: '2px',
                                                height: 'auto',
                                                minHeight: '24px'
                                            }}
                                            title={event.summary}
                                        >
                                            <span className="font-semibold">{formatEventTime(event)}</span>
                                            <span className="ml-1 opacity-90">{event.summary}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Working hours indicator */}
            <div className="border-t border-gray-200 bg-indigo-50/30 px-4 py-2 text-xs text-indigo-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Heures de travail affichées : {WORK_HOURS_START}:00 - {WORK_HOURS_END}:00</span>
            </div>
        </div>
    );

    // Render Day View (restricted to 8h-18h)
    const renderDayView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100/50 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </h3>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {workHours.map((hour) => {
                    const hourEvents = getEventsForHour(currentDate, hour);
                    const isCurrentHour = hour === new Date().getHours();

                    return (
                        <div key={hour} className={`grid grid-cols-12 min-h-[80px] hover:bg-gray-50/50 transition-colors ${isCurrentHour ? 'bg-indigo-50/30' : ''}`}>
                            <div className="col-span-1 py-3 px-2 text-sm font-medium text-gray-600 border-r border-gray-200 bg-gray-50/50">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="col-span-11 p-2 relative">
                                {hourEvents.length > 0 ? (
                                    hourEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => setSelectedEvent(event)}
                                            className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{event.summary}</h4>
                                                    {event.description && (
                                                        <p className="text-sm text-indigo-100 mt-1">{event.description}</p>
                                                    )}
                                                    {event.location && (
                                                        <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-sm bg-white/20 px-2 py-1 rounded-md">
                                                    {formatEventTime(event)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                        Pas d'événement
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Working hours indicator */}
            <div className="border-t border-gray-200 bg-indigo-50/30 px-4 py-2 text-xs text-indigo-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Heures de travail affichées : {WORK_HOURS_START}:00 - {WORK_HOURS_END}:00</span>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Event Details Modal */}
                    <AnimatePresence>
                        {selectedEvent && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.summary}</h3>
                                        <button
                                            onClick={() => setSelectedEvent(null)}
                                            className="text-gray-400 hover:text-gray-500 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedEvent.start.dateTime && (
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>
                                                    {new Date(selectedEvent.start.dateTime).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        {selectedEvent.location && (
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{selectedEvent.location}</span>
                                            </div>
                                        )}

                                        {selectedEvent.description && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-700">{selectedEvent.description}</p>
                                            </div>
                                        )}

                                        {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    Participants
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedEvent.attendees.map((attendee, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">{attendee.email}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                    attendee.responseStatus === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {attendee.responseStatus === 'accepted' ? 'Accepté' :
                                                                    attendee.responseStatus === 'declined' ? 'Refusé' : 'En attente'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedEvent.conferenceData?.entryPoints?.[0]?.uri && (
                                            <a
                                                href={selectedEvent.conferenceData.entryPoints[0].uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-center bg-indigo-600 text-white rounded-lg px-4 py-3 hover:bg-indigo-700 transition-colors font-medium"
                                            >
                                                Rejoindre Google Meet
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Header with title and controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Mon Calendrier
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez vos événements et disponibilités
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
                            <select
                                value={selectedCalendar}
                                onChange={(e) => setSelectedCalendar(e.target.value)}
                                className="block w-full sm:w-auto rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                                disabled={isLoading}
                            >
                                {calendars.map((cal) => (
                                    <option key={cal.id} value={cal.id}>
                                        {cal.summary} {cal.primary ? '(Principal)' : ''}
                                    </option>
                                ))}
                            </select>

                            <div className="flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                                {[
                                    { value: 'month', label: 'Mois' },
                                    { value: 'week', label: 'Semaine' },
                                    { value: 'day', label: 'Jour' }
                                ].map((v) => (
                                    <button
                                        key={v.value}
                                        onClick={() => setView(v.value as 'month' | 'week' | 'day')}
                                        disabled={isLoading}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                            view === v.value
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToToday}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                            >
                                Aujourd'hui
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                                title="Actualiser"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <button
                            onClick={() => navigateDate('prev')}
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <h2 className="text-lg font-semibold text-gray-900 capitalize">
                            {getDateRangeText()}
                        </h2>

                        <button
                            onClick={() => navigateDate('next')}
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar View */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-center">
                                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600 font-medium">Chargement des événements...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-4 text-red-600 font-medium">{error}</p>
                                        <button
                                            onClick={handleRefresh}
                                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {view === 'month' && renderMonthView()}
                                    {view === 'week' && renderWeekView()}
                                    {view === 'day' && renderDayView()}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Events summary for week and day views */}
                    {(view === 'week' || view === 'day') && !isLoading && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                        >
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Résumé des événements
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full">
                                    Total: {events.length} événement(s)
                                </span>
                                <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                    {events.filter(e => e.start.dateTime).length} avec horaire
                                </span>
                                <span className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                                    {events.filter(e => e.start.date).length} journée complète
                                </span>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </>
    );
}

export default CalendarPage;