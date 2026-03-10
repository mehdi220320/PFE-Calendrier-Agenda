import {
    Calendar, Briefcase, Users, UserCog, Scale, DollarSign, Bell, Star, Phone, Video, Building2, ChevronRight,
    ArrowRight, Clock, Plus, CalendarCheck, Sparkles, TrendingUp, Award, Shield, CheckCircle, MessageCircle
} from "lucide-react";
import Header from "../../component/Header.tsx";

function HomePage() {
    const expertCategories = [
        {
            id: "juridique",
            title: "Consultant Juridique",
            description: "Conseils en droit des affaires, contrats, propriété intellectuelle et litiges",
            icon: Scale,
            expertsCount: 24,
            color: "indigo",
            bgColor: "bg-indigo-100",
            textColor: "text-indigo-600",
            stats: "24 experts disponibles"
        },
        {
            id: "financier",
            title: "Consultant Financier",
            description: "Stratégies d'investissement, fiscalité, gestion de patrimoine et audit",
            icon: DollarSign,
            expertsCount: 18,
            color: "green",
            bgColor: "bg-green-100",
            textColor: "text-green-600",
            stats: "18 experts disponibles"
        },
        {
            id: "divers",
            title: "Consultant Divers",
            description: "Expertises variées : RH, marketing, stratégie, développement personnel",
            icon: UserCog,
            expertsCount: 32,
            color: "blue",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            stats: "32 experts disponibles"
        }
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: "Consultation juridique - Contrat société",
            date: "2024-03-15",
            time: "14:30",
            expert: "Me. Sophie Dupont",
            type: "juridique",
            status: "Confirmé"
        },
        {
            id: 2,
            title: "Audit financier trimestriel",
            date: "2024-03-18",
            time: "10:00",
            expert: "Mme. Claire Martin",
            type: "financier",
            status: "En attente"
        },
        {
            id: 3,
            title: "Stratégie de développement",
            date: "2024-03-20",
            time: "15:45",
            expert: "M. Thomas Bernard",
            type: "divers",
            status: "Confirmé"
        }
    ];

    const recentExperts = [
        { id: 1, name: "Marie Lambert", specialty: "Droit des affaires", rating: 4.9, consultations: 128, expertise: "Expert en fusion-acquisition" },
        { id: 2, name: "Thomas Martin", specialty: "Fiscalité", rating: 4.8, consultations: 95, expertise: "Spécialiste en optimisation fiscale" },
        { id: 3, name: "Sophie Bernard", specialty: "Stratégie financière", rating: 4.9, consultations: 156, expertise: "Conseil en investissement" },
        { id: 4, name: "Lucas Petit", specialty: "Droit social", rating: 4.7, consultations: 82, expertise: "Expert en droit du travail" },
    ];

    const testimonials = [
        { id: 1, name: "Jean Dupont", role: "CEO, TechStart", comment: "Service exceptionnel ! J'ai trouvé l'expert juridique parfait pour mon entreprise.", rating: 5 },
        { id: 2, name: "Marie Martin", role: "Indépendante", comment: "Plateforme intuitive et experts de qualité. Je recommande vivement !", rating: 5 },
    ];

    const handleExpertClick = (categoryId: string) => {
        // window.location.href = `/experts?categorie=${categoryId}`;
        window.location.href = `/experts`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-22">
     
                {/* Hero Section - E-Tafakna Réunion */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    E-Tafakna Réunion
                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Gérez vos réunions et agendas
                            </h1>

                            <p className="text-gray-600 text-base max-w-xl">
                                Planifiez, organisez et suivez toutes vos réunions en un seul endroit.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Nouvelle réunion
                                </button>
                                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Mon agenda
                                </button>
                            </div>
                        </div>

                        {/* Mini carte prochaine réunion */}
                        <div className="bg-gray-50 rounded-lg p-4 min-w-[180px] border border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">PROCHAINE RÉUNION</p>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">Aujourd'hui 14:30</span>
                            </div>
                            <p className="text-sm text-gray-700">Réunion stratégique</p>
                            <p className="text-xs text-gray-500 mt-1">8 participants</p>
                        </div>
                    </div>

                    {/* Stats section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">74</p>
                                <p className="text-xs text-gray-500">Experts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">1.2k</p>
                                <p className="text-xs text-gray-500">Rendez-vous</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">98%</p>
                                <p className="text-xs text-gray-500">Satisfaction</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Award className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">15</p>
                                <p className="text-xs text-gray-500">Domaines</p>
                            </div>
                        </div>
                    </div>

                    {/* 3 fonctionnalités clés */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <CalendarCheck className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">Planning</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">Invitations</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bell className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">Rappels</span>
                        </div>
                    </div>
                </div>
                {/* Section Consultation Experts */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Consultation avec nos experts</h2>
                            <p className="text-gray-600 mt-1">
                                Choisissez votre domaine d'expertise et trouvez le professionnel qu'il vous faut
                            </p>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                            Voir tous les domaines <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {expertCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div
                                    key={category.id}
                                    onClick={() => handleExpertClick(category.id)}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`${category.bgColor} p-3 rounded-xl`}>
                                                <Icon className={`w-8 h-8 ${category.textColor}`} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {category.expertsCount} experts
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {category.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {category.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Disponibles immédiatement
                                            </span>
                                            <div className="flex items-center text-indigo-600 text-sm font-medium">
                                                <span>Consulter</span>
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section Pourquoi nous choisir */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">E-Tafakna Réunion</h2>
                            <p className="text-gray-600 mt-1">
                                Gérez vos réunions, partagez vos agendas et planifiez vos événements en toute simplicité
                            </p>
                        </div>

                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            {
                                icon: Calendar,
                                title: "Agenda partagé",
                                desc: "Visualisez et synchronisez vos agendas avec vos collaborateurs",
                                bgColor: "bg-indigo-100",
                                iconColor: "text-indigo-600"
                            },
                            {
                                icon: Users,
                                title: "Invitations",
                                desc: "Invitez des participants et gérez les confirmations",
                                bgColor: "bg-green-100",
                                iconColor: "text-green-600"
                            },
                            {
                                icon: Video,
                                title: "Réunions en ligne",
                                desc: "Créez des liens de visioconférence automatiquement",
                                bgColor: "bg-blue-100",
                                iconColor: "text-blue-600"
                            },
                            {
                                icon: Bell,
                                title: "Rappels intelligents",
                                desc: "Recevez des notifications avant chaque réunion",
                                bgColor: "bg-yellow-100",
                                iconColor: "text-yellow-600"
                            },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className={`${item.bgColor} p-2 rounded-lg`}>
                                            <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-600">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Agenda et événements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {/* Prochains rendez-vous */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Mes prochains rendez-vous</h2>
                                </div>
                                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    Voir tout
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
                                            <span className="text-sm font-bold text-indigo-600">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{event.title}</p>
                                            <p className="text-sm text-gray-600">{event.expert}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500">{event.time}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    event.status === 'Confirmé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100">
                                        Détails
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100">
                            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Planifier un nouveau rendez-vous
                            </button>
                        </div>
                    </div>

                    {/* Experts populaires */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <h2 className="text-lg font-semibold text-gray-900">Experts populaires</h2>
                                </div>
                                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    Voir tous
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentExperts.map((expert) => (
                                <div key={expert.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-indigo-600">
                                                {expert.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{expert.name}</p>
                                            <p className="text-sm text-gray-600">{expert.specialty}</p>
                                            <p className="text-xs text-gray-500">{expert.expertise}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs text-gray-600 ml-1">{expert.rating}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">• {expert.consultations} consultations</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                                        Réserver
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Témoignages */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce que disent nos clients</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-indigo-600">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{testimonial.name}</p>
                                        <p className="text-xs text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Types de consultation disponibles */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Types de consultation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Video className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-medium text-gray-900">Consultation en visio</span>
                                <p className="text-xs text-gray-500">À distance avec un expert</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-medium text-gray-900">Sur place</span>
                                <p className="text-xs text-gray-500">Dans nos locaux</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-medium text-gray-900">En groupe</span>
                                <p className="text-xs text-gray-500">Ateliers et formations</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Section rappel */}
                <div className="bg-indigo-50 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <Bell className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Rappels de rendez-vous</h3>
                                <p className="text-sm text-gray-600">Activez les notifications pour ne manquer aucun rendez-vous important</p>
                            </div>
                        </div>
                        <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-600 whitespace-nowrap">
                            Configurer les rappels
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Planifier une consultation</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Devenir expert partenaire</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Contacter le support</span>
                    </button>
                </div>
            </main>


        </div>
    );
}

export default HomePage;