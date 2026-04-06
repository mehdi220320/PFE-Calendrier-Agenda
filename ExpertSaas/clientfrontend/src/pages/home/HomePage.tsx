import { useEffect, useState } from "react";
import {
    Calendar, Briefcase, Users, Bell, Star, Phone, Video, Building2, Clock, Plus, CalendarCheck, TrendingUp, Award, ArrowRight,
} from "lucide-react";
import Header from "../../component/Header.tsx";
import expertProfileService from "../../services/expertProfileService.tsx";
import { CategoriesSection } from "./categories/CategoriesSection";
import { meetingService } from "../../services/meetingService.tsx";
import { UserServices } from "../../services/UserServices.tsx"

const getRandomItems = (arr: any[], num: number) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, num);
};

function HomePage() {
    const [categories, setCategories] = useState<{ category: string, nb_of_profiles: number }[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Dynamic state variables
    const [nextMeeting, setNextMeeting] = useState<any>(null);
    const [meetingsCount, setMeetingsCount] = useState<number>(0);
    const [nextFourMeetings, setNextFourMeetings] = useState<any[]>([]);
    const [expertsCount, setExpertsCount] = useState<number>(0);
    const [randomExperts, setRandomExperts] = useState<any[]>([]);
    const [loadingExperts, setLoadingExperts] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const categoriesData = await expertProfileService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch dynamic data
    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                setLoadingStats(true);
                setLoadingExperts(true);

                // Fetch next meeting - response has { meet: {...} }
                const nextMeetResponse = await meetingService.nextMeet();
                const nextMeetData = nextMeetResponse.meet || nextMeetResponse;
                setNextMeeting(nextMeetData);

                const countResponse = await meetingService.meetingsCount();
                setMeetingsCount(countResponse.count);

                const meetings = await meetingService.myMeetings(4);
                setNextFourMeetings(meetings);

                const expertCountResponse = await UserServices.expertCount();
                setExpertsCount(expertCountResponse.count);

                // Fetch all experts and select 4 random ones
                const allExperts = await expertProfileService.getAllExperts();
                const randomFour = getRandomItems(allExperts, 4);
                setRandomExperts(randomFour);

            } catch (error) {
                console.error("Error fetching dynamic data:", error);
            } finally {
                setLoadingStats(false);
                setLoadingExperts(false);
            }
        };

        fetchDynamicData();
    }, []);

    // Navigation handlers
    const handleNewMeeting = () => {
        window.location.href = "/experts";
    };

    const handleMyAgenda = () => {
        window.location.href = "/agenda";
    };

    const handleViewAllMeetings = () => {
        window.location.href = "/agenda";
    };

    const handleViewAllExperts = () => {
        window.location.href = "/experts";
    };

    const handleExpertClick = (categoryId: string) => {
        const encodedCategory = encodeURIComponent(categoryId);
        window.location.href = `/experts?categorie=${encodedCategory}`;
    };

    const handleBookExpert = (expertId: string) => {
        window.location.href = `/expert/${expertId}`;
    };

    const handleMeetingDetails = (meetingId: string) => {
        window.location.href = `/meeting/${meetingId}`;
    };

    const handleNextMeetingDetails = () => {
        if (nextMeeting?.id) {
            window.location.href = `/meeting/${nextMeeting.id}`;
        }
    };

    // Format date for display
    const formatMeetingDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('fr-FR', { day: 'numeric' }),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Format next meeting date
    const formatNextMeetingDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            weekday: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Static testimonials
    const testimonials = [
        { id: 1, name: "Jean Dupont", role: "CEO, TechStart", comment: "Service exceptionnel ! J'ai trouvé l'expert juridique parfait pour mon entreprise.", rating: 5 },
        { id: 2, name: "Marie Martin", role: "Indépendante", comment: "Plateforme intuitive et experts de qualité. Je recommande vivement !", rating: 5 },
    ];

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
                                <button
                                    onClick={handleNewMeeting}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Nouvelle réunion
                                </button>
                                <button
                                    onClick={handleMyAgenda}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Mon agenda
                                </button>
                            </div>
                        </div>

                        {/* Next Meeting Card - Simple and Visible */}
                        {nextMeeting ? (
                            <div className="bg-green-600 rounded-lg p-4 min-w-[220px] shadow-lg">
                                <p className="text-xs font-semibold text-green-100 mb-2">PROCHAINE RÉUNION</p>
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-green-100" />
                                    <span className="text-sm font-semibold text-white">
                                        {formatNextMeetingDate(nextMeeting.date).weekday} {formatNextMeetingDate(nextMeeting.date).time}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-white">{nextMeeting.summary || "Réunion"}</p>
                                <p className="text-xs text-green-100 mt-1">Avec: {nextMeeting.expert || "Expert"}</p>
                                <button
                                    onClick={handleNextMeetingDetails}
                                    className="mt-3 w-full bg-white text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
                                >
                                    Voir détails
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-4 min-w-[180px] border border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">PROCHAINE RÉUNION</p>
                                <p className="text-sm text-gray-500">Aucune réunion planifiée</p>
                                <button
                                    onClick={handleNewMeeting}
                                    className="mt-2 w-full bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Planifier
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{loadingStats ? "..." : expertsCount}</p>
                                <p className="text-xs text-gray-500">Experts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{loadingStats ? "..." : meetingsCount}</p>
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
                                <p className="text-lg font-semibold text-gray-900">{categories.length}</p>
                                <p className="text-xs text-gray-500">Domaines</p>
                            </div>
                        </div>
                    </div>

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

                {/* Section Categories */}
                <CategoriesSection
                    categories={categories}
                    loading={loadingCategories}
                    onCategoryClick={handleExpertClick}
                    onViewAllClick={() => window.location.href = "/experts"}
                />

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
                    {/* Prochains rendez-vous - Dynamic */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Mes prochains rendez-vous</h2>
                                </div>
                                <button
                                    onClick={handleViewAllMeetings}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Voir tout
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {nextFourMeetings.length > 0 ? (
                                nextFourMeetings.map((event) => {
                                    const { day, month, time } = formatMeetingDate(event.date);
                                    return (
                                        <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
                                                    <span className="text-sm font-bold text-indigo-600">{day}</span>
                                                    <span className="text-xs text-gray-500">{month}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{event.summary || "Réunion"}</p>
                                                    <p className="text-sm text-gray-600">Avec expert</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-xs text-gray-500">{time}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                            Confirmé
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleMeetingDetails(event.id)}
                                                className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"
                                            >
                                                Détails
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    Aucun rendez-vous planifié
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={handleNewMeeting}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Planifier un nouveau rendez-vous
                            </button>
                        </div>
                    </div>

                    {/* Experts populaires - Dynamic with random experts (no stars/ratings) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <h2 className="text-lg font-semibold text-gray-900">Experts populaires</h2>
                                </div>
                                <button
                                    onClick={handleViewAllExperts}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Voir tous
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {!loadingExperts && randomExperts.length > 0 ? (
                                randomExperts.map((expert, index) => {
                                    const user = expert.expertUser;
                                    const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
                                    const name = fullName || "Expert";
                                    const specialty = user?.specialty || "Expert conseil";
                                    const expertise = user?.expertise || "Consultation professionnelle";

                                    return (
                                        <div key={user?.id || index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                {user?.picture ? (
                                                    <img
                                                        src={user.picture}
                                                        alt={name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-indigo-600">
                                                            {name.split(' ').map((n: string) => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{name}</p>
                                                    <p className="text-sm text-gray-600">{specialty}</p>
                                                    <p className="text-xs text-gray-500">{expertise}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBookExpert(user?.id)}
                                                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                Réserver
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    Chargement des experts...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Témoignages - Static */}
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

                {/* Types de consultation disponibles - Static as requested */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Types de consultation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => window.location.href = "/experts?type=visio"}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Video className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-medium text-gray-900">Consultation en visio</span>
                                <p className="text-xs text-gray-500">À distance avec un expert</p>
                            </div>
                        </button>
                        <button
                            onClick={() => window.location.href = "/experts?type=onsite"}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-medium text-gray-900">Sur place</span>
                                <p className="text-xs text-gray-500">Dans nos locaux</p>
                            </div>
                        </button>
                        <button
                            onClick={() => window.location.href = "/experts?type=group"}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
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

                {/* Section rappel - Static */}
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
                        <button
                            onClick={() => console.log("Configure reminders")}
                            className="bg-white text-indigo-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-600 whitespace-nowrap"
                        >
                            Configurer les rappels
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={handleNewMeeting}
                        className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Planifier une consultation</span>
                    </button>
                    <button
                        onClick={() => window.location.href = "/become-expert"}
                        className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Devenir expert partenaire</span>
                    </button>
                    <button
                        onClick={() => window.location.href = "/support"}
                        className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Contacter le support</span>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default HomePage;