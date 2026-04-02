import { ArrowRight } from "lucide-react";
import { getCategoryIcon } from "./categoryIcons";

interface CategoryCardProps {
    category: {
        category: string;
        nb_of_profiles: number;
    };
    onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
    const { icon: Icon, bgColor, textColor } = getCategoryIcon(category.category);

    const getCategoryDescription = (categoryName: string): string => {
        const descriptions: { [key: string]: string } = {
            "Consultant Juridique": "Conseils en droit des affaires, contrats, propriété intellectuelle et litiges",
            "juridique": "Conseils en droit des affaires, contrats, propriété intellectuelle et litiges",
            "Consultant Financier": "Stratégies d'investissement, fiscalité, gestion de patrimoine et audit",
            "financier": "Stratégies d'investissement, fiscalité, gestion de patrimoine et audit",
            "Consultant Divers": "Expertises variées : RH, marketing, stratégie, développement personnel",
            "divers": "Expertises variées : RH, marketing, stratégie, développement personnel",
        };

        const lowerCaseName = categoryName.toLowerCase();
        const matchedKey = Object.keys(descriptions).find(key =>
            key.toLowerCase() === lowerCaseName || key === categoryName
        );

        return matchedKey ? descriptions[matchedKey] : `Expertise en ${categoryName.toLowerCase()} avec des professionnels qualifiés`;
    };

    const description = getCategoryDescription(category.category);

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`${bgColor} p-3 rounded-xl`}>
                        <Icon className={`w-8 h-8 ${textColor}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.nb_of_profiles} {category.nb_of_profiles === 1 ? 'expert' : 'experts'}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {category.category}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    {description}
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
}