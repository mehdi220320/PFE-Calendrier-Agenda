import React, { useState, useEffect } from 'react';
import { reclamationService } from '../../../services/reclamationServic.tsx';

const AdminStatistics: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await reclamationService.getStatistics();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="animate-pulse">Chargement des statistiques...</div>
            </div>
        );
    }

    if (!stats) return null;

    // Calculate percentages for charts
    const total = stats.total || 1;
    const pendingPercent = (stats.pending / total) * 100;
    const inProgressPercent = (stats.inProgress / total) * 100;
    const resolvedPercent = (stats.resolved / total) * 100;
    const closedPercent = (stats.closed / total) * 100;

    const statusData = [
        { label: 'En attente', value: stats.pending, color: 'bg-yellow-500', percent: pendingPercent },
        { label: 'En cours', value: stats.inProgress, color: 'bg-blue-500', percent: inProgressPercent },
        { label: 'Résolu', value: stats.resolved, color: 'bg-green-500', percent: resolvedPercent },
        { label: 'Fermé', value: stats.closed, color: 'bg-gray-500', percent: closedPercent }
    ];

    const priorityData = [
        { label: 'Basse', value: stats.byPriority.low, color: 'bg-green-500' },
        { label: 'Moyenne', value: stats.byPriority.medium, color: 'bg-yellow-500' },
        { label: 'Haute', value: stats.byPriority.high, color: 'bg-orange-500' },
        { label: 'Urgente', value: stats.byPriority.urgent, color: 'bg-red-500' }
    ];

    const categoryData = [
        { label: 'Technique', value: stats.byCategory.technical, color: 'bg-purple-500' },
        { label: 'Facturation', value: stats.byCategory.billing, color: 'bg-indigo-500' },
        { label: 'Service', value: stats.byCategory.service, color: 'bg-pink-500' },
        { label: 'Autre', value: stats.byCategory.other, color: 'bg-gray-500' }
    ];

    const maxPriorityValue = Math.max(...priorityData.map(d => d.value));
    const maxCategoryValue = Math.max(...categoryData.map(d => d.value));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">📊 Tableau de bord des statistiques</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm opacity-90">Total</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <div className="text-sm opacity-90">En attente</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.inProgress}</div>
                    <div className="text-sm opacity-90">En cours</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.resolved}</div>
                    <div className="text-sm opacity-90">Résolus</div>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.closed}</div>
                    <div className="text-sm opacity-90">Fermés</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Chart */}
                <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Distribution par statut</h4>
                    <div className="space-y-3">
                        {statusData.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.label}</span>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Donut Chart Alternative */}
                    <div className="mt-6 flex justify-center">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                {statusData.reduce((acc, item, index) => {
                                    const startAngle = acc.angle;
                                    const angle = (item.value / total) * 360;
                                    const endAngle = startAngle + angle;
                                    const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                                    const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                                    const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                                    const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                                    const largeArc = angle > 180 ? 1 : 0;

                                    acc.elements.push(
                                        <path
                                            key={item.label}
                                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                            fill={item.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
                                                item.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                                                    item.color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' :
                                                        '#6b7280'}
                                            className="transition-all duration-500"
                                        />
                                    );
                                    acc.angle = endAngle;
                                    return acc;
                                }, { elements: [] as JSX.Element[], angle: 0 }).elements}
                                <circle cx="50" cy="50" r="25" fill="white" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-xl font-bold">{total}</div>
                                    <div className="text-xs text-slate-500">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Distribution Chart */}
                <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Distribution par priorité</h4>
                    <div className="space-y-4">
                        {priorityData.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.label}</span>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
                                    <div
                                        className={`${item.color} h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-semibold transition-all duration-500`}
                                        style={{ width: `${(item.value / maxPriorityValue) * 100}%` }}
                                    >
                                        {item.value > 0 && item.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Distribution par catégorie</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {categoryData.map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="relative inline-block">
                                    <div className={`${item.color} rounded-full w-20 h-20 mx-auto flex items-center justify-center text-white text-2xl font-bold`}>
                                        {item.value}
                                    </div>
                                </div>
                                <div className="mt-2 text-sm font-medium text-slate-700">{item.label}</div>
                                <div className="text-xs text-slate-500">{((item.value / total) * 100).toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        {categoryData.map((item) => (
                            <div key={item.label} className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{item.label}</span>
                                    <span>{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${(item.value / maxCategoryValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Aperçu rapide</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                            <span className="text-sm text-green-700">✅ Taux de résolution</span>
                            <span className="font-bold text-green-700">
                                {((stats.resolved / total) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                            <span className="text-sm text-yellow-700">⏳ En attente</span>
                            <span className="font-bold text-yellow-700">
                                {((stats.pending / total) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                            <span className="text-sm text-red-700">🚨 Urgentes</span>
                            <span className="font-bold text-red-700">{stats.byPriority.urgent}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                            <span className="text-sm text-purple-700">🔧 Techniques</span>
                            <span className="font-bold text-purple-700">{stats.byCategory.technical}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStatistics;