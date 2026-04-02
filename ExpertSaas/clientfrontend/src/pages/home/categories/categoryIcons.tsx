import {
    Scale,
    DollarSign,
    UserCog,
    HelpCircle,
    TrendingUp,
    Shield,
    Building2,
    Users,
    Briefcase,
    LineChart,
    FileText,
    Code,
    Palette,
    Megaphone,
    Heart,
    GraduationCap,
    Truck,
    Wrench,
    Stethoscope,
    Calculator,
    Gavel,
    Plane,
    Home,
    ShoppingBag,
    Globe,
    Camera,
    Music,
    BookOpen,
    Utensils,
    Droplet,
    Sun,
    Moon,
    Battery,
    Cpu,
    Zap,
    Package,
    Brain,
    Target,
    MessageSquare,
    Sparkles,
    Lightbulb,
    Database,
    Activity,
    Ruler,
    Brush,
    Ship,
    Headphones,
    Hotel,
    Coffee,
    Calendar,
    Trees,
    Film,
    type LucideIcon
} from "lucide-react";

interface CategoryIconConfig {
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
}

interface KeywordMapping {
    keywords: string[];
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
}

// Configuration avancée avec mots-clés multiples
const categoryMappings: KeywordMapping[] = [
    // Juridique
    {
        keywords: ["juridique", "droit", "avocat", "legal", "justice", "loi", "contrat", "notaire", "juge", "tribunal", "contentieux"],
        icon: Scale,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-600"
    },
    {
        keywords: ["gavel", "procès", "plainte", "litige"],
        icon: Gavel,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-600"
    },

    // Financier
    {
        keywords: ["financier", "comptable", "fiscalité", "fiscal", "expert comptable", "finance", "investissement", "épargne"],
        icon: DollarSign,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },
    {
        keywords: ["banque", "crédit", "prêt", "hypothèque"],
        icon: Building2,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },
    {
        keywords: ["analyse financière", "prévision", "budget", "trésorerie"],
        icon: LineChart,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },
    {
        keywords: ["impôt", "taxe", "déclaration"],
        icon: Calculator,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },

    // RH et Management
    {
        keywords: ["rh", "ressources humaines", "recrutement", "personnel", "carrière", "talent", "formation employé"],
        icon: Users,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600"
    },
    {
        keywords: ["management", "gestion d'équipe", "leadership", "coaching", "team building"],
        icon: TrendingUp,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600"
    },
    {
        keywords: ["paie", "salaire", "rémunération", "prime"],
        icon: Briefcase,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600"
    },

    // Marketing et Communication
    {
        keywords: ["marketing", "publicité", "campagne", "branding", "stratégie marketing"],
        icon: Megaphone,
        bgColor: "bg-pink-100",
        textColor: "text-pink-600"
    },
    {
        keywords: ["communication", "relations publiques", "rp", "presse", "média"],
        icon: MessageSquare,
        bgColor: "bg-pink-100",
        textColor: "text-pink-600"
    },
    {
        keywords: ["digital", "webmarketing", "seo", "sea", "réseaux sociaux", "social media"],
        icon: Globe,
        bgColor: "bg-cyan-100",
        textColor: "text-cyan-600"
    },
    {
        keywords: ["content", "contenu", "rédaction", "copywriting"],
        icon: FileText,
        bgColor: "bg-pink-100",
        textColor: "text-pink-600"
    },

    // Tech et Développement
    {
        keywords: ["développement", "programmation", "software", "logiciel", "code", "développeur", "fullstack", "frontend", "backend"],
        icon: Code,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },
    {
        keywords: ["informatique", "it", "infrastructure", "réseau", "système", "sysadmin", "devops", "cloud"],
        icon: Cpu,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },
    {
        keywords: ["cybersécurité", "sécurité", "protection", "firewall"],
        icon: Shield,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },
    {
        keywords: ["data", "données", "big data", "analyse données", "business intelligence", "bi"],
        icon: Database,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },
    {
        keywords: ["intelligence artificielle", "ia", "machine learning", "ai"],
        icon: Brain,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },

    // Design et Créatif
    {
        keywords: ["design", "graphisme", "ui", "ux", "interface", "expérience utilisateur", "maquette", "prototype"],
        icon: Palette,
        bgColor: "bg-rose-100",
        textColor: "text-rose-600"
    },
    {
        keywords: ["créatif", "illustration", "art", "création", "artistique"],
        icon: Sparkles,
        bgColor: "bg-rose-100",
        textColor: "text-rose-600"
    },
    {
        keywords: ["photographie", "photo", "vidéo", "montage", "post-production"],
        icon: Camera,
        bgColor: "bg-rose-100",
        textColor: "text-rose-600"
    },

    // Santé et Bien-être
    {
        keywords: ["santé", "medical", "médecin", "clinique", "hôpital", "soins", "paramédical"],
        icon: Heart,
        bgColor: "bg-red-100",
        textColor: "text-red-600"
    },
    {
        keywords: ["bien-être", "wellness", "spa", "relaxation", "méditation", "yoga"],
        icon: Sun,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600"
    },
    {
        keywords: ["coach sportif", "sport", "fitness", "entraînement"],
        icon: Activity,
        bgColor: "bg-red-100",
        textColor: "text-red-600"
    },
    {
        keywords: ["psychologie", "psychologue", "thérapie", "conseil"],
        icon: Brain,
        bgColor: "bg-red-100",
        textColor: "text-red-600"
    },

    // Éducation et Formation
    {
        keywords: ["éducation", "enseignement", "professeur", "école", "université", "cours", "pédagogie"],
        icon: GraduationCap,
        bgColor: "bg-teal-100",
        textColor: "text-teal-600"
    },
    {
        keywords: ["formation", "apprentissage", "coaching", "tutorat", "atelier"],
        icon: BookOpen,
        bgColor: "bg-teal-100",
        textColor: "text-teal-600"
    },
    {
        keywords: ["langues", "traduction", "interprète"],
        icon: MessageSquare,
        bgColor: "bg-teal-100",
        textColor: "text-teal-600"
    },

    // Immobilier et Construction
    {
        keywords: ["immobilier", "agent immobilier", "logement", "appartement", "maison", "bien immobilier"],
        icon: Home,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },
    {
        keywords: ["construction", "bâtiment", "travaux", "chantier", "gros œuvre", "second œuvre"],
        icon: Wrench,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },
    {
        keywords: ["architecture", "architecte", "plan", "urbanisme"],
        icon: Ruler,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },
    {
        keywords: ["rénovation", "aménagement", "décoration", "interior design"],
        icon: Brush,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },

    // Transport et Logistique
    {
        keywords: ["transport", "livraison", "coursier", "marchandises", "fret", "logistique transport"],
        icon: Truck,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600"
    },
    {
        keywords: ["logistique", "supply chain", "chaîne logistique", "stock", "entrepôt", "gestion stock"],
        icon: Package,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600"
    },
    {
        keywords: ["aérien", "aviation", "aéroport"],
        icon: Plane,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600"
    },
    {
        keywords: ["maritime", "navire", "port", "transport maritime"],
        icon: Ship,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-600"
    },

    // Commerce et Vente
    {
        keywords: ["commerce", "e-commerce", "boutique", "vente en ligne", "retail"],
        icon: ShoppingBag,
        bgColor: "bg-amber-100",
        textColor: "text-amber-600"
    },
    {
        keywords: ["vente", "commercial", "business development", "négociation", "force de vente"],
        icon: TrendingUp,
        bgColor: "bg-amber-100",
        textColor: "text-amber-600"
    },
    {
        keywords: ["service client", "relation client", "sav", "customer success"],
        icon: Headphones,
        bgColor: "bg-amber-100",
        textColor: "text-amber-600"
    },

    // Stratégie et Business
    {
        keywords: ["stratégie", "planification", "vision", "business plan", "stratégie d'entreprise"],
        icon: Target,
        bgColor: "bg-slate-100",
        textColor: "text-slate-700"
    },
    {
        keywords: ["business", "entreprise", "création entreprise", "startup", "pme"],
        icon: Briefcase,
        bgColor: "bg-slate-100",
        textColor: "text-slate-700"
    },
    {
        keywords: ["consultant", "conseil", "consulting", "expertise"],
        icon: UserCog,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600"
    },
    {
        keywords: ["innovation", "transformation", "digital transformation"],
        icon: Lightbulb,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600"
    },

    // Énergie et Environnement
    {
        keywords: ["énergie", "électricité", "gaz", "éolien", "solaire", "renouvelable"],
        icon: Zap,
        bgColor: "bg-lime-100",
        textColor: "text-lime-600"
    },
    {
        keywords: ["environnement", "écologie", "durable", "green", "rse"],
        icon: Trees,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },
    {
        keywords: ["eau", "hydraulique", "traitement eau"],
        icon: Droplet,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600"
    },

    // Hôtellerie et Restauration
    {
        keywords: ["hôtel", "hôtellerie", "hébergement", "tourisme"],
        icon: Hotel,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },
    {
        keywords: ["restaurant", "restauration", "chef", "cuisine", "traiteur"],
        icon: Utensils,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
    },
    {
        keywords: ["café", "bar", "brasserie", "cafetier"],
        icon: Coffee,
        bgColor: "bg-amber-100",
        textColor: "text-amber-600"
    },

    // Événementiel
    {
        keywords: ["événementiel", "organisation événement", "mariage", "anniversaire", "soirée"],
        icon: Calendar,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600"
    },

    // Agriculture
    {
        keywords: ["agriculture", "agroalimentaire", "ferme", "élevage", "viticulture"],
        icon: Trees,
        bgColor: "bg-green-100",
        textColor: "text-green-600"
    },

    // Art et Culture
    {
        keywords: ["art", "culture", "musée", "exposition", "galerie"],
        icon: Palette,
        bgColor: "bg-rose-100",
        textColor: "text-rose-600"
    },
    {
        keywords: ["musique", "concert", "spectacle", "artiste"],
        icon: Music,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600"
    },
    {
        keywords: ["cinéma", "film", "audiovisuel", "production"],
        icon: Film,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
    },
];

// Fonction de recherche intelligente par mots-clés
export const getCategoryIcon = (categoryName: string): CategoryIconConfig => {
    const lowerCaseName = categoryName.toLowerCase();

    // Recherche par mots-clés avec scoring de pertinence
    let bestMatch: KeywordMapping | null = null;
    let bestScore = 0;

    for (const mapping of categoryMappings) {
        let score = 0;

        for (const keyword of mapping.keywords) {
            const lowerKeyword = keyword.toLowerCase();

            // Correspondance exacte
            if (lowerCaseName === lowerKeyword) {
                score = 100;
                break;
            }

            // Mot-clé contenu dans le nom
            if (lowerCaseName.includes(lowerKeyword)) {
                score += 10;
            }

            // Nom contenu dans le mot-clé (pour les mots courts)
            if (lowerKeyword.includes(lowerCaseName) && lowerCaseName.length > 2) {
                score += 5;
            }

            // Recherche par parties de mots (pour les mots composés)
            const words = lowerCaseName.split(/[\s\-_]+/);
            for (const word of words) {
                if (word.length > 2 && lowerKeyword.includes(word)) {
                    score += 3;
                }
                if (word.length > 2 && word.includes(lowerKeyword)) {
                    score += 2;
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = mapping;
        }
    }

    // Si on a trouvé une correspondance avec un score suffisant
    if (bestMatch && bestScore >= 3) {
        return {
            icon: bestMatch.icon,
            bgColor: bestMatch.bgColor,
            textColor: bestMatch.textColor
        };
    }

    // Fallback: génération de couleurs basée sur le nom
    const colorIndex = Math.abs(
        categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % 12;

    const colorPalette = [
        { bg: "bg-indigo-100", text: "text-indigo-600" },
        { bg: "bg-green-100", text: "text-green-600" },
        { bg: "bg-blue-100", text: "text-blue-600" },
        { bg: "bg-purple-100", text: "text-purple-600" },
        { bg: "bg-pink-100", text: "text-pink-600" },
        { bg: "bg-red-100", text: "text-red-600" },
        { bg: "bg-yellow-100", text: "text-yellow-600" },
        { bg: "bg-teal-100", text: "text-teal-600" },
        { bg: "bg-orange-100", text: "text-orange-600" },
        { bg: "bg-cyan-100", text: "text-cyan-600" },
        { bg: "bg-rose-100", text: "text-rose-600" },
        { bg: "bg-emerald-100", text: "text-emerald-600" },
    ];

    const colors = colorPalette[colorIndex];

    return {
        icon: HelpCircle,
        bgColor: colors.bg,
        textColor: colors.text
    };
};

// Fonction utilitaire pour ajouter dynamiquement de nouvelles catégories
export const addCategoryMapping = (mapping: KeywordMapping) => {
    categoryMappings.push(mapping);
};

// Fonction pour obtenir toutes les catégories disponibles (pour l'autocomplétion)
export const getAllKeywords = (): string[] => {
    return categoryMappings.flatMap(mapping => mapping.keywords);
};