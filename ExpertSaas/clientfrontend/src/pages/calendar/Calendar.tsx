import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../component/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { meetingService } from '../../services/meetingService';
import type { Meeting } from '../../models/Meeting';
import {calendarService} from "../../services/calendarService";


function CalendarPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const navigate = useNavigate();
    const [WORK_HOURS_START,setWORK_HOURS_START] =useState(8)
    const [WORK_HOURS_END,setWORK_HOURS_END]=useState(20)
    useEffect(() => {

        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            setIsLoading(true);
            const data = await meetingService.myMeetings();
            setMeetings(data);
            setError(null);
        } catch (err) {
            setError('Failed to load meetings');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatEventTime = (meeting: Meeting) => {
        return new Date(meeting.date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isMeetingUpcoming = (meetingDate: Date | string) => {
        return new Date(meetingDate) >= new Date();
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

    const getMeetingsForDay = (date: Date) => {
        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate.toDateString() === date.toDateString();
        });
    };

    const getMeetingsForHour = (date: Date, hour: number) => {
        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate.toDateString() === date.toDateString() &&
                meetingDate.getHours() === hour;
        });
    };

    const monthDays = getDaysInMonth();
    const weekDays = getWeekDays();
    const workHours = getWorkHours();
    const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const handleRefresh = () => {
        fetchMeetings();
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
                    const dayMeetings = getMeetingsForDay(date);
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
                                {dayMeetings.length > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                        {dayMeetings.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                                {dayMeetings.slice(0, 3).map((meeting) => {
                                    const isUpcoming = isMeetingUpcoming(meeting.date);
                                    return (
                                        <div
                                            key={meeting.id}
                                            onClick={() => setSelectedMeeting(meeting)}
                                            className={`text-xs p-1.5 rounded-md cursor-pointer truncate transition-all duration-200 border-l-2 ${
                                                isUpcoming
                                                    ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border-l-2 border-green-500 hover:from-green-100 hover:to-green-200'
                                                    : 'bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border-l-2 border-gray-400 hover:from-gray-100 hover:to-gray-200'
                                            }`}
                                            title={meeting.summary || 'Réunion sans titre'}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    isUpcoming ? 'bg-green-500' : 'bg-gray-500'
                                                }`}></span>
                                                <span className="font-semibold">{formatEventTime(meeting)}</span>
                                            </div>
                                            <span className="opacity-90 block truncate pl-3">
                                                {meeting.summary || 'Réunion sans titre'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {dayMeetings.length > 3 && (
                                    <div className="text-xs text-gray-500 pl-1 font-medium">
                                        +{dayMeetings.length - 3} réunion(s)
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
                            const hourMeetings = getMeetingsForHour(date, hour);
                            const isCurrentHour = date.toDateString() === new Date().toDateString() &&
                                hour === new Date().getHours();

                            return (
                                <div
                                    key={index}
                                    className={`relative p-1 ${isCurrentHour ? 'bg-indigo-50/50' : ''}`}
                                >
                                    {hourMeetings.map((meeting) => {
                                        const isUpcoming = isMeetingUpcoming(meeting.date);
                                        return (
                                            <div
                                                key={meeting.id}
                                                onClick={() => setSelectedMeeting(meeting)}
                                                className={`absolute inset-x-1 p-1.5 text-xs rounded-md cursor-pointer transition-all duration-200 shadow-sm z-10 ${
                                                    isUpcoming
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                                                }`}
                                                style={{
                                                    top: '2px',
                                                    height: 'auto',
                                                    minHeight: '24px'
                                                }}
                                                title={meeting.summary || 'Réunion sans titre'}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                                    <span className="font-semibold">{formatEventTime(meeting)}</span>
                                                </div>
                                                <span className="ml-2 opacity-90 truncate block">
                                                    {meeting.summary || 'Réunion sans titre'}
                                                </span>
                                            </div>
                                        );
                                    })}
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
                    const hourMeetings = getMeetingsForHour(currentDate, hour);
                    const isCurrentHour = hour === new Date().getHours();

                    return (
                        <div key={hour} className={`grid grid-cols-12 min-h-[80px] hover:bg-gray-50/50 transition-colors ${isCurrentHour ? 'bg-indigo-50/30' : ''}`}>
                            <div className="col-span-1 py-3 px-2 text-sm font-medium text-gray-600 border-r border-gray-200 bg-gray-50/50">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="col-span-11 p-2 relative">
                                {hourMeetings.length > 0 ? (
                                    hourMeetings.map((meeting) => {
                                        const isUpcoming = isMeetingUpcoming(meeting.date);
                                        return (
                                            <motion.div
                                                key={meeting.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => setSelectedMeeting(meeting)}
                                                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 shadow-md ${
                                                    isUpcoming
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${
                                                                isUpcoming ? 'bg-white' : 'bg-gray-200'
                                                            }`}></span>
                                                            <h4 className="font-semibold">{meeting.summary || 'Réunion sans titre'}</h4>
                                                        </div>
                                                        {meeting.description && (
                                                            <p className="text-sm opacity-90 mt-1 ml-4">{meeting.description}</p>
                                                        )}
                                                        <p className="text-xs opacity-80 mt-2 ml-4 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {meeting.creator}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-sm bg-white/20 px-2 py-1 rounded-md">
                                                            {formatEventTime(meeting)}
                                                        </span>
                                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                                            {meeting.slotDuration} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                        Pas de réunion
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
                    {/* Meeting Details Modal */}
                    <AnimatePresence>
                        {selectedMeeting && (
                            <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {selectedMeeting.summary || 'Réunion sans titre'}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedMeeting(null)}
                                            className="text-gray-400 hover:text-gray-500 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>
                                                {new Date(selectedMeeting.date).toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-gray-600">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Durée: {selectedMeeting.slotDuration} minutes</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-gray-600">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                                <div>Créateur: {selectedMeeting.creator}</div>
                                            </div>
                                        </div>

                                        {selectedMeeting.description && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-700">{selectedMeeting.description}</p>
                                            </div>
                                        )}

                                        {selectedMeeting.meetUrl && isMeetingUpcoming(selectedMeeting.date) && (
                                            <a
                                                href={selectedMeeting.meetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-center bg-indigo-600 text-white rounded-lg px-4 py-3 hover:bg-indigo-700 transition-colors font-medium"
                                            >
                                                Rejoindre la réunion
                                            </a>
                                        )}

                                        {!selectedMeeting.meetUrl && (
                                            <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                                                Aucun lien de réunion disponible
                                            </div>
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
                                Visualisez toutes vos réunions
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
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
                                        <p className="mt-4 text-gray-600 font-medium">Chargement des réunions...</p>
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

                    {/* Meetings summary for week and day views */}
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
                                Résumé des réunions
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full">
                                    Total: {meetings.length} réunion(s)
                                </span>
                                <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                    {meetings.filter(m => isMeetingUpcoming(m.date)).length} à venir
                                </span>
                                <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                                    {meetings.filter(m => !isMeetingUpcoming(m.date)).length} passées
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