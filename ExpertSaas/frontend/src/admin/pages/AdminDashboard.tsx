import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header.tsx";
import { dashboardService } from '../../services/adminDashboard.tsx';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: { total: 0, byRole: {}, thisMonth: 0, lastMonth: 0, taux: 0 },
        reclamations: { total: 0, thisMonth: 0, lastMonth: 0, taux: 0 },
        meetings: { total: 0, thisMonth: 0, lastMonth: 0, taux: 0 }
    });
    const [expertActivations, setExpertActivations] = useState([]);
    const [reclamationStats, setReclamationStats] = useState(null);
    const [dateRange, setDateRange] = useState(dashboardService.getLast30DaysRange());
    const [selectedInterval, setSelectedInterval] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [loadingReclamations, setLoadingReclamations] = useState(false);
    const [error, setError] = useState(null);
    const [isCustomRange, setIsCustomRange] = useState(false);

    // Use ref to track if initial load is done
    const initialLoadDone = useRef(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Only fetch reclamation stats on initial load or when explicitly applied
    useEffect(() => {
        if (initialLoadDone.current) {
            // Don't auto-fetch, wait for apply button
            return;
        }
        if (!loading && !initialLoadDone.current) {
            fetchReclamationStats();
            initialLoadDone.current = true;
        }
    }, [loading]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, activationData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getExpertActivation()
            ]);
            setStats(statsData);
            setExpertActivations(activationData);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Impossible de charger les données du tableau de bord');
        } finally {
            setLoading(false);
        }
    };

    const fetchReclamationStats = async () => {
        try {
            setLoadingReclamations(true);
            const data = await dashboardService.getReclamationStatsByDateRange(dateRange.from, dateRange.to);
            if (data && data.success) {
                setReclamationStats(data);
            }
        } catch (err) {
            console.error('Error fetching reclamation stats:', err);
            setReclamationStats(null);
        } finally {
            setLoadingReclamations(false);
        }
    };

    const handleIntervalChange = (interval) => {
        setSelectedInterval(interval);
        if (interval !== 'custom') {
            const range = dashboardService.getDateRangeFromInterval(interval);
            setDateRange(range);
            setIsCustomRange(false);
            // Don't fetch automatically, wait for apply button
        } else {
            setIsCustomRange(true);
        }
    };

    const handleDateRangeChange = (e) => {
        setDateRange({
            ...dateRange,
            [e.target.name]: e.target.value
        });
    };

    const applyDateRangeFilter = () => {
        fetchReclamationStats();
    };

    const getTrendInfo = (taux) => {
        if (taux > 0) return { icon: '↑', color: 'text-green-600', bg: 'bg-green-100', text: `+${taux.toFixed(1)}%` };
        if (taux < 0) return { icon: '↓', color: 'text-red-600', bg: 'bg-red-100', text: `${taux.toFixed(1)}%` };
        return { icon: '→', color: 'text-gray-600', bg: 'bg-gray-100', text: '0%' };
    };

    // Prepare activity data for line chart
    const getActivityData = () => {
        const daysOrder = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
        const activityMap = {};
        expertActivations.forEach(item => {
            activityMap[item.day] = item.count;
        });
        return daysOrder.map(day => ({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            connexions: activityMap[day] || 0
        }));
    };

    // Prepare status distribution data
    const getStatusData = () => {
        if (!reclamationStats?.distribution?.byStatus) return [];
        const status = reclamationStats.distribution.byStatus;
        return [
            { name: 'En attente', value: status.pending || 0, color: '#F59E0B' },
            { name: 'En cours', value: status.in_progress || 0, color: '#3B82F6' },
            { name: 'Résolues', value: status.resolved || 0, color: '#10B981' },
            { name: 'Fermées', value: status.closed || 0, color: '#6B7280' }
        ].filter(item => item.value > 0);
    };

    // Prepare priority distribution data
    const getPriorityData = () => {
        if (!reclamationStats?.distribution?.byPriority) return [];
        const priority = reclamationStats.distribution.byPriority;
        return [
            { name: 'Basse', value: priority.low || 0, color: '#10B981' },
            { name: 'Moyenne', value: priority.medium || 0, color: '#F59E0B' },
            { name: 'Haute', value: priority.high || 0, color: '#EF4444' },
            { name: 'Urgente', value: priority.urgent || 0, color: '#8B5CF6' }
        ].filter(item => item.value > 0);
    };

    // Prepare category distribution data
    const getCategoryData = () => {
        if (!reclamationStats?.distribution?.byCategory) return [];
        const category = reclamationStats.distribution.byCategory;
        return [
            { name: 'Technique', value: category.technical || 0, color: '#3B82F6' },
            { name: 'Facturation', value: category.billing || 0, color: '#10B981' },
            { name: 'Service', value: category.service || 0, color: '#F59E0B' },
            { name: 'Autre', value: category.other || 0, color: '#6B7280' }
        ].filter(item => item.value > 0);
    };

    const totalUsersByRole = stats.users.byRole;
    const totalUsers = stats.users.total;
    const userCount = totalUsersByRole.user || 0;
    const expertCount = totalUsersByRole.expert || 0;
    const adminCount = totalUsers - userCount - expertCount;
    const userPercentage = totalUsers ? (userCount / totalUsers) * 100 : 0;
    const expertPercentage = totalUsers ? (expertCount / totalUsers) * 100 : 0;
    const adminPercentage = totalUsers ? (adminCount / totalUsers) * 100 : 0;

    const userDistributionData = [
        { name: 'Utilisateurs', value: userCount, percentage: userPercentage, color: '#3B82F6' },
        { name: 'Experts', value: expertCount, percentage: expertPercentage, color: '#10B981' },
        { name: 'Administrateurs', value: adminCount, percentage: adminPercentage, color: '#8B5CF6' }
    ].filter(item => item.value > 0);

    // Loading Skeleton Component for Charts
    const ChartSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-400">Chargement...</div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="text-red-600 text-xl mb-4">⚠️</div>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activityData = getActivityData();
    const statusData = getStatusData();
    const priorityData = getPriorityData();
    const categoryData = getCategoryData();

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-600 mt-2">Bienvenue sur votre tableau de bord administrateur</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getTrendInfo(stats.users.taux).bg} ${getTrendInfo(stats.users.taux).color}`}>
                                        {getTrendInfo(stats.users.taux).text}
                                    </span>
                                    <span className="text-xs text-gray-500">vs mois dernier</span>
                                </div>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Experts</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{expertCount}</p>
                                <p className="text-xs text-green-600 mt-2">{stats.users.thisMonth} nouveaux ce mois</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Événements</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.meetings.total}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getTrendInfo(stats.meetings.taux).bg} ${getTrendInfo(stats.meetings.taux).color}`}>
                                        {getTrendInfo(stats.meetings.taux).text}
                                    </span>
                                    <span className="text-xs text-gray-500">vs mois dernier</span>
                                </div>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Réclamations</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.reclamations.total}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getTrendInfo(stats.reclamations.taux).bg} ${getTrendInfo(stats.reclamations.taux).color}`}>
                                        {getTrendInfo(stats.reclamations.taux).text}
                                    </span>
                                    <span className="text-xs text-gray-500">vs mois dernier</span>
                                </div>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* First Row Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Expert Activity Line Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité hebdomadaire des experts</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="connexions" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des utilisateurs</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reclamation Date Range Filter */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse des réclamations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalle</label>
                            <select
                                value={selectedInterval}
                                onChange={(e) => handleIntervalChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="7days">7 derniers jours</option>
                                <option value="30days">30 derniers jours</option>
                                <option value="90days">90 derniers jours</option>
                                <option value="thisMonth">Ce mois-ci</option>
                                <option value="lastMonth">Mois dernier</option>
                                <option value="custom">Personnalisé</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                            <input
                                type="date"
                                name="from"
                                value={dateRange.from}
                                onChange={handleDateRangeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                            <input
                                type="date"
                                name="to"
                                value={dateRange.to}
                                onChange={handleDateRangeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyDateRangeFilter}
                                disabled={loadingReclamations}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingReclamations ? 'Chargement...' : 'Appliquer'}
                            </button>
                            <button
                                onClick={() => navigate('/admin/reclamations')}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Voir tout
                            </button>
                        </div>
                    </div>

                    {/* Loading state for summary cards */}
                    {loadingReclamations ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        reclamationStats?.summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{reclamationStats.summary.total}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Taux de réponse</p>
                                    <p className="text-2xl font-bold text-green-600">{reclamationStats.summary.responseRate}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Temps moyen de réponse</p>
                                    <p className="text-2xl font-bold text-blue-600">{reclamationStats.summary.avgResponseTimeHours}h</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Taux de résolution</p>
                                    <p className="text-2xl font-bold text-purple-600">{reclamationStats.summary.resolutionRate}</p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Second Row Charts with Loading States */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut des réclamations</h2>
                        {loadingReclamations ? (
                            <ChartSkeleton />
                        ) : statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Priorités</h2>
                        {loadingReclamations ? (
                            <ChartSkeleton />
                        ) : priorityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={priorityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h2>
                        {loadingReclamations ? (
                            <ChartSkeleton />
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Reclamations Table with Loading State */}
                {loadingReclamations ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    reclamationStats?.reclamations && reclamationStats.reclamations.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Réclamations récentes</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Période du {new Date(dateRange.from).toLocaleDateString('fr-FR')} au {new Date(dateRange.to).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {reclamationStats.reclamations.slice(0, 5).map((reclamation) => (
                                        <tr key={reclamation.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/reclamations/${reclamation.id}`)}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{reclamation.title}</td>
                                            <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        reclamation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            reclamation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                reclamation.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {reclamation.status === 'pending' ? 'En attente' :
                                                            reclamation.status === 'in_progress' ? 'En cours' :
                                                                reclamation.status === 'resolved' ? 'Résolue' : 'Fermée'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        reclamation.priority === 'low' ? 'bg-green-100 text-green-800' :
                                                            reclamation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                reclamation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-red-100 text-red-800'
                                                    }`}>
                                                        {reclamation.priority === 'low' ? 'Basse' :
                                                            reclamation.priority === 'medium' ? 'Moyenne' :
                                                                reclamation.priority === 'high' ? 'Haute' : 'Urgente'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {reclamation.category === 'technical' ? 'Technique' :
                                                    reclamation.category === 'billing' ? 'Facturation' :
                                                        reclamation.category === 'service' ? 'Service' : 'Autre'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(reclamation.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {reclamationStats.pagination && reclamationStats.pagination.totalPages > 1 && (
                                <div className="px-6 py-3 border-t border-gray-100">
                                    <button
                                        onClick={() => navigate('/admin/reclamations')}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Voir toutes les réclamations →
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;