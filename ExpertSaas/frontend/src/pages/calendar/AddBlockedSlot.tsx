import React, { useState } from 'react';
import { calendarService } from '../../services/calendarService';
import type {BlockedSlotFormData} from '../../models/Calendar.ts';

interface AddBlockedSlotProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddBlockedSlot: React.FC<AddBlockedSlotProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<BlockedSlotFormData>>({});

    const [formData, setFormData] = useState<BlockedSlotFormData>({
        startDayDate: new Date().toISOString().split('T')[0],
        endDayDate: new Date().toISOString().split('T')[0],
        startDateTime: '09:00',
        endDateTime: '17:00',
        reason: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur du champ
        if (formErrors[name as keyof BlockedSlotFormData]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<BlockedSlotFormData> = {};

        if (!formData.startDayDate) {
            errors.startDayDate = 'La date de début est requise';
        }

        if (!formData.endDayDate) {
            errors.endDayDate = 'La date de fin est requise';
        }

        if (formData.startDayDate && formData.endDayDate && formData.startDayDate > formData.endDayDate) {
            errors.endDayDate = 'La date de fin doit être postérieure à la date de début';
        }

        if (!formData.startDateTime) {
            errors.startDateTime = 'L\'heure de début est requise';
        }

        if (!formData.endDateTime) {
            errors.endDateTime = 'L\'heure de fin est requise';
        }

        if (formData.startDateTime && formData.endDateTime && formData.startDateTime >= formData.endDateTime) {
            errors.endDateTime = 'L\'heure de fin doit être postérieure à l\'heure de début';
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
            await calendarService.addBlockedSlot(formData);
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Ajouter un créneau bloqué
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de début *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDayDate"
                                            value={formData.startDayDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.startDayDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.startDayDate && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.startDayDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de fin *
                                        </label>
                                        <input
                                            type="date"
                                            name="endDayDate"
                                            value={formData.endDayDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.endDayDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.endDayDate && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.endDayDate}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de début *
                                        </label>
                                        <input
                                            type="time"
                                            name="startDateTime"
                                            value={formData.startDateTime}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.startDateTime ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.startDateTime && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.startDateTime}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de fin *
                                        </label>
                                        <input
                                            type="time"
                                            name="endDateTime"
                                            value={formData.endDateTime}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.endDateTime ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.endDateTime && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.endDateTime}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Raison (optionnelle)
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ex: Congés, Formation, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBlockedSlot;