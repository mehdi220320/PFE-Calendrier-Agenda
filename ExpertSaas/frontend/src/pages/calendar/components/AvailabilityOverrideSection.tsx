import React, { useState, useEffect } from 'react';
import { calendarService } from '../../../services/calendarService.tsx';
import type {
    AvailabilityFormData,
    AvailabilityOverride,
    WorkingInterval
} from '../../../models/Calendar.tsx';

interface AvailabilityOverrideSectionProps {
    availability: AvailabilityFormData | null;
    today: Date;
}

const daysOfWeek = [
    { value: 0, label: 'Lundi' },
    { value: 1, label: 'Mardi' },
    { value: 2, label: 'Mercredi' },
    { value: 3, label: 'Jeudi' },
    { value: 4, label: 'Vendredi' },
    { value: 5, label: 'Samedi' },
    { value: 6, label: 'Dimanche' }
];

const getWeekDates = (today: Date) => {
    const dates = [];
    const currentDate = new Date(today);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push({
            date: date.toISOString().split('T')[0],
            dayOfWeek: i,
            label: daysOfWeek[i].label,
            fullDate: new Date(date)
        });
    }
    return dates;
};

const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

const getDayDisplayTime = (
    day: string,
    dayOfWeek: number,
    overrides: AvailabilityOverride[],
    availability: AvailabilityFormData | null
): string => {
    const override = overrides.find(o =>
        new Date(o.day).toISOString().split('T')[0] === day
    );

    if (override) {
        return override.workingTimes.map(i => `${i.start} - ${i.end}`).join(', ');
    }

    if (availability?.dayOfWeek.includes(dayOfWeek)) {
        return `${availability.startTime} - ${availability.endTime}`;
    }

    return '';
};

const getOverrideIdForDay = (day: string, overrides: AvailabilityOverride[]): string | undefined => {
    return overrides.find(o =>
        new Date(o.day).toISOString().split('T')[0] === day
    )?.id;
};

const AvailabilityOverrideSection: React.FC<AvailabilityOverrideSectionProps> = ({ availability, today }) => {
    const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
    const [loadingOverrides, setLoadingOverrides] = useState(false);
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [overrideIntervals, setOverrideIntervals] = useState<WorkingInterval[]>([{ start: '09:00', end: '17:00' }]);

    // Date picker modal state
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [datePickerValue, setDatePickerValue] = useState<string>('');
    const [datePickerIntervals, setDatePickerIntervals] = useState<WorkingInterval[]>([{ start: '09:00', end: '17:00' }]);
    const [loadingDatePicker, setLoadingDatePicker] = useState(false);

    // Duplicate modal state
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateSourceDay, setDuplicateSourceDay] = useState<string>('');
    const [duplicateSourceIntervals, setDuplicateSourceIntervals] = useState<WorkingInterval[]>([]);
    const [selectedDuplicateDays, setSelectedDuplicateDays] = useState<string[]>([]);
    const [loadingDuplicate, setLoadingDuplicate] = useState(false);
    const [extraDuplicateDates, setExtraDuplicateDates] = useState<string[]>([]);

    const weekDates = getWeekDates(today);

    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);

    useEffect(() => {
        fetchOverrides();
    }, []);

    const fetchOverrides = async () => {
        setLoadingOverrides(true);
        try {
            const disponibility = await calendarService.getDisponibility();
            setOverrides(disponibility.availabilityoverride || []);
        } catch (error) {
            console.error('Erreur lors du chargement des overrides:', error);
            setOverrides([]);
        } finally {
            setLoadingOverrides(false);
        }
    };

    const handleDeleteOverride = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette exception ?')) {
            try {
                await calendarService.deleteAvailabilityOverride(id);
                fetchOverrides();
                alert('Exception supprimée avec succès');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    const handleAddInterval = () => {
        const lastInterval = overrideIntervals[overrideIntervals.length - 1];
        const newStart = lastInterval?.end ? lastInterval.end.substring(0, 5) : '09:00';
        setOverrideIntervals([...overrideIntervals, { start: newStart, end: '17:00' }]);
    };

    const handleRemoveInterval = (index: number) => {
        setOverrideIntervals(overrideIntervals.filter((_, i) => i !== index));
    };

    const handleIntervalChange = (index: number, field: 'start' | 'end', value: string) => {
        const newIntervals = [...overrideIntervals];
        newIntervals[index][field] = value;
        setOverrideIntervals(newIntervals);
    };

    const handleIntervalBlur = () => {
        setOverrideIntervals(prev => [...prev].sort((a, b) => a.start.localeCompare(b.start)));
    };

    const handleSaveOverride = async () => {
        if (!selectedDay) return;

        try {
            const existingOverride = overrides.find(o =>
                new Date(o.day).toISOString().split('T')[0] === selectedDay
            );

            const overrideData = {
                day: new Date(selectedDay).toISOString(),
                workingTimes: overrideIntervals
                    .filter(interval => interval.start && interval.end)
                    .map(interval => ({
                        start: interval.start.substring(0, 5),
                        end: interval.end.substring(0, 5)
                    }))
            };

            if (overrideData.workingTimes.length === 0) {
                alert('Veuillez saisir au moins un intervalle valide');
                return;
            }

            if (existingOverride) {
                await calendarService.updateAvailabilityOverride(existingOverride.id!, overrideData);
                alert('Exception mise à jour avec succès');
            } else {
                await calendarService.addAvailabilityOverride(overrideData);
                alert('Exception ajoutée avec succès');
            }

            setShowOverrideForm(false);
            setSelectedDay('');
            setOverrideIntervals([{ start: '09:00', end: '17:00' }]);
            fetchOverrides();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const getIntervalsForDay = (day: string, dayOfWeek: number): WorkingInterval[] => {
        const existingOverride = overrides.find(o =>
            new Date(o.day).toISOString().split('T')[0] === day
        );
        if (existingOverride) return existingOverride.workingTimes;
        if (availability?.dayOfWeek.includes(dayOfWeek)) {
            return [{ start: availability.startTime, end: availability.endTime }];
        }
        return [{ start: '09:00', end: '17:00' }];
    };

    const handleOpenDuplicateModal = (day: string, dayOfWeek: number) => {
        const intervals = getIntervalsForDay(day, dayOfWeek);
        setDuplicateSourceDay(day);
        setDuplicateSourceIntervals(intervals);
        setSelectedDuplicateDays([]);
        setExtraDuplicateDates([]);
        setShowDuplicateModal(true);
    };

    const toggleDuplicateDay = (date: string) => {
        setSelectedDuplicateDays(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const handleSubmitDuplicate = async () => {
        const validExtraDates = extraDuplicateDates.filter(d => d);
        if (selectedDuplicateDays.length === 0 && validExtraDates.length === 0) {
            alert('Veuillez sélectionner au moins un jour');
            return;
        }

        setLoadingDuplicate(true);
        try {
            const workingTimes = duplicateSourceIntervals.map(interval => ({
                start: interval.start.substring(0, 5),
                end: interval.end.substring(0, 5)
            }));

            const allDays = [...selectedDuplicateDays, ...extraDuplicateDates.filter(d => d)];
            for (const date of allDays) {
                const existingOverride = overrides.find(o =>
                    new Date(o.day).toISOString().split('T')[0] === date
                );
                const overrideData = {
                    day: new Date(date).toISOString(),
                    workingTimes
                };
                if (existingOverride) {
                    await calendarService.updateAvailabilityOverride(existingOverride.id!, overrideData);
                } else {
                    await calendarService.addAvailabilityOverride(overrideData);
                }
            }

            const totalDays = selectedDuplicateDays.length + extraDuplicateDates.filter(d => d).length;
            alert(`Horaires dupliqués sur ${totalDays} jour${totalDays > 1 ? 's' : ''} avec succès`);
            setShowDuplicateModal(false);
            setSelectedDuplicateDays([]);
            setExtraDuplicateDates([]);
            fetchOverrides();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la duplication');
        } finally {
            setLoadingDuplicate(false);
        }
    };

    const handleOpenOverrideForm = (day: string, dayOfWeek: number) => {
        const dayDate = new Date(day);
        if (dayDate < todayNormalized) {
            alert('Vous ne pouvez pas modifier les jours passés');
            return;
        }

        setSelectedDay(day);

        const existingOverride = overrides.find(o =>
            new Date(o.day).toISOString().split('T')[0] === day
        );

        if (existingOverride) {
            setOverrideIntervals(existingOverride.workingTimes);
        } else {
            if (availability?.dayOfWeek.includes(dayOfWeek)) {
                setOverrideIntervals([{ start: availability.startTime, end: availability.endTime }]);
            } else {
                setOverrideIntervals([{ start: '09:00', end: '17:00' }]);
            }
        }

        setShowOverrideForm(true);
    };

    const handleSaveDatePickerOverride = async () => {
        if (!datePickerValue) {
            alert('Veuillez sélectionner une date');
            return;
        }

        const pickedDate = new Date(datePickerValue);
        pickedDate.setHours(0, 0, 0, 0);
        if (pickedDate < todayNormalized) {
            alert('Vous ne pouvez pas modifier une date passée');
            return;
        }

        const workingTimes = datePickerIntervals
            .filter(i => i.start && i.end)
            .map(i => ({ start: i.start.substring(0, 5), end: i.end.substring(0, 5) }));

        if (workingTimes.length === 0) {
            alert('Veuillez saisir au moins un intervalle valide');
            return;
        }

        setLoadingDatePicker(true);
        try {
            const existingOverride = overrides.find(o =>
                new Date(o.day).toISOString().split('T')[0] === datePickerValue
            );
            const overrideData = {
                day: new Date(datePickerValue).toISOString(),
                workingTimes
            };
            if (existingOverride) {
                await calendarService.updateAvailabilityOverride(existingOverride.id!, overrideData);
                alert('Exception mise à jour avec succès');
            } else {
                await calendarService.addAvailabilityOverride(overrideData);
                alert('Exception ajoutée avec succès');
            }
            setShowDatePickerModal(false);
            setDatePickerValue('');
            setDatePickerIntervals([{ start: '09:00', end: '17:00' }]);
            fetchOverrides();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoadingDatePicker(false);
        }
    };

    // Days available for duplication: strictly after today, excluding source day
    const duplicatableDays = weekDates.filter(d => {
        const date = new Date(d.date);
        return date > todayNormalized && d.date !== duplicateSourceDay;
    });

    return (
        <>
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span>Horaires spécifiques</span>
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {overrides.length} exception{overrides.length !== 1 ? 's' : ''}
                            </span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ajustez les horaires pour des jours spécifiques
                            </p>
                            <button
                                onClick={() => {
                                    setDatePickerValue('');
                                    setDatePickerIntervals([{ start: '09:00', end: '17:00' }]);
                                    setShowDatePickerModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Jour spécifique
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loadingOverrides ? (
                        <div className="flex justify-center py-12">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm text-gray-500">Chargement des exceptions...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {weekDates.map((day) => {
                                const displayTime = getDayDisplayTime(day.date, day.dayOfWeek, overrides, availability);
                                const overrideId = getOverrideIdForDay(day.date, overrides);
                                const dayDate = new Date(day.date);
                                const isPast = dayDate < todayNormalized;
                                const isToday = dayDate.getTime() === todayNormalized.getTime();

                                return (
                                    <div
                                        key={day.date}
                                        className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl transition-all ${
                                            isPast
                                                ? 'bg-gray-50/50 border border-gray-200 opacity-60'
                                                : isToday
                                                    ? 'bg-indigo-50/50 border border-indigo-200 hover:border-indigo-300 hover:shadow-md'
                                                    : 'bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Day indicator */}
                                        <div className="flex items-center sm:w-40">
                                            <div className={`w-2 h-2 rounded-full mr-3 ${
                                                isPast ? 'bg-gray-400' : isToday ? 'bg-indigo-500' : 'bg-green-500'
                                            }`}></div>
                                            <div>
                                                <span className={`font-semibold ${
                                                    isPast ? 'text-gray-500' : isToday ? 'text-indigo-700' : 'text-gray-800'
                                                }`}>
                                                    {day.label}
                                                </span>
                                                <span className={`ml-2 text-sm ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {formatDisplayDate(day.date)}
                                                </span>
                                            </div>
                                            {isToday && (
                                                <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    Aujourd'hui
                                                </span>
                                            )}
                                        </div>

                                        {/* Time display or edit form */}
                                        <div className="flex-1">
                                            {showOverrideForm && selectedDay === day.date ? (
                                                <div className="space-y-3 animate-fadeIn">
                                                    {overrideIntervals.map((interval, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="flex-1 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                                                <input
                                                                    type="time"
                                                                    value={interval.start}
                                                                    onChange={(e) => handleIntervalChange(index, 'start', e.target.value)}
                                                                    onBlur={handleIntervalBlur}
                                                                    className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                />
                                                                <span className="text-gray-400">→</span>
                                                                <input
                                                                    type="time"
                                                                    value={interval.end}
                                                                    onChange={(e) => handleIntervalChange(index, 'end', e.target.value)}
                                                                    onBlur={handleIntervalBlur}
                                                                    className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            {overrideIntervals.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveInterval(index)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddInterval}
                                                            className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Ajouter un intervalle
                                                        </button>
                                                        <div className="flex-1"></div>
                                                        <button
                                                            onClick={() => {
                                                                setShowOverrideForm(false);
                                                                setSelectedDay('');
                                                                setOverrideIntervals([{ start: '09:00', end: '17:00' }]);
                                                            }}
                                                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            onClick={handleSaveOverride}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                        >
                                                            Enregistrer
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    {displayTime ? (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {displayTime.split(', ').map((time, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {time}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm italic flex items-center text-gray-400">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                            Non travaillé
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!isPast && !(showOverrideForm && selectedDay === day.date) && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenDuplicateModal(day.date, day.dayOfWeek)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Dupliquer les horaires"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenOverrideForm(day.date, day.dayOfWeek)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Modifier les horaires"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    {overrideId && (
                                                        <button
                                                            onClick={() => handleDeleteOverride(overrideId)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Supprimer l'exception"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Status badge for overrides */}
                                        {overrideId && !showOverrideForm && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-white shadow-sm">
                                                    Exception
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Extra-week overrides */}
                            {(() => {
                                const weekDateStrings = weekDates.map(d => d.date);
                                const extraOverrides = overrides.filter(o => {
                                    const dateStr = new Date(o.day).toISOString().split('T')[0];
                                    return !weekDateStrings.includes(dateStr);
                                }).sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

                                if (extraOverrides.length === 0) return null;

                                return (
                                    <>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-500">Exceptions hors semaine courante</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {extraOverrides.length}
                                        </span>
                                        </div>
                                        <div className="space-y-2">
                                            {extraOverrides.map(o => {
                                                const dateStr = new Date(o.day).toISOString().split('T')[0];
                                                const fullDate = new Date(o.day);
                                                const dayLabel = fullDate.toLocaleDateString('fr-FR', { weekday: 'long' });
                                                const dayLabelCapitalized = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
                                                const formattedDate = fullDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                                return (
                                                    <div
                                                        key={o.id}
                                                        className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                                                            <div>
                                                                <span className="text-sm font-semibold text-gray-800">{dayLabelCapitalized}</span>
                                                                <span className="ml-2 text-sm text-gray-500">{formattedDate}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {o.workingTimes.map((wt, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                                                                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                    {wt.start} - {wt.end}
                                                            </span>
                                                            ))}
                                                            <button
                                                                onClick={() => handleOpenDuplicateModal(dateStr, new Date(o.day).getDay() === 0 ? 6 : new Date(o.day).getDay() - 1)}
                                                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Dupliquer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDatePickerValue(dateStr);
                                                                    setDatePickerIntervals(o.workingTimes);
                                                                    setShowDatePickerModal(true);
                                                                }}
                                                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteOverride(o.id!)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDuplicateModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Dupliquer les horaires</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Depuis {formatDisplayDate(duplicateSourceDay)} — {duplicateSourceIntervals.map(i => `${i.start} - ${i.end}`).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDuplicateModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Day selection */}
                        <p className="text-sm font-medium text-gray-700 mb-3">Sélectionnez les jours cibles :</p>

                        {duplicatableDays.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-6">
                                Aucun autre jour disponible cette semaine
                            </p>
                        ) : (
                            <div className="space-y-2 mb-6">
                                {duplicatableDays.map(d => (
                                    <label
                                        key={d.date}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                            selectedDuplicateDays.includes(d.date)
                                                ? 'border-indigo-400 bg-indigo-50'
                                                : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={selectedDuplicateDays.includes(d.date)}
                                                onChange={() => toggleDuplicateDay(d.date)}
                                            />
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                                selectedDuplicateDays.includes(d.date)
                                                    ? 'bg-indigo-600 border-indigo-600'
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedDuplicateDays.includes(d.date) && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${selectedDuplicateDays.includes(d.date) ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                {d.label}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">{formatDisplayDate(d.date)}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Extra custom dates */}
                        <hr className="my-4 border-gray-200" />
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">Autres dates :</p>
                                <button
                                    type="button"
                                    onClick={() => setExtraDuplicateDates(prev => [...prev, ''])}
                                    className="inline-flex items-center px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Ajouter une date
                                </button>
                            </div>
                            {extraDuplicateDates.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Aucune date supplémentaire</p>
                            ) : (
                                <div className="space-y-2">
                                    {extraDuplicateDates.map((date, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={date}
                                                min={new Date(todayNormalized.getTime() + 86400000).toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    const updated = [...extraDuplicateDates];
                                                    updated[idx] = e.target.value;
                                                    setExtraDuplicateDates(updated);
                                                }}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setExtraDuplicateDates(extraDuplicateDates.filter((_, i) => i !== idx))}
                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDuplicateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmitDuplicate}
                                disabled={loadingDuplicate || (selectedDuplicateDays.length === 0 && extraDuplicateDates.filter(d => d).length === 0)}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {loadingDuplicate ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Duplication...
                                    </span>
                                ) : (
                                    `Dupliquer${(selectedDuplicateDays.length + extraDuplicateDates.filter(d => d).length) > 0 ? ` sur ${selectedDuplicateDays.length + extraDuplicateDates.filter(d => d).length} jour${(selectedDuplicateDays.length + extraDuplicateDates.filter(d => d).length) > 1 ? 's' : ''}` : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Picker Modal */}
            {showDatePickerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDatePickerModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Exception pour une date</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Définissez des horaires pour un jour précis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDatePickerModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Date input */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={datePickerValue}
                                min={new Date(todayNormalized.getTime() + 86400000).toISOString().split('T')[0]}
                                onChange={(e) => setDatePickerValue(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Intervals */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Horaires</label>
                            <div className="space-y-2">
                                {datePickerIntervals.map((interval, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <input
                                                type="time"
                                                value={interval.start}
                                                onChange={(e) => {
                                                    const updated = [...datePickerIntervals];
                                                    updated[index].start = e.target.value;
                                                    setDatePickerIntervals(updated);
                                                }}
                                                onBlur={() => setDatePickerIntervals(prev => [...prev].sort((a, b) => a.start.localeCompare(b.start)))}
                                                className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                            />
                                            <span className="text-gray-400">→</span>
                                            <input
                                                type="time"
                                                value={interval.end}
                                                onChange={(e) => {
                                                    const updated = [...datePickerIntervals];
                                                    updated[index].end = e.target.value;
                                                    setDatePickerIntervals(updated);
                                                }}
                                                onBlur={() => setDatePickerIntervals(prev => [...prev].sort((a, b) => a.start.localeCompare(b.start)))}
                                                className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                            />
                                        </div>
                                        {datePickerIntervals.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setDatePickerIntervals(datePickerIntervals.filter((_, i) => i !== index))}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const last = datePickerIntervals[datePickerIntervals.length - 1];
                                    const newStart = last?.end ? last.end.substring(0, 5) : '09:00';
                                    setDatePickerIntervals([...datePickerIntervals, { start: newStart, end: '17:00' }]);
                                }}
                                className="mt-2 inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Ajouter un intervalle
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDatePickerModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveDatePickerOverride}
                                disabled={loadingDatePicker || !datePickerValue}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {loadingDatePicker ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enregistrement...
                                    </span>
                                ) : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AvailabilityOverrideSection;