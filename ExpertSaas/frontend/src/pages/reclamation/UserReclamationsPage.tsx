import React, { useState, useEffect } from 'react';
import { reclamationService, type Reclamation } from '../../services/reclamationServic.tsx';
import { statusColors, priorityColors } from '../../models/reclamation';
import Header from '../../Component/Header';
import CreateReclamationModal from './CreateReclamationModal';
import ReclamationDetailModal from './ReclamationDetailModal.tsx';

const UserReclamationsPage: React.FC = () => {
    const [reclamations, setReclamations] = useState<Reclamation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);

    useEffect(() => {
        fetchReclamations();
    }, []);

    const fetchReclamations = async () => {
        try {
            setLoading(true);
            const data = await reclamationService.getMyReclamations();
            setReclamations(data);
            setError(null);
        } catch (err: any) {
            setError('Erreur lors du chargement des réclamations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
            try {
                await reclamationService.deleteReclamation(id);
                await fetchReclamations();
            } catch (err) {
                setError('Erreur lors de la suppression');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        return `px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status as keyof typeof statusColors]}`;
    };

    const getPriorityBadge = (priority: string) => {
        return `px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[priority as keyof typeof priorityColors]}`;
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Chargement des réclamations...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Mes Réclamations</h1>
                                <p className="text-slate-600 mt-1">Gérez vos demandes d'assistance</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                <span>+</span>
                                Nouvelle réclamation
                            </button>
                        </div>

                        {error && (
                            <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="divide-y divide-slate-200">
                            {reclamations.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📋</div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune réclamation</h3>
                                    <p className="text-slate-600">Vous n'avez pas encore créé de réclamation</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Créer une réclamation →
                                    </button>
                                </div>
                            ) : (
                                reclamations.map((rec) => (
                                    <div key={rec.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 cursor-pointer" onClick={() => setSelectedReclamation(rec)}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">{rec.title}</h3>
                                                    <span className={getStatusBadge(rec.status)}>
                                                        {rec.status === 'pending' ? 'En attente' :
                                                            rec.status === 'in_progress' ? 'En cours' :
                                                                rec.status === 'resolved' ? 'Résolu' : 'Fermé'}
                                                    </span>
                                                    <span className={getPriorityBadge(rec.priority)}>
                                                        {rec.priority === 'low' ? 'Basse' :
                                                            rec.priority === 'medium' ? 'Moyenne' :
                                                                rec.priority === 'high' ? 'Haute' : 'Urgente'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 mb-2 line-clamp-2">{rec.description}</p>
                                                <p className="text-sm text-slate-400">
                                                    Créée le {new Date(rec.date).toLocaleDateString('fr-FR')}
                                                </p>
                                                {rec.adminResponse && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                                        <span>✓</span>
                                                        <span>Réponse reçue</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedReclamation(rec)}
                                                    className="text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Voir
                                                </button>
                                                {rec.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDelete(rec.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateReclamationModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchReclamations();
                    }}
                />
            )}

            {selectedReclamation && (
                <ReclamationDetailModal
                    reclamation={selectedReclamation}
                    onClose={() => setSelectedReclamation(null)}
                    onUpdate={fetchReclamations}
                />
            )}
        </>
    );
};

export default UserReclamationsPage;