import React from 'react';
import { type Reclamation, statusColors, priorityColors, categoryIcons } from '../../models/reclamation';

interface ReclamationDetailModalProps {
    reclamation: Reclamation;
    onClose: () => void;
    onUpdate: () => void;
}

const ReclamationDetailModal: React.FC<ReclamationDetailModalProps> = ({ reclamation, onClose, onUpdate }) => {
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
            <div className="fixed inset-0 backdrop-blur-sm bg-opacity-60" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Détail de la réclamation</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Reclamation Details */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{categoryIcons[reclamation.category as keyof typeof categoryIcons]}</span>
                                <h3 className="text-lg font-semibold text-slate-900">{reclamation.title}</h3>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[reclamation.status]}`}>
                                    {getStatusText(reclamation.status)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[reclamation.priority]}`}>
                                    {getPriorityText(reclamation.priority)}
                                </span>
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

                        {/* Admin Response */}
                        {reclamation.adminResponse && (
                            <div className="border-t border-slate-200 pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600">✓</span>
                                    </div>
                                    <h4 className="font-semibold text-slate-900">Réponse de l'administrateur</h4>
                                </div>

                                <p className="text-slate-700 mb-4 whitespace-pre-wrap">{reclamation.adminResponse}</p>

                                {reclamation.adminResponsePicture && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">Pièce jointe :</p>
                                        <img src={reclamation.adminResponsePicture} alt="Response" className="max-w-full rounded-lg max-h-64 object-cover" />
                                    </div>
                                )}

                                <p className="text-sm text-slate-400">
                                    Réponse le {new Date(reclamation.adminResponseDate!).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReclamationDetailModal;