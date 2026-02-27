import React, { useState } from 'react';

interface NewUser {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    role: 'admin' | 'expert';
    isActive: boolean;
}

interface AddUserProps {
    show: boolean;
    onClose: () => void;
    onUserCreated: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const AddUser: React.FC<AddUserProps> = ({
                                             show,
                                             onClose,
                                             onUserCreated,
                                             loading,
                                             setLoading,
                                             setError
                                         }) => {
    const [formData, setFormData] = useState<NewUser>({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        role: 'expert',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewUser, string>>>({});
    const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);

    const validateForm = (): boolean => {
        const errors: Partial<Record<keyof NewUser, string>> = {};

        if (!formData.firstname.trim()) {
            errors.firstname = 'Le prénom est requis';
        }

        if (!formData.lastname.trim()) {
            errors.lastname = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email invalide';
        }

        if (formData.phone && !/^[0-9+\-\s]+$/.test(formData.phone)) {
            errors.phone = 'Numéro de téléphone invalide';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            role: 'expert',
            isActive: true
        });
        setFormErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        if (formErrors[name as keyof NewUser]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (formData.role === 'admin') {
            setShowAdminConfirmModal(true);
        } else {
            await createUser();
        }
    };

    const createUser = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/adduser`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            onUserCreated();
            setShowAdminConfirmModal(false);
            resetForm();
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Create User Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Créer un nouvel utilisateur
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            onClose();
                                        }}
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
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                name="firstname"
                                                value={formData.firstname}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    formErrors.firstname ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {formErrors.firstname && (
                                                <p className="mt-1 text-xs text-red-500">{formErrors.firstname}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                name="lastname"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    formErrors.lastname ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {formErrors.lastname && (
                                                <p className="mt-1 text-xs text-red-500">{formErrors.lastname}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.email && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.phone && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rôle *
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="expert">Expert</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Compte actif
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        onClose();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Admin Confirmation Modal */}
            {showAdminConfirmModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Confirmation création admin
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Êtes-vous sûr de vouloir créer un compte administrateur ?
                                            Les administrateurs ont tous les droits sur la plateforme.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminConfirmModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={createUser}
                                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddUser;