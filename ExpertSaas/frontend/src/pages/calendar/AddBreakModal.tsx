import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService.tsx';
import type { BreakFormData } from '../../models/Calendar.tsx';

interface AddBreakModalProps {
    onClose: () => void;
    onSuccess: () => void;
    existingBreak?: BreakFormData | null;
}

const AddBreakModal: React.FC<AddBreakModalProps> = ({ onClose, onSuccess, existingBreak }) => {
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<BreakFormData>>({});

    const [formData, setFormData] = useState<BreakFormData>({
        startAt: existingBreak?.startAt || '12:00',
        endAt: existingBreak?.endAt || '13:00'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name as keyof BreakFormData]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<BreakFormData> = {};

        if (!formData.startAt) {
            errors.startAt = 'L\'heure de début est requise';
        }

        if (!formData.endAt) {
            errors.endAt = 'L\'heure de fin est requise';
        }

        if (formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
            errors.endAt = 'L\'heure de fin doit être postérieure à l\'heure de début';
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
            if (existingBreak) {
                await calendarService.updateBreak(formData);
                alert('Pause café modifiée avec succès');
            } else {
                await calendarService.addBreak(formData);
                alert('Pause café ajoutée avec succès');
            }
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pause café ?')) {
            setLoading(true);
            try {
                await calendarService.deleteBreak();
                alert('Pause café supprimée avec succès');
                onSuccess();
            } catch (error: any) {
                alert(error.response?.data?.message || 'Une erreur est survenue');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {existingBreak ? 'Modifier la pause café' : 'Ajouter une pause café'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-amber-800">
                                            Configurez votre pause café quotidienne
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de début *
                                        </label>
                                        <input
                                            type="time"
                                            name="startAt"
                                            value={formData.startAt}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.startAt ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.startAt && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.startAt}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de fin *
                                        </label>
                                        <input
                                            type="time"
                                            name="endAt"
                                            value={formData.endAt}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.endAt ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.endAt && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.endAt}</p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Ces horaires seront exclus de vos disponibilités chaque jour
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                            {existingBreak && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    Supprimer
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : existingBreak ? 'Modifier' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBreakModal;