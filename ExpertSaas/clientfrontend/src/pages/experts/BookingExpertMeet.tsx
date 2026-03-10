import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { calendarService } from '../../services/calendarService.tsx';
import { meetingService } from '../../services/meetingService.tsx';
import type { DisponibilityData, TimeSlot } from '../../models/Calendar';
import type { CreateMeetingData, Meeting } from '../../models/Meeting';

interface BookingExpertMeetProps {
    expertId?: string;
}

function BookingExpertMeet({ expertId: propExpertId }: BookingExpertMeetProps) {
    const paramsExpertId = useParams().id;
    const expertId = propExpertId || paramsExpertId;

    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [creatorEmail, setCreatorEmail] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [disponibilityData, setDisponibilityData] = useState<DisponibilityData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [slotDuration, setSlotDuration] = useState<number>(30);

    // Fetch disponibility when component mounts or expertId changes
    useEffect(() => {
        if (expertId) {
            fetchDisponibility();
        }
    }, [expertId]);

    const fetchDisponibility = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await calendarService.getDisponibility(expertId);
            console.log('Disponibility data:', data);
            setDisponibilityData(data);
            if (data.availability) {
                setSlotDuration(data.availability.slotDuration);
            }
        } catch (err) {
            setError('Impossible de charger les disponibilités');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if a slot is in the past
    const isSlotInPast = (slotDateTime: Date): boolean => {
        const now = new Date();
        return slotDateTime < now;
    };

    // Helper function to check if a slot is already booked
    const isSlotBooked = useCallback((slotDateTime: Date): boolean => {
        if (!disponibilityData?.meetings) return false;

        const slotEndTime = new Date(slotDateTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);

        return disponibilityData.meetings.some(meeting => {
            const meetingStart = new Date(meeting.date);
            const meetingEnd = new Date(meetingStart);
            meetingEnd.setMinutes(meetingEnd.getMinutes() + meeting.slotDuration);

            // Check if slots overlap
            return (slotDateTime < meetingEnd && slotEndTime > meetingStart);
        });
    }, [disponibilityData?.meetings, slotDuration]);

    // Helper function to check if a slot is blocked
    const isSlotBlocked = useCallback((slotDateTime: Date): boolean => {
        if (!disponibilityData?.blockSlots) return false;

        const slotEndTime = new Date(slotDateTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);

        return disponibilityData.blockSlots.some(blocked => {
            const blockedStart = new Date(blocked.startDateTime);
            const blockedEnd = new Date(blocked.endDateTime);

            // Check if slot overlaps with blocked period
            return (slotDateTime < blockedEnd && slotEndTime > blockedStart);
        });
    }, [disponibilityData?.blockSlots, slotDuration]);

    // Generate slots from a time interval
    const generateSlotsFromInterval = useCallback((
        date: Date,
        startTime: string,
        endTime: string,
        breakTime?: { startAt: string; endAt: string } | null
    ): TimeSlot[] => {
        const slots: TimeSlot[] = [];

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        let breakStartMinutes = -1;
        let breakEndMinutes = -1;

        if (breakTime) {
            const [breakStartHour, breakStartMinute] = breakTime.startAt.split(':').map(Number);
            const [breakEndHour, breakEndMinute] = breakTime.endAt.split(':').map(Number);
            breakStartMinutes = breakStartHour * 60 + breakStartMinute;
            breakEndMinutes = breakEndHour * 60 + breakEndMinute;
        }

        for (let minutes = startMinutes; minutes + slotDuration <= endMinutes; minutes += slotDuration) {
            const slotStartMinutes = minutes;
            const slotEndMinutes = minutes + slotDuration;

            // Skip if slot overlaps with break
            if (breakTime && breakStartMinutes !== -1 && breakEndMinutes !== -1) {
                if ((slotStartMinutes >= breakStartMinutes && slotStartMinutes < breakEndMinutes) ||
                    (slotEndMinutes > breakStartMinutes && slotEndMinutes <= breakEndMinutes) ||
                    (slotStartMinutes <= breakStartMinutes && slotEndMinutes >= breakEndMinutes)) {
                    continue;
                }
            }

            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;

            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, minute, 0, 0);

            // Skip if the slot is in the past
            if (isSlotInPast(slotDateTime)) {
                continue;
            }

            // Check if slot is blocked
            if (isSlotBlocked(slotDateTime)) {
                continue;
            }

            // Check if slot is already booked
            if (isSlotBooked(slotDateTime)) {
                continue;
            }

            slots.push({
                date: new Date(date),
                hour,
                minute,
                status: 'disponible'
            });
        }

        return slots;
    }, [slotDuration, isSlotBlocked, isSlotBooked]);

    // Generate slots for a specific date
    const generateSlotsForDate = useCallback((date: Date): TimeSlot[] => {
        if (!disponibilityData) return [];

        const dateStr = date.toDateString();
        const dayOfWeek = date.getDay();
        const slots: TimeSlot[] = [];

        // Check for override
        const dayOverride = disponibilityData.availabilityoverride?.find(
            override => new Date(override.day).toDateString() === dateStr
        );

        if (dayOverride) {
            // Use override working times
            dayOverride.workingTimes.forEach(interval => {
                const slotsFromInterval = generateSlotsFromInterval(date, interval.start, interval.end);
                slots.push(...slotsFromInterval);
            });
        }
        // Check if it's a working day
        else if (disponibilityData.availability?.dayOfWeek.includes(dayOfWeek)) {
            const availability = disponibilityData.availability;
            const slotsFromInterval = generateSlotsFromInterval(
                date,
                availability.startTime,
                availability.endTime,
                disponibilityData.break || undefined
            );
            slots.push(...slotsFromInterval);
        }

        return slots;
    }, [disponibilityData, generateSlotsFromInterval]);

    // Memoize meetings for better performance
    const meetingsByDate = useMemo(() => {
        if (!disponibilityData?.meetings) return new Map<string, Meeting[]>();

        const meetingsMap = new Map<string, Meeting[]>();
        disponibilityData.meetings.forEach(meeting => {
            const meetingDate = new Date(meeting.date);
            const dateKey = meetingDate.toDateString();

            if (!meetingsMap.has(dateKey)) {
                meetingsMap.set(dateKey, []);
            }
            meetingsMap.get(dateKey)?.push(meeting);
        });

        return meetingsMap;
    }, [disponibilityData?.meetings]);

    // Check if a date has any available slots
    const hasAvailableSlots = useCallback((date: Date): boolean => {
        if (!disponibilityData) return false;

        const dateStr = date.toDateString();
        const dayOfWeek = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Skip past dates
        if (date < today) return false;

        // Check for override
        const dayOverride = disponibilityData.availabilityoverride?.find(
            override => new Date(override.day).toDateString() === dateStr
        );

        if (dayOverride) {
            // Check if override has any working times
            return dayOverride.workingTimes.length > 0;
        }

        // Check if it's a working day
        if (!disponibilityData.availability?.dayOfWeek.includes(dayOfWeek)) {
            return false;
        }

        return true;
    }, [disponibilityData]);

    // Get available dates for calendar display
    const availableDates = useMemo(() => {
        if (!disponibilityData) return new Set<string>();

        const availableSet = new Set<string>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const next90Days = new Date(today);
        next90Days.setDate(today.getDate() + 90);

        // Check each day in the next 90 days
        for (let d = new Date(today); d <= next90Days; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);

            if (hasAvailableSlots(currentDate)) {
                // Even if the day has availability, we need to check if any slots are actually free
                const slots = generateSlotsForDate(currentDate);
                if (slots.length > 0) {
                    availableSet.add(currentDate.toDateString());
                }
            }
        }

        return availableSet;
    }, [disponibilityData, hasAvailableSlots, generateSlotsForDate]);

    // Calculate available slots for selected date
    const calculateAvailableSlots = useCallback(() => {
        if (!disponibilityData || !selectedDate) {
            setAvailableSlots([]);
            return;
        }

        const slots = generateSlotsForDate(selectedDate);

        // Sort slots by time
        slots.sort((a, b) => {
            if (a.hour !== b.hour) return a.hour - b.hour;
            return a.minute - b.minute;
        });

        setAvailableSlots(slots);
    }, [selectedDate, disponibilityData, generateSlotsForDate]);

    // Recalculate slots when date or disponibility data changes
    useEffect(() => {
        calculateAvailableSlots();
    }, [selectedDate, disponibilityData, calculateAvailableSlots]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
    };

    const handleBooking = async () => {
        if (!selectedSlot) {
            setError('Veuillez sélectionner un créneau');
            return;
        }
        if (!creatorEmail) {
            setError('Veuillez entrer votre email');
            return;
        }

        // Double-check if slot is still available before booking
        const meetingDate = new Date(selectedSlot.date);
        meetingDate.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);

        if (isSlotInPast(meetingDate)) {
            setError('Ce créneau est déjà passé');
            return;
        }

        if (isSlotBooked(meetingDate)) {
            setError('Ce créneau vient d\'être réservé. Veuillez en sélectionner un autre.');
            // Refresh disponibility
            fetchDisponibility();
            return;
        }

        if (isSlotBlocked(meetingDate)) {
            setError('Ce créneau n\'est plus disponible');
            return;
        }

        setBookingLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const meetingData: CreateMeetingData = {
                creator: creatorEmail,
                expertId: expertId!,
                date: meetingDate.toISOString(),
                slotDuration: slotDuration,
                summary: summary || undefined,
                description: description || undefined
            };

            await meetingService.createMeeting(meetingData);

            setSuccessMessage('Réunion créée avec succès ! Un email de confirmation a été envoyé.');

            // Reset form
            setCreatorEmail('');
            setSummary('');
            setDescription('');
            setSelectedSlot(null);
            setSelectedDate(null);

            // Refresh disponibility data
            await fetchDisponibility();

        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('Ce créneau vient d\'être réservé. Veuillez en sélectionner un autre.');
                // Refresh disponibility to show updated slots
                fetchDisponibility();
            } else {
                setError(err.response?.data?.message || 'Erreur lors de la création de la réunion');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const formatTime = (hour: number, minute: number) => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const formatDateLong = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateMonth = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Dimanche

        return { daysInMonth, startingDayOfWeek };
    };

    const generateCalendarDays = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isAvailable = availableDates.has(date.toDateString());
            const isPast = date < today;
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            days.push({
                date,
                day,
                isAvailable,
                isPast,
                isSelected
            });
        }

        return days;
    };

    const changeMonth = (increment: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    };

    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return (
        <div className="mx-auto ">
            {/* Header */}
            <div className="mb-8">
                <p className="text-gray-600 mt-2">Sélectionnez un créneau disponible avec l'expert</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendrier */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* En-tête du calendrier */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">
                                    {formatDateMonth(currentMonth)}
                                </h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => changeMonth(-1)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => changeMonth(1)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Jours de la semaine */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                            {weekDays.map((day, index) => (
                                <div key={index} className="bg-gray-50 py-3 text-center">
                                    <span className="text-sm font-medium text-gray-600">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grille du calendrier */}
                        {loading ? (
                            <div className="flex justify-center items-center h-96">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-px bg-gray-200">
                                {generateCalendarDays().map((day, index) => (
                                    <div key={index} className="bg-white min-h-[120px] p-2">
                                        {day ? (
                                            <button
                                                onClick={() => day.isAvailable && !day.isPast && handleDateSelect(day.date)}
                                                disabled={!day.isAvailable || day.isPast}
                                                className={`w-full h-full rounded-lg p-2 transition-all ${
                                                    day.isSelected
                                                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-600 ring-offset-2'
                                                        : day.isAvailable && !day.isPast
                                                            ? 'hover:bg-indigo-50 cursor-pointer border-2 border-transparent hover:border-indigo-200'
                                                            : 'opacity-40 cursor-not-allowed bg-gray-50'
                                                }`}
                                            >
                                                <span className={`text-lg font-semibold ${
                                                    day.isSelected ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                    {day.day}
                                                </span>
                                                {day.isAvailable && !day.isPast && !day.isSelected && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Disponible
                                                        </span>
                                                    </div>
                                                )}
                                                {day.isPast && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            Passé
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="h-full bg-gray-50 rounded-lg"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Légende */}
                    <div className="flex items-center space-x-6 mt-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                            <span className="text-gray-600">Sélectionné</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                            <span className="text-gray-600">Non disponible</span>
                        </div>
                    </div>
                </div>

                {/* Panneau de réservation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-32">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {selectedDate ? 'Créneaux disponibles' : 'Sélectionnez une date'}
                        </h3>

                        {selectedDate && (
                            <>
                                <div className="mb-4 p-3 bg-indigo-50 rounded-xl">
                                    <p className="text-sm text-indigo-600 font-medium">Date sélectionnée</p>
                                    <p className="font-semibold text-indigo-900">
                                        {formatDateLong(selectedDate)}
                                    </p>
                                </div>

                                {availableSlots.length > 0 ? (
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {availableSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                                    selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            {formatTime(slot.hour, slot.minute)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({slotDuration} min)
                                                        </span>
                                                    </div>
                                                    {selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute && (
                                                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500">Aucun créneau disponible pour cette date</p>
                                    </div>
                                )}
                            </>
                        )}

                        {selectedSlot && (
                            <>
                                <div className="border-t border-gray-200 my-6 pt-6">
                                    <h4 className="font-medium text-gray-900 mb-4">Vos informations</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={creatorEmail}
                                                onChange={(e) => setCreatorEmail(e.target.value)}
                                                placeholder="votre@email.com"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sujet (optionnel)
                                            </label>
                                            <input
                                                type="text"
                                                value={summary}
                                                onChange={(e) => setSummary(e.target.value)}
                                                placeholder="Objet de la réunion"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description (optionnelle)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Décrivez brièvement le sujet de la réunion..."
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <button
                                            onClick={handleBooking}
                                            disabled={bookingLoading}
                                            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]
                                                ${bookingLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                            }`}
                                        >
                                            {bookingLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                                    Réservation en cours...
                                                </span>
                                            ) : (
                                                'Confirmer la réservation'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingExpertMeet;