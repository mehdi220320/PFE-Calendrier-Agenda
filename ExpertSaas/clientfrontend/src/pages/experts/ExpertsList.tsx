import Header from "../../component/Header.tsx";
import { useEffect, useState } from "react";
import type { User } from "../../models/User.tsx";
import { UserServices } from '../../services/UserServices.tsx';
import { Link } from "react-router-dom";
import { Search, Star, Clock, Calendar, ChevronRight, Filter,  } from "lucide-react";

function ExpertsList() {
    const [experts, setExperts] = useState<User[]>([]);
    const [filteredExperts, setFilteredExperts] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [selectedCategory, setSelectedCategory] = useState<string>("tous");

    // const categories = [
    //     { id: "tous", name: "Tous les experts", icon: Users },
    //     { id: "juridique", name: "Juridique", icon: Briefcase },
    //     { id: "financier", name: "Financier", icon: Briefcase },
    //     { id: "divers", name: "Divers", icon: Briefcase },
    // ];

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const data = await UserServices.getExperts();
                setExperts(data);
                setFilteredExperts(data);
            } catch (err) {
                setError('Échec du chargement des experts');
            } finally {
                setLoading(false);
            }
        };

        fetchExperts();
    }, []);

    useEffect(() => {
        let filtered = experts;
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(expert =>
                expert.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expert.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expert.specialty && expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtre par catégorie
        // if (selectedCategory !== "tous") {
        //     filtered = filtered.filter(expert =>
        //         expert.category === selectedCategory ||
        //         (expert.specialty && expert.specialty.toLowerCase().includes(selectedCategory))
        //     );
        // }

        setFilteredExperts(filtered);
    }, [searchTerm, experts]);

    const DefaultExpertSVG = () => (
        <svg className="w-12 h-12 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    );

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 pt-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-3 text-sm text-gray-500">Chargement des experts...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 pt-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-500 text-sm mb-3">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-indigo-600 text-sm hover:text-indigo-700 transition-colors"
                            >
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
            <main className="min-h-screen bg-gray-50  pb-12 pt-22">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="text-left mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                            Consultation en ligne
                        </h1>
                        <span className="block text-lg text-gray-500 max-w-6xl leading-relaxed">
                            Réservez une consultation en ligne de 15 minutes avec un expert qualifié
                            et posez vos questions en toute simplicité.
                            <br/> Cette consultation personnalisée répond parfaitement à vos besoins.
                            Profitez de cette opportunité pour obtenir des conseils fiables et précis, directement depuis votre domicile.
                            Vous pouvez choisir l'heure et la date de la consultation selon votre convenance.
                        </span>
                    </div>

                    {/* Section d'en-tête */}
                    {/*<div className="mb-8">*/}
                    {/*    <div className="flex items-center gap-2 mb-2">*/}
                    {/*        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">*/}
                    {/*            Consultation en ligne*/}
                    {/*        </span>*/}
                    {/*    </div>*/}
                    {/*    <h1 className="text-3xl font-bold text-gray-900 mb-3">*/}
                    {/*        Trouvez l'expert qu'il vous faut*/}
                    {/*    </h1>*/}
                    {/*    <p className="text-gray-600 text-base max-w-3xl">*/}
                    {/*        Réservez une consultation en ligne de 15 minutes avec un expert qualifié*/}
                    {/*        et posez vos questions en toute simplicité. Choisissez l'heure et la date*/}
                    {/*        qui vous conviennent.*/}
                    {/*    </p>*/}
                    {/*</div>*/}

                    {/*/!* Filtres par catégorie *!/*/}
                    {/*<div className="flex gap-2 mb-6 overflow-x-auto pb-2">*/}
                    {/*    {categories.map((category) => {*/}
                    {/*        const Icon = category.icon;*/}
                    {/*        return (*/}
                    {/*            <button*/}
                    {/*                key={category.id}*/}
                    {/*                onClick={() => setSelectedCategory(category.id)}*/}
                    {/*                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${*/}
                    {/*                    selectedCategory === category.id*/}
                    {/*                        ? 'bg-indigo-600 text-white'*/}
                    {/*                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'*/}
                    {/*                }`}*/}
                    {/*            >*/}
                    {/*                <Icon className="w-4 h-4" />*/}
                    {/*                {category.name}*/}
                    {/*            </button>*/}
                    {/*        );*/}
                    {/*    })}*/}
                    {/*</div>*/}

                    {/* Barre de recherche */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un expert par nom, spécialité..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-5 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors text-sm"
                            />
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Compteur d'experts */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {filteredExperts.length} expert{filteredExperts.length > 1 ? 's' : ''} disponible{filteredExperts.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none">
                                <option>Pertinence</option>
                                <option>Note</option>
                                <option>Disponibilité</option>
                            </select>
                        </div>
                    </div>

                    {/* Grille des experts */}
                    {filteredExperts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-400">Aucun expert trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredExperts.map((expert) => (
                                <Link
                                    key={expert.id}
                                    to={`/expert/${expert.id}`}
                                    className="block h-full"
                                >
                                    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 h-full">
                                        <div className="flex items-start gap-4">
                                            {/* Photo ou SVG */}
                                            <div className="flex-shrink-0">
                                                {expert.picture ? (
                                                    <img
                                                        src={expert.picture}
                                                        alt={`${expert.firstname} ${expert.lastname}`}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
                                                        <DefaultExpertSVG />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Infos expert */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {expert.firstname} {expert.lastname}
                                                </h3>
                                                <p className="text-sm text-indigo-600 mt-0.5">
                                                    {expert.specialty || "Expert"}
                                                </p>

                                                {/* Note et consultations */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                        <span className="text-xs text-gray-600">4.9</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-600">128 consultations</span>
                                                </div>

                                                {/* Disponibilité */}
                                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Disponible aujourd'hui</span>
                                                </div>
                                            </div>

                                            {/* Flèche discrète */}
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Section d'information complémentaire */}
                    <div className="mt-12 bg-indigo-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-2 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Comment ça marche ?</h3>
                                <p className="text-sm text-gray-600">
                                    1. Choisissez un expert • 2. Sélectionnez un créneau • 3. Rencontrez-le en visio
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default ExpertsList;