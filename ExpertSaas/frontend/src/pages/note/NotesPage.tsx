import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '../../Component/Header.tsx';
import { NoteService } from '../../services/noteService.tsx';
import { meetingService } from '../../services/meetingService.tsx';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingNote, setViewingNote] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client: '',
        meeting: ''
    });
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchNotes();
        fetchMeetings();
    }, []);

    useEffect(() => {
        if (formData.client) {
            const clientMeetings = meetings.filter(meeting =>
                meeting.creatorUser?.id === formData.client
            );
            setFilteredMeetings(clientMeetings);
        } else {
            setFilteredMeetings([]);
        }
    }, [formData.client, meetings]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const data = await NoteService.getMyNotes();
            setNotes(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notes');
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetings = async () => {
        try {
            const data = await meetingService.myMeetingsAndClients();
            setMeetings(data);
        } catch (err) {
            console.error('Erreur lors du chargement des réunions:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'client' && { meeting: '' })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNote) {
                await NoteService.editNote(editingNote.id, formData);
            } else {
                await NoteService.addNote(formData);
            }
            await fetchNotes();
            handleCloseModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la note');
        }
    };

    const handleView = (note) => {
        setViewingNote(note);
        setShowViewModal(true);
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            description: note.description,
            client: note.client || '',
            meeting: note.meeting || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            try {
                await NoteService.deleteNote(id);
                await fetchNotes();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setFormData({
            title: '',
            description: '',
            client: '',
            meeting: ''
        });
        setError(null);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setViewingNote(null);
    };

    const getUniqueClients = useMemo(() => {
        const clientsMap = new Map();
        meetings.forEach(meeting => {
            if (meeting.creatorUser && !clientsMap.has(meeting.creatorUser.id)) {
                clientsMap.set(meeting.creatorUser.id, meeting.creatorUser);
            }
        });
        return Array.from(clientsMap.values());
    }, [meetings]);

    const getMeetingSummary = useCallback((meetingId) => {
        const meeting = meetings.find(m => m.id === meetingId);
        return meeting ? meeting.summary : 'Réunion non trouvée';
    }, [meetings]);

    const getClientName = useCallback((clientId) => {
        const client = getUniqueClients.find(c => c.id === clientId);
        return client ? `${client.firstname} ${client.lastname}` : 'Client non trouvé';
    }, [getUniqueClients]);

    const getFormattedDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to format description with bullet points and line breaks
    const formatDescription = (description) => {
        if (!description) return null;

        // Split by new lines
        const lines = description.split('\n');

        return lines.map((line, index) => {
            // Check if line starts with - or * for bullet points
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return (
                    <div key={index} className="flex items-start gap-2 mb-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span className="text-gray-700 flex-1">{line.trim().substring(1).trim()}</span>
                    </div>
                );
            }
            // Check if line starts with number for numbered list
            else if (line.trim().match(/^\d+\./)) {
                return (
                    <div key={index} className="flex items-start gap-2 mb-2">
                        <span className="text-indigo-500 font-medium mt-0.5">{line.trim().split('.')[0]}.</span>
                        <span className="text-gray-700 flex-1">{line.trim().substring(line.trim().indexOf('.') + 1).trim()}</span>
                    </div>
                );
            }
            // Empty line
            else if (line.trim() === '') {
                return <div key={index} className="h-2"></div>;
            }
            // Regular text
            else {
                return (
                    <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                        {line}
                    </p>
                );
            }
        });
    };

    // Function to get preview text (first 100 characters)
    const getPreviewText = (description) => {
        if (!description) return '';
        const text = description.replace(/\n/g, ' ');
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedNotes = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const calculateStats = () => {
        const totalNotes = notes.length;
        const totalClients = getUniqueClients.length;
        const totalMeetings = meetings.length;
        const avgNotesPerClient = totalClients > 0 ? Math.round(totalNotes / totalClients) : 0;
        const recentNotes = notes.filter(note => {
            const daysOld = (new Date() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
            return daysOld <= 7;
        }).length;

        return { totalNotes, totalClients, totalMeetings, avgNotesPerClient, recentNotes };
    };

    const stats = calculateStats();

    if (loading && notes.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Mes Notes</h1>
                                <p className="text-gray-600 mt-2">Gérez vos notes personnelles et professionnelles</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nouvelle Note
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total des notes</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalNotes}</p>
                                    <p className="text-xs text-indigo-600 mt-2">Notes enregistrées</p>
                                </div>
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Clients associés</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
                                    <p className="text-xs text-green-600 mt-2">Clients uniques</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total des réunions</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalMeetings}</p>
                                    <p className="text-xs text-purple-600 mt-2">Réunions disponibles</p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Moyenne par client</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgNotesPerClient}</p>
                                    <p className="text-xs text-blue-600 mt-2">Notes par client</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Notes récentes</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.recentNotes}</p>
                                    <p className="text-xs text-yellow-600 mt-2">7 derniers jours</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                placeholder="Rechercher une note par titre ou description..."
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

                    {/* Notes Cards Grid */}
                    {paginatedNotes.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {paginatedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-indigo-200"
                                        style={{
                                            background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
                                        }}
                                    >
                                        {/* Sheet-like design with subtle fold effect */}
                                        <div className="relative">
                                            {/* Decorative top line like a notebook */}
                                            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                                                            {note.title}
                                                        </h3>
                                                        {/* Subtle date indicator */}
                                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {getFormattedDate(note.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleView(note)}
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                                            title="Voir"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(note)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                            title="Modifier"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                            title="Supprimer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Description preview with styled text */}
                                                <div className="text-gray-600 text-sm mb-4 leading-relaxed">
                                                    {getPreviewText(note.description)}
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {note.client && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {getClientName(note.client)}
                                                        </span>
                                                    )}
                                                    {note.meeting && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {getMeetingSummary(note.meeting)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Footer with view button */}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleView(note)}
                                                        className="w-full text-center text-indigo-600 hover:text-indigo-800 font-medium text-sm py-1 transition-colors"
                                                    >
                                                        Lire la note complète →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <p className="text-sm text-gray-500">
                                            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredNotes.length)} sur {filteredNotes.length} notes
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
                                                        onClick={() => handlePageChange(page)}
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
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="flex flex-col items-center">
                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <p className="text-gray-500 text-lg mb-2">Aucune note trouvée</p>
                                <p className="text-gray-400 mb-4">Commencez par créer votre première note</p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Créer une note
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal for Create/Edit Note - Fixed background */}
            {showModal && (
                <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={handleCloseModal}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingNote ? 'Modifier la note' : 'Nouvelle note'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Entrez le titre de la note"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="8"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm transition-colors"
                                        placeholder="Entrez la description détaillée de la note&#10;Utilisez - ou * pour les puces&#10;Exemple:&#10;- Premier point important&#10;- Deuxième point important"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Astuce: Utilisez &quot;-&quot; ou &quot;*&quot; au début d'une ligne pour créer des puces
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Client
                                    </label>
                                    <select
                                        name="client"
                                        value={formData.client}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="">Sélectionnez un client (optionnel)</option>
                                        {getUniqueClients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.firstname} {client.lastname}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Réunion
                                    </label>
                                    <select
                                        name="meeting"
                                        value={formData.meeting}
                                        onChange={handleInputChange}
                                        disabled={!formData.client}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <option value="">Sélectionnez une réunion (optionnel)</option>
                                        {filteredMeetings.map(meeting => (
                                            <option key={meeting.id} value={meeting.id}>
                                                {meeting.summary || 'Sans titre'}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.client && filteredMeetings.length === 0 && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            Aucune réunion trouvée pour ce client
                                        </p>
                                    )}
                                    {!formData.client && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Sélectionnez d'abord un client pour voir ses réunions
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {editingNote ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Note Modal - Fixed background with formatted description */}
            {showViewModal && viewingNote && (
                <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={handleCloseViewModal}>
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{viewingNote.title}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {viewingNote.client && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Client: {getClientName(viewingNote.client)}
                                            </span>
                                        )}
                                        {viewingNote.meeting && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Réunion: {getMeetingSummary(viewingNote.meeting)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseViewModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                                    <div className="prose prose-sm max-w-none">
                                        {formatDescription(viewingNote.description)}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Créée le: {getFormattedDate(viewingNote.createdAt)}
                                    </span>
                                    {viewingNote.updatedAt !== viewingNote.createdAt && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Dernière modification: {getFormattedDate(viewingNote.updatedAt)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        handleCloseViewModal();
                                        handleEdit(viewingNote);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={handleCloseViewModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotesPage;