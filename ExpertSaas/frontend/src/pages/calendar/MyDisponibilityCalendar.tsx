import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calendarService } from '../../services/calendarService';
import type { DisponibilityData, DayDisponibility, TimeSlot } from '../../models/Calendar';
import Header from '../../Component/Header';

const MyDisponibilityCalendar: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [disponibilityData, setDisponibilityData] = useState<DisponibilityData | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const daysOfWeek = [
        { value: 0, label: 'Lundi' },
        { value: 1, label: 'Mardi' },
        { value: 2, label: 'Mercredi' },
        { value: 3, label: 'Jeudi' },
        { value: 4, label: 'Vendredi' },
        { value: 5, label: 'Samedi' },
        { value: 6, label: 'Dimanche' }
    ];

    useEffect(() => {
        fetchDisponibility();
    }, []);

    const fetchDisponibility = async () => {
        setLoading(true);
        try {
            const data = await calendarService.getDisponibility();
            setDisponibilityData(data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Erreur lors du chargement des disponibilités');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const isWorkingDay = (date: Date): boolean => {
        if (!disponibilityData?.workinghours) return false;
        const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        // Convertir pour correspondre à notre format (0 = Lundi)
        const ourDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return disponibilityData.workinghours.dayOfWeek.includes(ourDayOfWeek);
    };

    const isDateBlocked = (date: Date): BlockedSlot | undefined => {
        if (!disponibilityData?.blockSlots) return undefined;

        return disponibilityData.blockSlots.find(slot => {
            const startDate = new Date(slot.startDayDate);
            const endDate = new Date(slot.endDayDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return date >= startDate && date <= endDate;
        });
    };

    const isInBreak = (hour: number, minute: number): boolean => {
        if (!disponibilityData?.break) return false;

        const [breakStartHour, breakStartMinute] = disponibilityData.break.startAt.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = disponibilityData.break.endAt.split(':').map(Number);

        const currentMinutes = hour * 60 + minute;
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

        return currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes;
    };

    const isWithinWorkingHours = (hour: number, minute: number): boolean => {
        if (!disponibilityData?.workinghours) return false;

        const [workStartHour, workStartMinute] = disponibilityData.workinghours.startTime.split(':').map(Number);
        const [workEndHour, workEndMinute] = disponibilityData.workinghours.endTime.split(':').map(Number);

        const currentMinutes = hour * 60 + minute;
        const workStartMinutes = workStartHour * 60 + workStartMinute;
        const workEndMinutes = workEndHour * 60 + workEndMinute;

        return currentMinutes >= workStartMinutes && currentMinutes < workEndMinutes;
    };

    const getSlotStatus = (date: Date, hour: number, minute: number): TimeSlot => {
        const slot: TimeSlot = {
            date,
            hour,
            minute,
            status: 'hors-service'
        };

        // Vérifier si c'est un jour travaillé
        if (!isWorkingDay(date)) {
            slot.status = 'hors-service';
            return slot;
        }

        // Vérifier si la date est bloquée
        const blockedSlot = isDateBlocked(date);
        if (blockedSlot) {
            // Vérifier si l'heure est dans le créneau bloqué
            const [blockedStartHour, blockedStartMinute] = blockedSlot.startDateTime.split(':').map(Number);
            const [blockedEndHour, blockedEndMinute] = blockedSlot.endDateTime.split(':').map(Number);

            const currentMinutes = hour * 60 + minute;
            const blockedStartMinutes = blockedStartHour * 60 + blockedStartMinute;
            const blockedEndMinutes = blockedEndHour * 60 + blockedEndMinute;

            if (currentMinutes >= blockedStartMinutes && currentMinutes < blockedEndMinutes) {
                slot.status = 'bloque';
                slot.reason = blockedSlot.reason;
                return slot;
            }
        }

        // Vérifier si c'est dans les heures de travail
        if (!isWithinWorkingHours(hour, minute)) {
            slot.status = 'hors-service';
            return slot;
        }

        // Vérifier si c'est l'heure de pause
        if (isInBreak(hour, minute)) {
            slot.status = 'pause';
            return slot;
        }

        // Sinon, c'est disponible
        slot.status = 'disponible';
        return slot;
    };

    // Fonction pour générer les créneaux basés sur slotDuration
    const generateTimeSlots = (date: Date): TimeSlot[] => {
        if (!disponibilityData?.workinghours) return [];

        const slots: TimeSlot[] = [];
        const [startHour, startMinute] = disponibilityData.workinghours.startTime.split(':').map(Number);
        const [endHour, endMinute] = disponibilityData.workinghours.endTime.split(':').map(Number);
        const slotDuration = disponibilityData.workinghours.slotDuration; // en minutes (ex: 20)

        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        // Générer les créneaux selon la durée configurée
        for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            slots.push(getSlotStatus(date, hour, minute));
        }

        return slots;
    };

    const generateWeekDays = (): DayDisponibility[] => {
        const days: DayDisponibility[] = [];
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const isWorkingDay_ = isWorkingDay(date);

            // Utiliser la nouvelle fonction pour générer les créneaux
            const slots = isWorkingDay_ ? generateTimeSlots(date) : [];

            days.push({
                date,
                dayOfWeek,
                isWorkingDay: isWorkingDay_,
                slots
            });
        }

        return days;
    };

    const weekDays = generateWeekDays();
    const weekDayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'disponible':
                return 'bg-green-500 hover:bg-green-600';
            case 'pause':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'bloque':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-gray-300 hover:bg-gray-400';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'disponible':
                return 'Disponible';
            case 'pause':
                return 'Pause';
            case 'bloque':
                return 'Bloqué';
            default:
                return 'Hors service';
        }
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getWeekRangeText = () => {
        const start = new Date(weekDays[0]?.date || new Date());
        const end = new Date(weekDays[6]?.date || new Date());
        return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    };

    // Formater l'heure pour l'affichage
    const formatTime = (hour: number, minute: number): string => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* En-tête */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                Mes disponibilités
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Visualisez vos créneaux disponibles, pauses et périodes bloquées
                            </p>
                        </div>

                        {/* Légende */}
                        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-gray-600">Pause</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                <span className="text-sm text-gray-600">Bloqué</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                                <span className="text-sm text-gray-600">Hors service</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation semaine */}
                    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                disabled={loading}
                            >
                                Aujourd'hui
                            </button>
                            <button
                                onClick={() => navigateWeek('next')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 capitalize">
                            {getWeekRangeText()}
                        </h2>
                        <button
                            onClick={fetchDisponibility}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Actualiser"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendrier de disponibilité */}
                    {loading ? (
                        <div className="flex items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-center">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                <p className="mt-4 text-gray-600 font-medium">Chargement des disponibilités...</p>
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
                                    onClick={fetchDisponibility}
                                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                                >
                                    Réessayer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            {/* En-tête des jours */}
                            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                {weekDayNames.map((day, index) => {
                                    const isToday = weekDays[index]?.date.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={day} className="py-4 text-center">
                                            <div className="text-sm font-semibold text-gray-600">{day}</div>
                                            <div className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                                                {weekDays[index]?.date.getDate()}
                                            </div>
                                            {!weekDays[index]?.isWorkingDay && (
                                                <span className="text-xs text-gray-400">(Non travaillé)</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Grille des créneaux - avec hauteur dynamique selon le nombre de créneaux */}
                            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
                                {weekDays.map((day, dayIndex) => (
                                    <div key={dayIndex} className="p-2">
                                        {day.slots.length > 0 ? (
                                            <div
                                                className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
                                                style={{ maxHeight: '600px' }}
                                            >
                                                {day.slots.map((slot, slotIndex) => (
                                                    <motion.div
                                                        key={slotIndex}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: slotIndex * 0.005 }}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`
                              ${getStatusColor(slot.status)} 
                              cursor-pointer rounded-lg p-2 text-white text-xs 
                              transition-all duration-200 hover:scale-105 hover:shadow-md
                              flex items-center justify-between
                            `}
                                                    >
                            <span className="font-semibold">
                              {formatTime(slot.hour, slot.minute)}
                            </span>
                                                        <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-[10px]">
                              {getStatusLabel(slot.status)}
                            </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-[100px] flex items-center justify-center">
                                                <p className="text-xs text-gray-400 text-center">
                                                    {day.isWorkingDay
                                                        ? "Aucun créneau"
                                                        : "Jour non travaillé"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Informations supplémentaires */}
                            {disponibilityData?.workinghours && (
                                <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">
                        Horaires : {disponibilityData.workinghours.startTime} - {disponibilityData.workinghours.endTime}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">
                        Durée des créneaux : {disponibilityData.workinghours.slotDuration} min
                      </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">
                        Jours travaillés : {disponibilityData.workinghours.dayOfWeek.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ')}
                      </span>
                                        </div>
                                        {disponibilityData.break && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="text-sm text-gray-600">
                          Pause : {disponibilityData.break.startAt} - {disponibilityData.break.endAt}
                        </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Modal des détails du créneau */}
                    <AnimatePresence>
                        {selectedSlot && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Détail du créneau
                                        </h3>
                                        <button
                                            onClick={() => setSelectedSlot(null)}
                                            className="text-gray-400 hover:text-gray-500 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedSlot.status)}`}></div>
                                            <span className="text-lg font-medium text-gray-900">
                        {getStatusLabel(selectedSlot.status)}
                      </span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Date :</span>{' '}
                                                {selectedSlot.date.toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                <span className="font-semibold">Horaire :</span>{' '}
                                                {formatTime(selectedSlot.hour, selectedSlot.minute)}
                                            </p>
                                            {selectedSlot.reason && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <span className="font-semibold">Raison :</span>{' '}
                                                    {selectedSlot.reason}
                                                </p>
                                            )}
                                            {disponibilityData?.workinghours && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <span className="font-semibold">Durée du créneau :</span>{' '}
                                                    {disponibilityData.workinghours.slotDuration} minutes
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setSelectedSlot(null)}
                                            className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 hover:bg-indigo-700 transition-colors font-medium"
                                        >
                                            Fermer
                                        </button>
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

export default MyDisponibilityCalendar;