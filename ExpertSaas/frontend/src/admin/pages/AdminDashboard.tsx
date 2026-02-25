import Header from "../components/Header.tsx";

function AdminDashboard() {
    // Static data for the dashboard
    const stats = {
        totalUsers: 1250,
        totalExperts: 45,
        totalEvents: 328,
        totalReclamations: 89,
        activeSessions: 156
    };

    // Recent users data
    const recentUsers = [
        { id: 1, name: "Marie Lambert", email: "marie.l@example.com", role: "expert", joined: "2026-02-24" },
        { id: 2, name: "Thomas Martin", email: "thomas.m@example.com", role: "user", joined: "2026-02-23" },
        { id: 3, name: "Sophie Bernard", email: "sophie.b@example.com", role: "user", joined: "2026-02-22" },
        { id: 4, name: "Lucas Petit", email: "lucas.p@example.com", role: "expert", joined: "2026-02-21" },
        { id: 5, name: "Emma Dubois", email: "emma.d@example.com", role: "user", joined: "2026-02-20" },
    ];

    // Upcoming events
    const upcomingEvents = [
        { id: 1, title: "Réunion d'équipe", date: "2026-02-25", time: "10:00", participants: 8 },
        { id: 2, title: "Formation des experts", date: "2026-02-26", time: "14:30", participants: 15 },
        { id: 3, title: "Webinaire clients", date: "2026-02-27", time: "11:00", participants: 45 },
        { id: 4, title: "Atelier technique", date: "2026-02-28", time: "09:30", participants: 12 },
    ];

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
                    {/* Total Users Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                                <p className="text-xs text-green-600 mt-2">+12% ce mois</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Experts Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Experts</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalExperts}</p>
                                <p className="text-xs text-green-600 mt-2">+3 nouveaux</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Events Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Événements</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                                <p className="text-xs text-blue-600 mt-2">+8 cette semaine</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Reclamations Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Réclamations</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReclamations}</p>
                                <p className="text-xs text-yellow-600 mt-2">12 en attente</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Activity Chart (Static Bars) */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité hebdomadaire</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Lun</span>
                                    <span>45 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Mar</span>
                                    <span>62 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Mer</span>
                                    <span>78 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Jeu</span>
                                    <span>83 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Ven</span>
                                    <span>71 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '71%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Sam</span>
                                    <span>34 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Dim</span>
                                    <span>28 connexions</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Chart (Static Pie Alternative) */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des utilisateurs</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Utilisateurs</span>
                                    <span>980 (78%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Experts</span>
                                    <span>225 (18%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Administrateurs</span>
                                    <span>45 (4%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '4%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Simple donut chart alternative */}
                        <div className="mt-8 flex justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="10"
                                            strokeDasharray="251.2" strokeDashoffset="55.2" strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="10"
                                            strokeDasharray="251.2" strokeDashoffset="196.2" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Users and Upcoming Events */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Utilisateurs récents</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-indigo-600">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        user.role === 'expert'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {user.role === 'expert' ? 'Expert' : 'Utilisateur'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 border-t border-gray-100">
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Voir tous les utilisateurs →
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Événements à venir</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
                                            <span className="text-xs font-medium text-indigo-600">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {event.time} • {event.participants} participants
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs text-indigo-600 hover:text-indigo-700">
                                        Détails
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 border-t border-gray-100">
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Voir tous les événements →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Nouvel utilisateur</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Planifier un événement</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Générer un rapport</span>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;