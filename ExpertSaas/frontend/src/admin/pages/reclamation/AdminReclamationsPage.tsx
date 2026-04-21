import React, { useState, useEffect } from 'react';
import { reclamationService, type Reclamation } from '../../../services/reclamationServic.tsx';
import { statusColors, priorityColors } from '../../../models/reclamation';
import Header from '../../components/Header';
import AdminReclamationDetailModal from './AdminReclamationDetailModal';
import AdminStatistics from './AdminStatistics';

const AdminReclamationsPage: React.FC = () => {
    const [reclamations, setReclamations] = useState<Reclamation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        fetchReclamations();
    }, [filters]);

    const fetchReclamations = async () => {
        try {
            setLoading(true);
            const data = await reclamationService.getAllReclamations(filters);
            setReclamations(data);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des réclamations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
            try {
                await reclamationService.adminDeleteReclamation(id);
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Gestion des réclamations</h1>
                            <p className="text-slate-600 mt-1">Administration des demandes d'assistance</p>
                        </div>
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {showStats ? 'Masquer stats' : 'Voir statistiques'}
                        </button>
                    </div>

                    {/* Statistics */}
                    {showStats && <AdminStatistics />}

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="in_progress">En cours</option>
                                <option value="resolved">Résolu</option>
                                <option value="closed">Fermé</option>
                            </select>

                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Toutes les priorités</option>
                                <option value="low">Basse</option>
                                <option value="medium">Moyenne</option>
                                <option value="high">Haute</option>
                                <option value="urgent">Urgente</option>
                            </select>

                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Toutes les catégories</option>
                                <option value="technical">Technique</option>
                                <option value="billing">Facturation</option>
                                <option value="service">Service</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                    </div>

                    {/* Reclamations List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {error && (
                            <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Titre</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Utilisateur</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Priorité</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {reclamations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-500">
                                            Aucune réclamation trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    reclamations.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">{rec.title}</p>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{rec.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{rec.user}</td>
                                            <td className="px-6 py-4">
                                                    <span className={getStatusBadge(rec.status)}>
                                                        {rec.status === 'pending' ? 'En attente' :
                                                            rec.status === 'in_progress' ? 'En cours' :
                                                                rec.status === 'resolved' ? 'Résolu' : 'Fermé'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={getPriorityBadge(rec.priority)}>
                                                        {rec.priority === 'low' ? 'Basse' :
                                                            rec.priority === 'medium' ? 'Moyenne' :
                                                                rec.priority === 'high' ? 'Haute' : 'Urgente'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(rec.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedReclamation(rec)}
                                                        className="text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Voir
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rec.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedReclamation && (
                <AdminReclamationDetailModal
                    reclamation={selectedReclamation}
                    onClose={() => setSelectedReclamation(null)}
                    onUpdate={fetchReclamations}
                />
            )}
        </>
    );
};

export default AdminReclamationsPage;