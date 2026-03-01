import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService';
import type { WorkingHoursFormData, BlockedSlot, Break } from '../../models/Calendar';
import AddBlockedSlot from './AddBlockedSlot';
import AddBreakModal from './AddBreakModal';
import Header from "../../Component/Header";

const WorkingHoursPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [workingHoursExists, setWorkingHoursExists] = useState(false);
    const [workingHours, setWorkingHours] = useState<WorkingHoursFormData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showBlockedSlotModal, setShowBlockedSlotModal] = useState(false);
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showBlockedSlots, setShowBlockedSlots] = useState(false);
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [breakData, setBreakData] = useState<Break | null>(null);
    const [loadingBlockedSlots, setLoadingBlockedSlots] = useState(false);
    const [loadingBreak, setLoadingBreak] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<WorkingHoursFormData>>({});

    const [formData, setFormData] = useState<WorkingHoursFormData>({
        dayOfWeek: [1],
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30
    });

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
        checkWorkingHours();
    }, []);

    useEffect(() => {
        if (workingHoursExists) {
            fetchBreak();
            if (showBlockedSlots) {
                fetchBlockedSlots();
            }
        }
    }, [workingHoursExists, showBlockedSlots]);

    const checkWorkingHours = async () => {
        try {
            const response = await calendarService.checkWorkingHoursExists();
            setWorkingHoursExists(response.result);

            if (response.result) {
                const data = await calendarService.getWorkingHours();
                setWorkingHours(data);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des heures de travail:', error);
        }
    };

    const fetchBreak = async () => {
        setLoadingBreak(true);
        try {
            const data = await calendarService.getBreak();
            setBreakData(data);
        } catch (error) {
            console.error('Erreur lors du chargement de la pause:', error);
        } finally {
            setLoadingBreak(false);
        }
    };

    const fetchBlockedSlots = async () => {
        setLoadingBlockedSlots(true);
        try {
            const slots = await calendarService.getAllBlockedSlots();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingSlots = slots.filter(slot => {
                const slotDate = new Date(slot.startDayDate);
                return slotDate >= today;
            });

            upcomingSlots.sort((a, b) =>
                new Date(a.startDayDate).getTime() - new Date(b.startDayDate).getTime()
            );

            setBlockedSlots(upcomingSlots);
        } catch (error) {
            console.error('Erreur lors du chargement des créneaux bloqués:', error);
        } finally {
            setLoadingBlockedSlots(false);
        }
    };

    const handleDeleteBlockedSlot = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau bloqué ?')) {
            try {
                await calendarService.deleteBlockedSlot(id);
                fetchBlockedSlots();
                alert('Créneau bloqué supprimé avec succès');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    const handleDaySelection = (dayValue: number) => {
        setFormData(prev => {
            const currentDays = [...prev.dayOfWeek];
            const index = currentDays.indexOf(dayValue);

            if (index === -1) {
                currentDays.push(dayValue);
            } else {
                currentDays.splice(index, 1);
            }

            currentDays.sort((a, b) => a - b);

            return {
                ...prev,
                dayOfWeek: currentDays
            };
        });

        if (formErrors.dayOfWeek) {
            setFormErrors(prev => ({ ...prev, dayOfWeek: undefined }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'slotDuration' ? parseInt(value) : value
        }));

        if (formErrors[name as keyof WorkingHoursFormData]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<WorkingHoursFormData> = {};

        if (formData.dayOfWeek.length === 0) {
            errors.dayOfWeek = 'Sélectionnez au moins un jour';
        }

        if (!formData.startTime) {
            errors.startTime = 'L\'heure de début est requise';
        }

        if (!formData.endTime) {
            errors.endTime = 'L\'heure de fin est requise';
        }

        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            errors.endTime = 'L\'heure de fin doit être postérieure à l\'heure de début';
        }

        if (formData.slotDuration < 5) {
            errors.slotDuration = 'La durée minimale est de 5 minutes';
        }

        if (formData.slotDuration > 120) {
            errors.slotDuration = 'La durée maximale est de 120 minutes';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (workingHoursExists) {
                await calendarService.updateWorkingHours(formData);
                alert('Heures de travail mises à jour avec succès');
            } else {
                await calendarService.addWorkingHours(formData);
                alert('Heures de travail ajoutées avec succès');
            }

            setWorkingHoursExists(true);
            setShowForm(false);
            await checkWorkingHours();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (workingHours) {
            setFormData(workingHours);
        }
        setShowForm(true);
    };

    const getSelectedDaysLabel = (days: number[]): string => {
        if (!days || days.length === 0) return 'Aucun jour sélectionné';

        const selectedLabels = days
            .map(day => daysOfWeek.find(d => d.value === day)?.label)
            .filter(label => label !== undefined);

        if (selectedLabels.length === 1) return selectedLabels[0];

        return selectedLabels.join(', ');
    };

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                Gestion du calendrier
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Configurez vos disponibilités et gérez vos créneaux bloqués
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {/* Working hours status card */}
                        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-lg p-3 ${
                                        workingHoursExists ? 'bg-green-100' : 'bg-yellow-100'
                                    }`}>
                                        <svg className={`w-6 h-6 ${
                                            workingHoursExists ? 'text-green-600' : 'text-yellow-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Statut des heures</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">
                                                    {workingHoursExists ? 'Configurées' : 'Non configurées'}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Days configured card */}
                        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Jours configurés</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">
                                                    {workingHours ? workingHours.dayOfWeek.length : 0}/7
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Slot duration card */}
                        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Durée des créneaux</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">
                                                    {workingHours ? `${workingHours.slotDuration} min` : 'Non définie'}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Break status card */}
                        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-lg p-3 ${
                                        breakData ? 'bg-amber-100' : 'bg-gray-100'
                                    }`}>
                                        <svg className={`w-6 h-6 ${
                                            breakData ? 'text-amber-600' : 'text-gray-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pause café</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">
                                                    {breakData ? `${breakData.startAt} - ${breakData.endAt}` : 'Non configurée'}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Configuration Card */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Heures de travail
                                </h2>
                                {workingHoursExists && !showForm && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleEdit}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => setShowBlockedSlotModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Créneau bloqué
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {!workingHoursExists && !showForm ? (
                                <div className="text-center py-12">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-indigo-100 rounded-full p-4">
                                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 mb-4">
                                        Vous n'avez pas encore configuré vos heures de travail
                                    </p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Configurer mes heures de travail
                                    </button>
                                </div>
                            ) : showForm ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Form content - same as before */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Sélection des jours
                                        </h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jours de la semaine * (Sélection multiple)
                                            </label>
                                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-lg border ${
                                                formErrors.dayOfWeek ? 'border-red-500' : 'border-gray-200'
                                            }`}>
                                                {daysOfWeek.map(day => (
                                                    <label
                                                        key={day.value}
                                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                                            formData.dayOfWeek.includes(day.value)
                                                                ? 'bg-indigo-50 border-2 border-indigo-300 shadow-sm'
                                                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={formData.dayOfWeek.includes(day.value)}
                                                            onChange={() => handleDaySelection(day.value)}
                                                        />
                                                        <span className={`text-sm font-medium ${
                                                            formData.dayOfWeek.includes(day.value)
                                                                ? 'text-indigo-700'
                                                                : 'text-gray-700'
                                                        }`}>
                              {day.label}
                            </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formErrors.dayOfWeek ? (
                                                <p className="mt-2 text-xs text-red-500 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {formErrors.dayOfWeek}
                                                </p>
                                            ) : (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Sélectionnez un ou plusieurs jours de la semaine
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Horaires
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Heure de début *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        name="startTime"
                                                        value={formData.startTime}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                            formErrors.startTime ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {formErrors.startTime && (
                                                        <p className="mt-1 text-xs text-red-500">{formErrors.startTime}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Heure de fin *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        name="endTime"
                                                        value={formData.endTime}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                            formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {formErrors.endTime && (
                                                        <p className="mt-1 text-xs text-red-500">{formErrors.endTime}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Configuration des créneaux
                                        </h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Durée des créneaux (minutes) *
                                            </label>
                                            <div className="relative max-w-xs">
                                                <input
                                                    type="number"
                                                    name="slotDuration"
                                                    value={formData.slotDuration}
                                                    onChange={handleInputChange}
                                                    min="5"
                                                    max="120"
                                                    step="5"
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                        formErrors.slotDuration ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {formErrors.slotDuration && (
                                                    <p className="mt-1 text-xs text-red-500">{formErrors.slotDuration}</p>
                                                )}
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Durée de chaque créneau de rendez-vous (entre 5 et 120 minutes)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
                                        >
                                            {loading ? (
                                                <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </span>
                                            ) : (
                                                workingHoursExists ? 'Mettre à jour' : 'Enregistrer'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : workingHours && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Jours</p>
                                                    <p className="font-semibold text-gray-900">{getSelectedDaysLabel(workingHours.dayOfWeek)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Horaires</p>
                                                    <p className="font-semibold text-gray-900">{workingHours.startTime} - {workingHours.endTime}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Durée des créneaux</p>
                                                    <p className="font-semibold text-gray-900">{workingHours.slotDuration} minutes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Break Section */}
                    {workingHoursExists && (
                        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Pause café
                                    </h2>
                                    <button
                                        onClick={() => setShowBreakModal(true)}
                                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={breakData ? "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                                        </svg>
                                        {breakData ? 'Modifier' : 'Ajouter une pause'}
                                    </button>
                                </div>
                            </div>
                            {breakData && (
                                <div className="p-6">
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Pause quotidienne</p>
                                                    <p className="font-semibold text-gray-900">{breakData.startAt} - {breakData.endAt}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-amber-700">
                                                Ces horaires sont exclus de vos disponibilités
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Blocked Slots Section */}
                    {workingHoursExists && (
                        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
                            <div
                                className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
                                onClick={() => setShowBlockedSlots(!showBlockedSlots)}
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        Créneaux bloqués à venir
                                        {blockedSlots.length > 0 && (
                                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {blockedSlots.length}
                      </span>
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowBlockedSlotModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Nouveau
                                        </button>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                                                showBlockedSlots ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible content */}
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    showBlockedSlots ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="p-6">
                                    {loadingBlockedSlots ? (
                                        <div className="flex justify-center py-8">
                                            <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    ) : blockedSlots.length > 0 ? (
                                        <div className="space-y-3">
                                            {blockedSlots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(slot.startDayDate)}
                                </span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(slot.endDayDate)}
                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {slot.startDateTime} - {slot.endDateTime}
                                </span>
                                                                {slot.reason && (
                                                                    <>
                                                                        <span className="text-gray-300">•</span>
                                                                        <span className="text-xs text-gray-600">
                                      {slot.reason}
                                    </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => slot.id && handleDeleteBlockedSlot(slot.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun créneau bloqué</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Vous n'avez pas de créneaux bloqués à venir.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendar Preview Section */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Aperçu du calendrier
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    {workingHoursExists
                                        ? "Calendrier des disponibilités"
                                        : "Calendrier non configuré"}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                    {workingHoursExists
                                        ? "Visualisez ici vos disponibilités et gérez vos rendez-vous"
                                        : "Configurez vos heures de travail pour voir votre calendrier"}
                                </p>
                                {workingHoursExists && (
                                    <div className="mt-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => window.location.href = '/mydisponibility'}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Voir mes disponibilités
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Créneau bloqué */}
            {showBlockedSlotModal && (
                <AddBlockedSlot
                    onClose={() => setShowBlockedSlotModal(false)}
                    onSuccess={() => {
                        setShowBlockedSlotModal(false);
                        if (showBlockedSlots) {
                            fetchBlockedSlots();
                        }
                        alert('Créneau bloqué ajouté avec succès');
                    }}
                />
            )}

            {/* Modal Pause café */}
            {showBreakModal && (
                <AddBreakModal
                    onClose={() => setShowBreakModal(false)}
                    onSuccess={() => {
                        setShowBreakModal(false);
                        fetchBreak();
                    }}
                    existingBreak={breakData}
                />
            )}
        </>
    );
};

export default WorkingHoursPage;