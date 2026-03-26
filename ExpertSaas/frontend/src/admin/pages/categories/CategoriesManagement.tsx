import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.tsx';
import { expertProfilService } from '../../../services/expertProfileService.tsx';
interface Category {
    category: string;
    nb_of_profiles: number;
}


const CategoriesManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await expertProfilService.getCategories();
            setCategories(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (oldCategoryName: string) => {
        if (!newCategoryName.trim()) {
            setError('Le nouveau nom de catégorie est requis');
            return;
        }

        if (newCategoryName === oldCategoryName) {
            setError('Le nouveau nom doit être différent de l\'ancien');
            return;
        }

        try {
            setUpdating(true);
            const response = await expertProfilService.updateCategoryName(oldCategoryName, newCategoryName);

            // Refresh categories list
            await fetchCategories();

            // Reset editing state
            setEditingCategory(null);
            setNewCategoryName('');
            setError(null);

            // Show success message (optional)
            console.log(response.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setError(null);
    };

    const startEditing = (category: string) => {
        setEditingCategory(category);
        setNewCategoryName(category);
        setError(null);
    };

    const calculateStats = () => {
        const totalCategories = categories.length;
        const totalExperts = categories.reduce((sum, cat) => sum + cat.nb_of_profiles, 0);
        const avgExpertsPerCategory = totalCategories > 0 ? Math.round(totalExperts / totalCategories) : 0;
        const mostPopularCategory = categories.length > 0
            ? categories.reduce((max, cat) => cat.nb_of_profiles > max.nb_of_profiles ? cat : max, categories[0])
            : null;

        return {
            totalCategories,
            totalExperts,
            avgExpertsPerCategory,
            mostPopularCategory
        };
    };

    const stats = calculateStats();

    // Filter categories based on search term
    const filteredCategories = categories.filter(cat =>
        cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const getCategoryColor = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-yellow-100 text-yellow-800',
            'bg-pink-100 text-pink-800',
            'bg-indigo-100 text-indigo-800'
        ];
        return colors[index % colors.length];
    };

    if (loading && categories.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                                <p className="text-gray-600 mt-2">Gérez les catégories d'experts de la plateforme</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Categories Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total des catégories</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
                                    <p className="text-xs text-indigo-600 mt-2">Catégories disponibles</p>
                                </div>
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 011.414 2.414 2 2 0 01-.414.586l-5 5a2 2 0 01-2.414.414 2 2 0 01-.586-.414l-5-5A2 2 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Experts Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total des experts</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalExperts}</p>
                                    <p className="text-xs text-green-600 mt-2">Experts enregistrés</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Average Experts per Category Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Moyenne par catégorie</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgExpertsPerCategory}</p>
                                    <p className="text-xs text-purple-600 mt-2">Experts par catégorie</p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Most Popular Category Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Catégorie populaire</p>
                                    <p className="text-lg font-bold text-gray-900 mt-2 truncate max-w-[150px]">
                                        {stats.mostPopularCategory?.category || 'N/A'}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {stats.mostPopularCategory?.nb_of_profiles || 0} experts
                                    </p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher une catégorie..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Categories Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Catégorie
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre d'experts
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCategories.length > 0 ? (
                                    paginatedCategories.map((category, index) => (
                                        <tr key={category.category} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingCategory === category.category ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getCategoryColor(index)}`}>
                                                                {category.category}
                                                            </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {category.nb_of_profiles}
                                                        </span>
                                                    <span className="text-xs text-gray-500">
                                                            expert{category.nb_of_profiles > 1 ? 's' : ''}
                                                        </span>
                                                    {category.nb_of_profiles > 0 && (
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                                style={{ width: `${Math.min((category.nb_of_profiles / stats.totalExperts) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingCategory === category.category ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateCategory(category.category)}
                                                            disabled={updating}
                                                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {updating ? 'Enregistrement...' : 'Enregistrer'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(category.category)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Modifier
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 011.414 2.414 2 2 0 01-.414.586l-5 5a2 2 0 01-2.414.414 2 2 0 01-.586-.414l-5-5A2 2 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <p className="text-gray-500">Aucune catégorie trouvée</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer with Pagination */}
                        {filteredCategories.length > 0 && (
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-sm text-gray-500">
                                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredCategories.length)} sur {filteredCategories.length} catégories
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 border rounded-md text-sm transition-colors ${
                                                currentPage === 1
                                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-300 text-gray-600 cursor-pointer hover:bg-gray-50'
                                            }`}
                                        >
                                            Précédent
                                        </button>

                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-600">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page as number)}
                                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'border border-gray-300 cursor-pointer text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}

                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 border rounded-md text-sm transition-colors ${
                                                currentPage === totalPages
                                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-300 cursor-pointer text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default CategoriesManagement;