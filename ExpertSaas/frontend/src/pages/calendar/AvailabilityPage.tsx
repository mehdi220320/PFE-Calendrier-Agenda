import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calendarService } from '../../services/calendarService.tsx';
import type { DisponibilityData, TimeSlot, BlockedSlot, AvailabilityOverride } from '../../models/Calendar.tsx';
import Header from '../../Component/Header';

type ViewMode = 'month' | 'week';

const AvailabilityPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [disponibilityData, setDisponibilityData] = useState<DisponibilityData | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const shortDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    useEffect(() => {
        fetchDisponibility();
    }, []);

    const fetchDisponibility = async () => {
        setLoading(true);
        try {
            const data = await calendarService.getDisponibility();
            setDisponibilityData(data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get override for a specific date
    const getOverrideForDate = (date: Date): AvailabilityOverride | undefined => {
        if (!disponibilityData?.availabilityoverride) return undefined;

        const dateString = date.toISOString().split('T')[0];
        return disponibilityData.availabilityoverride.find(override =>
            new Date(override.day).toISOString().split('T')[0] === dateString
        );
    };

    // Check if a date has a custom override
    const hasCustomOverride = (date: Date): boolean => {
        return !!getOverrideForDate(date);
    };

    // Get working hours for a specific date (considering overrides)
    const getWorkingHoursForDate = (date: Date): { start: string; end: string } | null => {
        const override = getOverrideForDate(date);

        if (override && override.workingTimes.length > 0) {
            // For multiple intervals, we consider the earliest start and latest end
            const start = override.workingTimes.reduce((earliest, current) =>
                current.start < earliest ? current.start : earliest, override.workingTimes[0].start);
            const end = override.workingTimes.reduce((latest, current) =>
                current.end > latest ? current.end : latest, override.workingTimes[0].end);
            return { start, end };
        }

        if (disponibilityData?.availability && isDefaultWorkingDay(date)) {
            return {
                start: disponibilityData.availability.startTime,
                end: disponibilityData.availability.endTime
            };
        }

        return null;
    };

    const isDefaultWorkingDay = (date: Date): boolean => {
        if (!disponibilityData?.availability) return false;
        const dayOfWeek = date.getDay();
        const ourDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return disponibilityData.availability.dayOfWeek.includes(ourDayOfWeek);
    };

    const isWorkingDay = (date: Date): boolean => {
        return hasCustomOverride(date) || isDefaultWorkingDay(date);
    };

    const isDateCompletelyBlocked = (date: Date): BlockedSlot | undefined => {
        if (!disponibilityData?.blockSlots) return undefined;

        return disponibilityData.blockSlots.find(slot => {
            const startDate = new Date(slot.startDateTime);
            const endDate = new Date(slot.endDateTime);

            const dateWithoutTime = new Date(date);
            dateWithoutTime.setHours(0, 0, 0, 0);

            const startDateWithoutTime = new Date(startDate);
            startDateWithoutTime.setHours(0, 0, 0, 0);

            const endDateWithoutTime = new Date(endDate);
            endDateWithoutTime.setHours(0, 0, 0, 0);

            return dateWithoutTime >= startDateWithoutTime && dateWithoutTime <= endDateWithoutTime;
        });
    };

    const isTimeSlotBlocked = (date: Date, hour: number, minute: number): BlockedSlot | undefined => {
        if (!disponibilityData?.blockSlots) return undefined;

        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        return disponibilityData.blockSlots.find(slot => {
            const startDateTime = new Date(slot.startDateTime);
            const endDateTime = new Date(slot.endDateTime);

            return slotDateTime >= startDateTime && slotDateTime < endDateTime;
        });
    };

    const isInBreak = (date: Date, hour: number, minute: number): boolean => {
        // If the day has a custom override, break doesn't apply
        if (hasCustomOverride(date)) return false;

        if (!disponibilityData?.break) return false;

        const [breakStartHour, breakStartMinute] = disponibilityData.break.startAt.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = disponibilityData.break.endAt.split(':').map(Number);

        const currentMinutes = hour * 60 + minute;
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

        return currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes;
    };

    const getSlotStatus = (date: Date, hour: number, minute: number): 'disponible' | 'pause' | 'bloque' | 'hors-service' => {
        if (!isWorkingDay(date)) return 'hors-service';

        const blockedSlot = isTimeSlotBlocked(date, hour, minute);

        // If there's a blocked slot, it overrides everything
        if (blockedSlot) return 'bloque';

        // Check if the slot falls within any working interval
        const override = getOverrideForDate(date);

        if (override) {
            // For custom days, check if the time is within any of the working intervals
            const currentMinutes = hour * 60 + minute;

            const isInWorkingInterval = override.workingTimes.some(interval => {
                const [startHour, startMinute] = interval.start.split(':').map(Number);
                const [endHour, endMinute] = interval.end.split(':').map(Number);

                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                return currentMinutes >= startMinutes && currentMinutes < endMinutes;
            });

            if (!isInWorkingInterval) return 'hors-service';

            // No break on custom days
            return 'disponible';
        }

        // Default behavior for non-custom days
        const [workStartHour, workStartMinute] = disponibilityData?.availability?.startTime.split(':').map(Number) || [9, 0];
        const [workEndHour, workEndMinute] = disponibilityData?.availability?.endTime.split(':').map(Number) || [17, 0];

        const currentMinutes = hour * 60 + minute;
        const workStartMinutes = workStartHour * 60 + workStartMinute;
        const workEndMinutes = workEndHour * 60 + workEndMinute;

        if (currentMinutes < workStartMinutes || currentMinutes >= workEndMinutes) return 'hors-service';
        if (isInBreak(date, hour, minute)) return 'pause';

        return 'disponible';
    };

    const getDayStatus = (date: Date): 'disponible' | 'pause' | 'bloque' | 'hors-service' | 'personnalise' => {
        if (!isWorkingDay(date)) return 'hors-service';

        const completelyBlocked = isDateCompletelyBlocked(date);
        if (completelyBlocked) return 'bloque';

        if (hasCustomOverride(date)) return 'personnalise';

        return 'disponible';
    };

    const generateTimeSlots = (date: Date): TimeSlot[] => {
        if (!disponibilityData?.availability || !isWorkingDay(date)) return [];

        const slots: TimeSlot[] = [];
        const override = getOverrideForDate(date);

        if (override) {
            // For custom days, generate slots for each working interval
            override.workingTimes.forEach(interval => {
                const [startHour, startMinute] = interval.start.split(':').map(Number);
                const [endHour, endMinute] = interval.end.split(':').map(Number);
                const slotDuration = disponibilityData.availability.slotDuration;

                const startTotalMinutes = startHour * 60 + startMinute;
                const endTotalMinutes = endHour * 60 + endMinute;

                for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
                    const hour = Math.floor(minutes / 60);
                    const minute = minutes % 60;
                    const blockedSlot = isTimeSlotBlocked(date, hour, minute);

                    slots.push({
                        date,
                        hour,
                        minute,
                        status: getSlotStatus(date, hour, minute),
                        reason: blockedSlot?.reason
                    });
                }
            });

            // Sort slots by time
            slots.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
        } else {
            // Default behavior for non-custom days
            const [startHour, startMinute] = disponibilityData.availability.startTime.split(':').map(Number);
            const [endHour, endMinute] = disponibilityData.availability.endTime.split(':').map(Number);
            const slotDuration = disponibilityData.availability.slotDuration;

            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                const blockedSlot = isTimeSlotBlocked(date, hour, minute);

                slots.push({
                    date,
                    hour,
                    minute,
                    status: getSlotStatus(date, hour, minute),
                    reason: blockedSlot?.reason
                });
            }
        }

        return slots;
    };

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
        } else {
            if (direction === 'prev') {
                newDate.setDate(newDate.getDate() - 7);
            } else {
                newDate.setDate(newDate.getDate() + 7);
            }
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = startPadding; i > 0; i--) {
            const d = new Date(year, month, 1 - i);
            days.push({ date: d, isCurrentMonth: false });
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(year, month, d);
            days.push({ date: dateObj, isCurrentMonth: true });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }

        return days;
    };

    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        const diff = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'disponible': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
            case 'pause': return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
            case 'bloque': return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
            case 'personnalise': return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200';
            default: return 'bg-gray-100 text-gray-400 border-gray-200';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'disponible': return 'Disponible';
            case 'pause': return 'Pause';
            case 'bloque': return 'Bloqué';
            case 'personnalise': return 'Personnalisé';
            default: return 'Fermé';
        }
    };

    const formatTime = (hour: number, minute: number): string => {
        return `${hour.toString().padStart(2, '0')}h${minute > 0 ? minute.toString().padStart(2, '0') : '00'}`;
    };

    const formatDateTime = (dateTimeString: string): string => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTitle = (): string => {
        if (viewMode === 'month') {
            return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else {
            const weekDays = getWeekDays();
            const start = weekDays[0];
            const end = weekDays[6];
            return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
        }
    };

    const monthDays = getDaysInMonth();
    const weekDays = getWeekDays();

    const getAvailabilityHours = () => {
        if (!disponibilityData?.availability) return [];
        const [startHour] = disponibilityData.availability.startTime.split(':').map(Number);
        const [endHour] = disponibilityData.availability.endTime.split(':').map(Number);
        const hours = [];
        for (let h = startHour; h < endHour; h++) {
            hours.push(h);
        }
        return hours;
    };

    const availabilityHours = getAvailabilityHours();

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                <main className="mx-auto max-w-7xl px-4 py-8">
                    {/* En-tête */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl font-semibold text-gray-800">Mes disponibilités</h1>

                        <div className="flex items-center gap-4">
                            {/* Légende */}
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></span>
                                    <span className="text-sm text-gray-600">Dispo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300"></span>
                                    <span className="text-sm text-gray-600">Pause</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></span>
                                    <span className="text-sm text-gray-600">Bloqué</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-purple-100 border border-purple-300"></span>
                                    <span className="text-sm text-gray-600">Personnalisé</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></span>
                                    <span className="text-sm text-gray-600">Fermé</span>
                                </div>
                            </div>

                            {/* Sélecteur de vue */}
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                                        viewMode === 'month'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Mois
                                </button>
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                                        viewMode === 'week'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Semaine
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                        <div className="flex items-center justify-between p-4">
                            <button
                                onClick={() => navigate('prev')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="text-lg font-medium text-gray-800 capitalize">
                                    {getTitle()}
                                </span>
                                <button
                                    onClick={goToToday}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Aujourd'hui
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('next')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Calendrier */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
                            <div className="inline-block h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-base text-gray-500">Chargement...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
                            <p className="text-red-500 text-base mb-4">{error}</p>
                            <button
                                onClick={fetchDisponibility}
                                className="text-indigo-600 hover:text-indigo-800 text-base font-medium"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Vue Mois */}
                            {viewMode === 'month' && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                        {shortDays.map(day => (
                                            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 divide-x divide-gray-200">
                                        {monthDays.map((day, index) => {
                                            const status = getDayStatus(day.date);
                                            const isToday = day.date.toDateString() === new Date().toDateString();
                                            const statusColor = getStatusColor(status);
                                            const blockedSlot = isDateCompletelyBlocked(day.date);
                                            const override = getOverrideForDate(day.date);

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        if (status !== 'hors-service') {
                                                            setSelectedSlot({
                                                                date: day.date,
                                                                hour: 0,
                                                                minute: 0,
                                                                status,
                                                                reason: blockedSlot?.reason
                                                            });
                                                        }
                                                    }}
                                                    className={`
                                                        min-h-[120px] p-3 border-b border-gray-200
                                                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
                                                        ${status !== 'hors-service' ? 'cursor-pointer hover:bg-gray-50' : ''}
                                                        transition-colors
                                                        relative
                                                    `}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <span className={`
                                                            text-base font-medium inline-block w-7 h-7 flex items-center justify-center rounded-full
                                                            ${isToday ? 'bg-indigo-600 text-white' : day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
                                                        `}>
                                                            {day.date.getDate()}
                                                        </span>
                                                        {status !== 'hors-service' && (
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                                                                {getStatusLabel(status)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {override && (
                                                        <div className="mt-1 text-xs text-purple-600 truncate" title="Horaires personnalisés">
                                                            {override.workingTimes.map(interval =>
                                                                `${interval.start}-${interval.end}`
                                                            ).join(', ')}
                                                        </div>
                                                    )}
                                                    {blockedSlot?.reason && (
                                                        <div className="mt-1 text-xs text-red-600 truncate" title={blockedSlot.reason}>
                                                            {blockedSlot.reason}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Vue Semaine */}
                            {viewMode === 'week' && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="grid grid-cols-8 border-b border-gray-200">
                                        <div className="bg-gray-50 p-3 border-r border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Heures</span>
                                        </div>
                                        {weekDays.map((date, index) => {
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const override = getOverrideForDate(date);
                                            return (
                                                <div key={index} className="bg-gray-50 p-3 text-center border-r last:border-r-0">
                                                    <div className="text-sm font-medium text-gray-500">{daysOfWeek[index]}</div>
                                                    <div className={`text-base font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                        {date.getDate()} {months[date.getMonth()].slice(0, 3)}
                                                    </div>
                                                    {override && (
                                                        <div className="mt-1 text-xs text-purple-600">
                                                            Personnalisé
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="divide-y divide-gray-200">
                                        {availabilityHours.map(hour => (
                                            <div key={hour} className="grid grid-cols-8">
                                                <div className="p-3 border-r border-gray-200 bg-gray-50/50">
                                                    <span className="text-sm font-medium text-gray-600">{hour}h</span>
                                                </div>

                                                {weekDays.map((date, dayIndex) => {
                                                    const slots = generateTimeSlots(date).filter(s => s.hour === hour);

                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px]"
                                                        >
                                                            {slots.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {slots.map((slot, i) => (
                                                                        <div
                                                                            key={i}
                                                                            onClick={() => setSelectedSlot(slot)}
                                                                            className={`text-xs p-2 rounded-md font-medium cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(slot.status)}`}
                                                                            title={slot.reason || getStatusLabel(slot.status)}
                                                                        >
                                                                            {formatTime(slot.hour, slot.minute)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="h-full flex items-center justify-center">
                                                                    <span className="text-xs text-gray-300">-</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Infos horaires */}
                    {disponibilityData?.availability && !loading && (
                        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Horaires par défaut:</span>
                                    <span className="font-medium text-gray-800">
                                        {disponibilityData.availability.startTime} - {disponibilityData.availability.endTime}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Créneaux:</span>
                                    <span className="font-medium text-gray-800">{disponibilityData.availability.slotDuration} min</span>
                                </div>
                                {disponibilityData.break && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Pause (jours standards):</span>
                                        <span className="font-medium text-gray-800">
                                            {disponibilityData.break.startAt} - {disponibilityData.break.endAt}
                                        </span>
                                    </div>
                                )}
                                {disponibilityData.availabilityoverride && disponibilityData.availabilityoverride.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Jours personnalisés:</span>
                                        <span className="font-medium text-purple-600">
                                            {disponibilityData.availabilityoverride.length} exception(s)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Liste des créneaux bloqués */}
                    {disponibilityData?.blockSlots && disponibilityData.blockSlots.length > 0 && (
                        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Créneaux bloqués</h3>
                            <div className="space-y-2">
                                {disponibilityData.blockSlots.map((slot, index) => (
                                    <div key={index} className="text-sm text-gray-600 bg-red-50 p-2 rounded">
                                        <span className="font-medium">Du {formatDateTime(slot.startDateTime)}</span>
                                        <span> au {formatDateTime(slot.endDateTime)}</span>
                                        {slot.reason && <span className="ml-2 text-red-600">- {slot.reason}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modal détails */}
                    <AnimatePresence>
                        {selectedSlot && (
                            <div
                                className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
                                onClick={() => setSelectedSlot(null)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-lg shadow-xl max-w-md w-full p-5"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {selectedSlot.date.toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedSlot(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${
                                                selectedSlot.status === 'disponible' ? 'bg-green-500' :
                                                    selectedSlot.status === 'pause' ? 'bg-yellow-500' :
                                                        selectedSlot.status === 'bloque' ? 'bg-red-500' :
                                                            selectedSlot.status === 'personnalise' ? 'bg-purple-500' : 'bg-gray-500'
                                            }`}></span>
                                            <span className="text-base text-gray-700 font-medium">
                                                {selectedSlot.status === 'disponible' ? 'Créneau disponible' :
                                                    selectedSlot.status === 'pause' ? 'Pause café' :
                                                        selectedSlot.status === 'bloque' ? 'Créneau bloqué' :
                                                            selectedSlot.status === 'personnalise' ? 'Jour personnalisé' : 'Hors service'}
                                            </span>
                                        </div>

                                        {selectedSlot.hour > 0 && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-base text-gray-700">
                                                    <span className="font-medium">Horaire:</span> {formatTime(selectedSlot.hour, selectedSlot.minute)}
                                                </p>
                                            </div>
                                        )}

                                        {selectedSlot.reason && (
                                            <div className="bg-red-50 p-3 rounded-lg">
                                                <p className="text-sm text-red-700 font-medium">
                                                    <span className="block mb-1">Raison:</span>
                                                    {selectedSlot.reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </>
    );
};

export default AvailabilityPage;