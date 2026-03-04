import React, { useState } from 'react';
import { calendarService } from '../../services/calendarService.tsx';

interface AddBlockedSlotProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddBlockedSlot: React.FC<AddBlockedSlotProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDateTime: '',
        endDateTime: '',
        reason: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.startDateTime) {
            newErrors.startDateTime = 'La date et heure de début sont requises';
        }

        if (!formData.endDateTime) {
            newErrors.endDateTime = 'La date et heure de fin sont requises';
        }

        if (formData.startDateTime && formData.endDateTime) {
            const start = new Date(formData.startDateTime);
            const end = new Date(formData.endDateTime);

            if (start >= end) {
                newErrors.endDateTime = 'La date de fin doit être postérieure à la date de début';
            }

            // Check if start date is in the past
            if (start < new Date()) {
                newErrors.startDateTime = 'La date de début ne peut pas être dans le passé';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            console.error('Erreur lors de l\'ajout du créneau bloqué:', error);
            alert(error.response?.data?.message || 'Une erreur est survenue lors de l\'ajout du créneau bloqué');
        } finally {
            setLoading(false);
        }
    };

    // Get current date-time in local format for min attribute
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Ajouter un créneau bloqué
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Début *
                        </label>
                        <input
                            type="datetime-local"
                            name="startDateTime"
                            value={formData.startDateTime}
                            onChange={handleInputChange}
                            min={getCurrentDateTimeLocal()}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.startDateTime ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.startDateTime && (
                            <p className="mt-1 text-xs text-red-500">{errors.startDateTime}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fin *
                        </label>
                        <input
                            type="datetime-local"
                            name="endDateTime"
                            value={formData.endDateTime}
                            onChange={handleInputChange}
                            min={formData.startDateTime || getCurrentDateTimeLocal()}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.endDateTime ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.endDateTime && (
                            <p className="mt-1 text-xs text-red-500">{errors.endDateTime}</p>
                        )}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ex: Congés, Formation, etc."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Ajout en cours...
                                </span>
                            ) : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBlockedSlot;