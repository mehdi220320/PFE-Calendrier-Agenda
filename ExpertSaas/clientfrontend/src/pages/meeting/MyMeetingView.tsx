import React, { useState, useEffect, useMemo } from 'react';
import { meetingService } from '../../services/meetingService';
import type { Meeting } from '../../models/Meeting';
import Header from '../../component/Header';

function MyMeetingView() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [todayPage, setTodayPage] = useState<number>(1);
    const [previousPage, setPreviousPage] = useState<number>(1);
    const [upcomingPage, setUpcomingPage] = useState<number>(1);
    const [meetingsPerPage] = useState<number>(3);

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [customDateStart, setCustomDateStart] = useState<string>('');
    const [customDateEnd, setCustomDateEnd] = useState<string>('');

    useEffect(() => {
        fetchMeetings();
    }, []);

    useEffect(() => {
        filterMeetings();
        // Reset all pages when filters change
        setTodayPage(1);
        setPreviousPage(1);
        setUpcomingPage(1);
    }, [meetings, filterStatus, searchTerm, dateFilter, customDateStart, customDateEnd]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const data = await meetingService.myMeetings();
            setMeetings(data);
            setError(null);
        } catch (err) {
            setError('Failed to load meetings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterMeetings = () => {
        let filtered = [...meetings];

        // Apply status filter
        if (filterStatus !== 'all') {
            const now = new Date();
            filtered = filtered.filter(meeting => {
                const meetingDate = new Date(meeting.date);
                if (filterStatus === 'upcoming') {
                    return meetingDate >= now;
                } else if (filterStatus === 'past') {
                    return meetingDate < now;
                }
                return true;
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(meeting =>
                meeting.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.creator.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);
        const monthLater = new Date(today);
        monthLater.setMonth(monthLater.getMonth() + 1);

        filtered = filtered.filter(meeting => {
            const meetingDate = new Date(meeting.date);

            switch(dateFilter) {
                case 'today':
                    return meetingDate >= today && meetingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                case 'week':
                    return meetingDate >= today && meetingDate <= weekLater;
                case 'month':
                    return meetingDate >= today && meetingDate <= monthLater;
                case 'custom':
                    if (customDateStart && customDateEnd) {
                        const start = new Date(customDateStart);
                        const end = new Date(customDateEnd);
                        end.setHours(23, 59, 59, 999);
                        return meetingDate >= start && meetingDate <= end;
                    }
                    return true;
                default:
                    return true;
            }
        });

        setFilteredMeetings(filtered);
    };

    const isMeetingUpcoming = (meetingDate: Date | string) => {
        return new Date(meetingDate) >= new Date();
    };

    const isMeetingToday = (meetingDate: Date | string) => {
        const date = new Date(meetingDate);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    // Helper function to open Jitsi meeting
    const openJitsiMeeting = (jitsiRoom: string) => {
        if (jitsiRoom) {
            window.open(`/meetings/${jitsiRoom}`, '_blank');
        }
    };

    // Separate meetings into three categories
    const { todayMeetings, previousMeetings, upcomingMeetings } = useMemo(() => {
        const today: Meeting[] = [];
        const previous: Meeting[] = [];
        const upcoming: Meeting[] = [];

        filteredMeetings.forEach(meeting => {
            if (isMeetingToday(meeting.date)) {
                today.push(meeting);
            } else if (isMeetingUpcoming(meeting.date)) {
                upcoming.push(meeting);
            } else {
                previous.push(meeting);
            }
        });

        // Sort meetings within each category
        const sortByDate = (a: Meeting, b: Meeting) =>
            new Date(a.date).getTime() - new Date(b.date).getTime();

        const sortByDateDesc = (a: Meeting, b: Meeting) =>
            new Date(b.date).getTime() - new Date(a.date).getTime();

        return {
            todayMeetings: today.sort(sortByDate),
            previousMeetings: previous.sort(sortByDateDesc),
            upcomingMeetings: upcoming.sort(sortByDate)
        };
    }, [filteredMeetings]);

    // Pagination calculations for each group
    const todayTotalPages = Math.ceil(todayMeetings.length / meetingsPerPage);
    const previousTotalPages = Math.ceil(previousMeetings.length / meetingsPerPage);
    const upcomingTotalPages = Math.ceil(upcomingMeetings.length / meetingsPerPage);

    // Get current items for each group - FIXED: Use the page state directly
    const currentTodayMeetings = todayMeetings.slice(
        (todayPage - 1) * meetingsPerPage,
        todayPage * meetingsPerPage
    );

    const currentPreviousMeetings = previousMeetings.slice(
        (previousPage - 1) * meetingsPerPage,
        previousPage * meetingsPerPage
    );

    const currentUpcomingMeetings = upcomingMeetings.slice(
        (upcomingPage - 1) * meetingsPerPage,
        upcomingPage * meetingsPerPage
    );

    // Stats calculations
    const totalMeetings = meetings.length;

    // Pagination component
    const Pagination = ({
                            currentPage,
                            totalPages,
                            onPageChange,
                            colorScheme,
                            totalItems
                        }: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        colorScheme: 'green' | 'yellow' | 'gray';
        totalItems: number;
    }) => {
        // Don't show pagination if there's only one page or no items
        if (totalPages <= 1) return null;

        const getButtonClass = (page: number) => {
            const baseClass = "w-8 h-8 rounded-lg text-sm font-medium transition-colors";
            if (currentPage === page) {
                switch(colorScheme) {
                    case 'green':
                        return `${baseClass} bg-green-600 text-white`;
                    case 'yellow':
                        return `${baseClass} bg-yellow-600 text-white`;
                    case 'gray':
                        return `${baseClass} bg-gray-600 text-white`;
                    default:
                        return `${baseClass} bg-indigo-600 text-white`;
                }
            }
            return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
        };

        const startItem = (currentPage - 1) * meetingsPerPage + 1;
        const endItem = Math.min(currentPage * meetingsPerPage, totalItems);

        return (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{startItem}</span>
                    <span className="mx-1">-</span>
                    <span className="font-medium">{endItem}</span>
                    <span className="mx-2">sur</span>
                    <span className="font-medium">{totalItems}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border ${
                            currentPage === 1
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => onPageChange(pageNumber)}
                                    className={getButtonClass(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg border ${
                            currentPage === totalPages
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 pt-10">
                    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-12">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-8 w-8 bg-indigo-50 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-6 font-medium">Chargement de vos réunions...</p>
                                <p className="text-sm text-gray-400 mt-1">Cela ne devrait prendre qu'un instant</p>
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-10">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome header */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-between items-center">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 pr-6">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Mes Réunions
                                </h1>
                                <p className="mt-2 text-sm text-gray-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Gérez et consultez toutes vos réunions programmées
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 pl-6">
                                <span className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        {/* Total meetings card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total réunions</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalMeetings}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="text-green-600 font-medium">{todayMeetings.length}</span>
                                    <span className="mx-1">aujourd'hui,</span>
                                    <span className="text-yellow-600 font-medium">{upcomingMeetings.length}</span>
                                    <span className="mx-1">à venir,</span>
                                    <span className="text-gray-600 font-medium">{previousMeetings.length}</span>
                                    <span className="ml-1">passées</span>
                                </div>
                            </div>
                        </div>

                        {/* Today meetings card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{todayMeetings.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="text-green-600 font-medium">
                                        {todayMeetings.length > 0 ? `${todayMeetings.length} réunion(s) aujourd'hui` : 'Aucune réunion aujourd\'hui'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming meetings card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">À venir (après aujourd'hui)</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{upcomingMeetings.length}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="text-yellow-600 font-medium">
                                        {upcomingMeetings.length > 0 ? 'Prochaines réunions' : 'Aucune réunion à venir'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtres
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Search and Status Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Rechercher par titre, description ou expert..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filterStatus === 'all'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Toutes
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('upcoming')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filterStatus === 'upcoming'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        À venir
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('past')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filterStatus === 'past'
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Passées
                                    </button>
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">Période:</span>
                                    <button
                                        onClick={() => setDateFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateFilter === 'all'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Toutes
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('today')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateFilter === 'today'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Aujourd'hui
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('week')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateFilter === 'week'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Cette semaine
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('month')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateFilter === 'month'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Ce mois
                                    </button>

                                    {/* Custom Date Range */}
                                    <button
                                        onClick={() => setDateFilter('custom')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateFilter === 'custom'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Personnalisé
                                    </button>
                                </div>

                                {/* Custom Date Range Inputs */}
                                {dateFilter === 'custom' && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">Du:</label>
                                            <input
                                                type="date"
                                                value={customDateStart}
                                                onChange={(e) => setCustomDateStart(e.target.value)}
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">Au:</label>
                                            <input
                                                type="date"
                                                value={customDateEnd}
                                                onChange={(e) => setCustomDateEnd(e.target.value)}
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Active Filters Summary */}
                            {(filterStatus !== 'all' || searchTerm || dateFilter !== 'all') && (
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Filtres actifs:</span>
                                            {filterStatus !== 'all' && (
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                    {filterStatus === 'upcoming' ? 'À venir' : 'Passées'}
                                                </span>
                                            )}
                                            {dateFilter !== 'all' && (
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                    {dateFilter === 'today' ? "Aujourd'hui" :
                                                        dateFilter === 'week' ? 'Cette semaine' :
                                                            dateFilter === 'month' ? 'Ce mois' : 'Dates personnalisées'}
                                                </span>
                                            )}
                                            {searchTerm && (
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                    Recherche: "{searchTerm}"
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFilterStatus('all');
                                                setSearchTerm('');
                                                setDateFilter('all');
                                                setCustomDateStart('');
                                                setCustomDateEnd('');
                                            }}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Effacer tout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Three Blocks for Meetings */}
                    <div className="space-y-8">
                        {/* Today's Meetings - Green */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 overflow-hidden">
                            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-green-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Aujourd'hui
                                        <span className="ml-2 text-sm font-normal text-green-600">
                                            ({todayMeetings.length} réunion{todayMeetings.length > 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                    {todayMeetings.length > 0 && (
                                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                            En cours aujourd'hui
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                {todayMeetings.length === 0 ? (
                                    <div className="text-center py-8 bg-green-50 rounded-lg">
                                        <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-4 text-sm text-green-600">Aucune réunion prévue aujourd'hui</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {currentTodayMeetings.map((meeting) => (
                                                <MeetingCard key={meeting.id} meeting={meeting} />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={todayPage}
                                            totalPages={todayTotalPages}
                                            onPageChange={setTodayPage}
                                            colorScheme="green"
                                            totalItems={todayMeetings.length}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Meetings - Yellow */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 overflow-hidden">
                            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-yellow-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        À Venir
                                        <span className="ml-2 text-sm font-normal text-yellow-600">
                                            ({upcomingMeetings.length} réunion{upcomingMeetings.length > 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6">
                                {upcomingMeetings.length === 0 ? (
                                    <div className="text-center py-8 bg-yellow-50 rounded-lg">
                                        <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-4 text-sm text-yellow-600">Aucune réunion à venir</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {currentUpcomingMeetings.map((meeting) => (
                                                <MeetingCard key={meeting.id} meeting={meeting} />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={upcomingPage}
                                            totalPages={upcomingTotalPages}
                                            onPageChange={setUpcomingPage}
                                            colorScheme="yellow"
                                            totalItems={upcomingMeetings.length}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Previous Meetings - Gray */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Réunions Passées
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({previousMeetings.length} réunion{previousMeetings.length > 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6">
                                {previousMeetings.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-4 text-sm text-gray-500">Aucune réunion passée</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {currentPreviousMeetings.map((meeting) => (
                                                <MeetingCard key={meeting.id} meeting={meeting} />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={previousPage}
                                            totalPages={previousTotalPages}
                                            onPageChange={setPreviousPage}
                                            colorScheme="gray"
                                            totalItems={previousMeetings.length}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
    const isUpcoming = new Date(meeting.date) >= new Date();
    const isToday = (() => {
        const date = new Date(meeting.date);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    })();

    const openJitsiMeeting = (jitsiRoom: string) => {
        if (jitsiRoom) {
            window.open(`/meetings/${jitsiRoom}`, '_blank');
        }
    };

    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        {/* Header with time and status */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                                    isToday ? 'bg-green-100 text-green-700' :
                                        isUpcoming ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">{formatTime(meeting.date)}</span>
                                    {!isToday && (<span className="font-medium" >{formatDate(meeting.date)}</span>)}
                                </div>
                            </div>

                            {/* Meeting buttons */}
                            {isUpcoming && (
                                <div className="flex space-x-2">
                                    {meeting.meetUrl && (
                                        <a
                                            href={meeting.meetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Google Meet
                                        </a>
                                    )}
                                    {meeting.jitsiRoom && (
                                        <button
                                            onClick={() => openJitsiMeeting(meeting.jitsiRoom)}
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Jitsi Meet
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            {meeting.summary || 'Réunion sans titre'}
                        </h4>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium mr-2">Expert:</span>
                                <span>{meeting.creator}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium mr-2">Durée:</span>
                                <span>{meeting.slotDuration} minutes</span>
                            </div>
                        </div>

                        {/* Description if exists */}
                        {meeting.description && (
                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium mr-2">Description:</span>
                                <span>{meeting.description}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with meeting link status */}
                {!meeting.meetUrl && !meeting.jitsiRoom && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span>Aucun lien de réunion disponible</span>
                        </div>
                    </div>
                )}

                {/* Show Jitsi room info if available but no Google Meet */}
                {!meeting.meetUrl && meeting.jitsiRoom && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                                <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Room: {meeting.jitsiRoom}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMeetingView;