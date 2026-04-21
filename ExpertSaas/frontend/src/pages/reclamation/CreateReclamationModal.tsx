import React, { useState } from 'react';
import { reclamationService } from '../../services/reclamationServic.tsx';

interface CreateReclamationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateReclamationModal: React.FC<CreateReclamationModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium'
    });
    const [picture, setPicture] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await reclamationService.createReclamation(formData, picture || undefined);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 backdrop-blur-sm bg-opacity-60" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Nouvelle réclamation</h2>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Résumé de votre problème"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Détaillez votre problème..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Catégorie
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="technical">Technique</option>
                                    <option value="billing">Facturation</option>
                                    <option value="service">Service</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Priorité
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Pièce jointe (optionnel)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPicture(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Envoi...' : 'Envoyer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReclamationModal;