import { ChevronRight, HelpCircle } from "lucide-react";
import { CategoryCard } from "./CategoryCard";

interface CategoriesSectionProps {
    categories: { category: string; nb_of_profiles: number }[];
    loading: boolean;
    onCategoryClick: (categoryName: string) => void;
    onViewAllClick?: () => void;
}

export function CategoriesSection({
                                      categories,
                                      loading,
                                      onCategoryClick,
                                      onViewAllClick
                                  }: CategoriesSectionProps) {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Consultation avec nos experts</h2>
                    <p className="text-gray-600 mt-1">
                        Choisissez votre domaine d'expertise et trouvez le professionnel qu'il vous faut
                    </p>
                </div>
                {onViewAllClick && (
                    <button
                        onClick={onViewAllClick}
                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        Voir tous les domaines <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.category}
                            category={category}
                            onClick={() => onCategoryClick(category.category)}
                        />
                    ))}
                </div>
            )}

            {!loading && categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune catégorie d'expert disponible pour le moment.</p>
                </div>
            )}
        </section>
    );
}