import React, { useState } from 'react';
import { reclamationService, type Reclamation } from '../../../services/reclamationServic.tsx';

interface AdminReclamationDetailModalProps {
    reclamation: Reclamation;
    onClose: () => void;
    onUpdate: () => void;
}

const AdminReclamationDetailModal: React.FC<AdminReclamationDetailModalProps> = ({
                                                                                     reclamation,
                                                                                     onClose,
                                                                                     onUpdate
                                                                                 }) => {
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [response, setResponse] = useState('');
    const [responsePicture, setResponsePicture] = useState<File | null>(null);
    const [newStatus, setNewStatus] = useState(reclamation.status);
    const [newPriority, setNewPriority] = useState(reclamation.priority);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSendResponse = async () => {
        if (!response.trim()) {
            setMessage({ type: 'error', text: 'Veuillez entrer une réponse' });
            return;
        }

        setLoading(true);
        try {
            await reclamationService.respondToReclamation(reclamation.id, response, responsePicture || undefined);
            setMessage({ type: 'success', text: 'Réponse envoyée avec succès' });
            setShowResponseForm(false);
            setResponse('');
            setResponsePicture(null);
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: "Erreur lors de l'envoi de la réponse" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (newStatus === reclamation.status) return;

        setLoading(true);
        try {
            await reclamationService.updateReclamationStatus(reclamation.id, newStatus);
            setMessage({ type: 'success', text: 'Statut mis à jour avec succès' });
            setTimeout(() => {
                onUpdate();
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du statut' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePriority = async () => {
        if (newPriority === reclamation.priority) return;

        setLoading(true);
        try {
            await reclamationService.updateReclamationPriority(reclamation.id, newPriority);
            setMessage({ type: 'success', text: 'Priorité mise à jour avec succès' });
            setTimeout(() => {
                onUpdate();
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de la priorité' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            pending: 'En attente',
            in_progress: 'En cours',
            resolved: 'Résolu',
            closed: 'Fermé'
        };
        return map[status] || status;
    };

    const getPriorityText = (priority: string) => {
        const map: Record<string, string> = {
            low: 'Basse',
            medium: 'Moyenne',
            high: 'Haute',
            urgent: 'Urgente'
        };
        return map[priority] || priority;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Détail de la réclamation</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg ${
                                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Reclamation Details */}
                        <div className="mb-6 bg-slate-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-slate-900">{reclamation.title}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                                        {getStatusText(reclamation.status)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                                        {getPriorityText(reclamation.priority)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-700 mb-4 whitespace-pre-wrap">{reclamation.description}</p>

                            {reclamation.picture && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Pièce jointe :</p>
                                    <img src={reclamation.picture} alt="Reclamation" className="max-w-full rounded-lg max-h-64 object-cover" />
                                </div>
                            )}

                            <p className="text-sm text-slate-400">
                                Créée le {new Date(reclamation.date).toLocaleString('fr-FR')}
                            </p>
                        </div>

                        {/* Admin Controls - Status and Priority */}
                        <div className="border-t border-slate-200 pt-6 mb-6">
                            <h4 className="font-semibold text-slate-900 mb-4">Gestion du ticket</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value as any)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="pending">📋 En attente</option>
                                            <option value="in_progress">⚙️ En cours</option>
                                            <option value="resolved">✅ Résolu</option>
                                            <option value="closed">🔒 Fermé</option>
                                        </select>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={loading || newStatus === reclamation.status}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? '...' : 'Mettre à jour'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Priorité</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newPriority}
                                            onChange={(e) => setNewPriority(e.target.value as any)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="low">🟢 Basse</option>
                                            <option value="medium">🟡 Moyenne</option>
                                            <option value="high">🟠 Haute</option>
                                            <option value="urgent">🔴 Urgente</option>
                                        </select>
                                        <button
                                            onClick={handleUpdatePriority}
                                            disabled={loading || newPriority === reclamation.priority}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? '...' : 'Mettre à jour'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Response Section - Separate Button */}
                        <div className="border-t border-slate-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-slate-900">Réponse administrateur</h4>
                                {!showResponseForm && !reclamation.adminResponse && (
                                    <button
                                        onClick={() => setShowResponseForm(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>✏️</span>
                                        Répondre
                                    </button>
                                )}
                                {!showResponseForm && reclamation.adminResponse && (
                                    <button
                                        onClick={() => setShowResponseForm(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>📝</span>
                                        Modifier la réponse
                                    </button>
                                )}
                            </div>

                            {/* Response Form - Only shown when button is clicked */}
                            {showResponseForm && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Votre réponse</label>
                                        <textarea
                                            rows={4}
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                            placeholder="Écrivez votre réponse ici..."
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Pièce jointe (optionnel)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setResponsePicture(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowResponseForm(false);
                                                setResponse('');
                                                setResponsePicture(null);
                                            }}
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSendResponse}
                                            disabled={loading || !response.trim()}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? 'Envoi...' : 'Envoyer la réponse'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Existing Response Display */}
                            {reclamation.adminResponse && !showResponseForm && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-green-600">✓</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-700 whitespace-pre-wrap mb-2">{reclamation.adminResponse}</p>
                                            {reclamation.adminResponsePicture && (
                                                <div className="mt-2">
                                                    <img src={reclamation.adminResponsePicture} alt="Response" className="max-w-full rounded-lg max-h-48 object-cover" />
                                                </div>
                                            )}
                                            <p className="text-sm text-slate-400 mt-2">
                                                Réponse envoyée le {new Date(reclamation.adminResponseDate!).toLocaleString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!reclamation.adminResponse && !showResponseForm && (
                                <div className="text-center py-8 bg-slate-50 rounded-lg">
                                    <p className="text-slate-500">Aucune réponse envoyée</p>
                                    <p className="text-sm text-slate-400 mt-1">Cliquez sur "Répondre" pour envoyer une réponse</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReclamationDetailModal;