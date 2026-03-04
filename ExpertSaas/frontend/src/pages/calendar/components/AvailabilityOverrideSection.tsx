import React from 'react';
import type {
    AvailabilityFormData,
    AvailabilityOverride,
    WorkingInterval
} from '../../models/Calendar.tsx';

interface AvailabilityOverrideSectionProps {
    overrides: AvailabilityOverride[];
    loadingOverrides: boolean;
    availability: AvailabilityFormData | null;
    showOverrideForm: boolean;
    selectedDay: string;
    overrideIntervals: WorkingInterval[];
    today: Date;
    weekDates: {
        date: string;
        dayOfWeek: number;
        label: string;
        fullDate: Date;
    }[];
    handleOpenOverrideForm: (day: string, dayOfWeek: number) => void;
    handleDeleteOverride: (id: string) => void;
    handleIntervalChange: (index: number, field: 'start' | 'end', value: string) => void;
    handleAddInterval: () => void;
    handleRemoveInterval: (index: number) => void;
    handleSaveOverride: () => void;
    setShowOverrideForm: (value: boolean) => void;
    setSelectedDay: (value: string) => void;
    setOverrideIntervals: (value: WorkingInterval[]) => void;
}

const AvailabilityOverrideSection: React.FC<AvailabilityOverrideSectionProps> = ({
                                                                                     overrides,
                                                                                     loadingOverrides,
                                                                                     availability,
                                                                                     showOverrideForm,
                                                                                     selectedDay,
                                                                                     overrideIntervals,
                                                                                     today,
                                                                                     weekDates,
                                                                                     handleOpenOverrideForm,
                                                                                     handleDeleteOverride,
                                                                                     handleIntervalChange,
                                                                                     handleAddInterval,
                                                                                     handleRemoveInterval,
                                                                                     handleSaveOverride,
                                                                                     setShowOverrideForm,
                                                                                     setSelectedDay,
                                                                                     setOverrideIntervals,
                                                                                 }) => {
    const formatDisplayDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
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
                    <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ajustez les horaires pour des jours spécifiques
                    </p>
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
                            const dayOverride = overrides.find(o =>
                                new Date(o.day).toISOString().split('T')[0] === day.date
                            );

                            const displayTime = dayOverride
                                ? dayOverride.workingTimes.map(interval =>
                                    `${interval.start} - ${interval.end}`
                                ).join(', ')
                                : availability?.dayOfWeek.includes(day.dayOfWeek)
                                    ? `${availability.startTime} - ${availability.endTime}`
                                    : '';

                            const overrideId = dayOverride?.id;
                            const dayDate = new Date(day.date);
                            const todayDate = new Date(today);
                            todayDate.setHours(0, 0, 0, 0);
                            const isPast = dayDate < todayDate;
                            const isToday = dayDate.getTime() === todayDate.getTime();

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
                                            <span className={`ml-2 text-sm ${
                                                isPast ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
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
                                                                className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                            <span className="text-gray-400">→</span>
                                                            <input
                                                                type="time"
                                                                value={interval.end}
                                                                onChange={(e) => handleIntervalChange(index, 'end', e.target.value)}
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
                                                    <span className={`text-sm italic flex items-center ${
                                                        isPast ? 'text-gray-400' : 'text-gray-400'
                                                    }`}>
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailabilityOverrideSection;