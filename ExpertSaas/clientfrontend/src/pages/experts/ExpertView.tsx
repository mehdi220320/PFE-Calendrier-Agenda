import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "../../models/User";
import { UserServices } from '../../services/UserServices';
import Header from "../../component/Header";
import BookingExpertMeet from "./BookingExpertMeet";

function ExpertView() {
    const expertId = useParams().id;
    const [expert, setExpert] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpert = async () => {
            try {
                const data = await UserServices.getExpertById(expertId);
                setExpert(data);
            } catch (e) {
                setError("Échec du chargement des informations de l'expert");
            } finally {
                setLoading(false);
            }
        };
        fetchExpert();
    }, [expertId]);

    // Fonction pour obtenir les initiales
    const getInitials = (firstname?: string, lastname?: string) => {
        if (!firstname && !lastname) return "EX";
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-100 pt-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <p className="mt-6 text-gray-500 font-medium">Chargement du profil expert...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error || !expert) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-100 pt-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-lg mx-auto">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert non trouvé</h3>
                            <p className="text-gray-500 mb-6">{error || "L'expert que vous recherchez n'existe pas ou a été supprimé."}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100 pt-22 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Carte principale du profil - Fond blanc */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {/* Bannière bleue avec motif subtil */}
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-700 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <pattern id="grid-blue" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M10 2L2 18h16L10 2z" fill="none" stroke="white" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100" height="100" fill="url(#grid-blue)" />
                                </svg>
                            </div>

                            {/* Texte de la bannière */}
                            <div className="relative flex items-center space-x-6">
                                <span className="text-white/80 font-light tracking-widest text-sm uppercase">Consultant Juridique</span>
                                <div className="h-6 w-px bg-white/30"></div>
                                <span className="text-white/80 font-light tracking-widest text-sm uppercase">Expertise</span>
                                <div className="h-6 w-px bg-white/30"></div>
                                <span className="text-white/80 font-light tracking-widest text-sm uppercase">Conseil</span>
                            </div>
                        </div>

                        {/* Contenu du profil */}
                        <div className="p-8">
                            {/* Avatar et informations principales */}
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                {/* Avatar */}
                                <div className="relative -mt-16">
                                    {expert.picture ? (
                                        <img
                                            src={expert.picture}
                                            alt={`${expert.firstname} ${expert.lastname}`}
                                            className="w-28 h-28 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white">
                                                {getInitials(expert.firstname, expert.lastname)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Infos principales */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800">
                                                {expert.firstname} {expert.lastname}
                                            </h1>
                                            <div className="flex items-center mt-1 text-gray-500">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">Avocat - Barreau de Paris</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z" clipRule="evenodd" />
                                                </svg>
                                                Expert certifié
                                            </span>
                                            {expert.isActive && (
                                                <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                                                    Disponible
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grille d'informations rapide */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm">{expert.email}</span>
                                        </div>
                                        {expert.phone && (
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-sm">{expert.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm">Paris, France</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">15+</div>
                                    <div className="text-xs text-gray-500 mt-1">Années d'expérience</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">500+</div>
                                    <div className="text-xs text-gray-500 mt-1">Consultations</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">98%</div>
                                    <div className="text-xs text-gray-500 mt-1">Clients satisfaits</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">24h</div>
                                    <div className="text-xs text-gray-500 mt-1">Délai de réponse</div>
                                </div>
                            </div>

                            {/* Bio */}
                            {expert.bio && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">À propos</h3>
                                    <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
                                </div>
                            )}

                            {/* Domaines d'expertise */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Domaines d'expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Droit des sociétés</span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Droit fiscal</span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Droit du travail</span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Droit des contrats</span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Contentieux</span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">Conseil juridique</span>
                                </div>
                            </div>

                            {/* Langues */}
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Langues</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700 mr-2">FR</span>
                                        <span className="text-sm text-gray-600">Français (natif)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700 mr-2">EN</span>
                                        <span className="text-sm text-gray-600">Anglais (courant)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700 mr-2">AR</span>
                                        <span className="text-sm text-gray-600">Arabe (professionnel)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section de réservation - Fond blanc */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Réserver une consultation</h2>
                            <div className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Disponibilité en temps réel</span>
                            </div>
                        </div>
                        <BookingExpertMeet expertId={expertId} />
                    </div>

                    {/* Carte d'information - Fond blanc avec bordure bleue */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Consultation confidentielle</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Toutes les consultations sont couvertes par le secret professionnel et la confidentialité
                                    des échanges. Vous recevrez un lien sécurisé par email après la réservation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ExpertView;