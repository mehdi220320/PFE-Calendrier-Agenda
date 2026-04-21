import React, { useState, useRef, useEffect } from 'react';
import NoteForm from '../pages/note/NoteForm.tsx';
import { NoteService } from '../services/noteService.tsx';
import DOMPurify from 'dompurify';

interface FloatingNoteButtonProps {
    onNoteCreated: () => void;
    meetings: any[];
    uniqueClients: any[];
    fetchMeetings: () => void;
}

const FloatingNoteButton: React.FC<FloatingNoteButtonProps> = ({
                                                                   onNoteCreated,
                                                                   meetings,
                                                                   uniqueClients,
                                                                   fetchMeetings
                                                               }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client: '',
        meeting: '',
        alarmAt: null
    });
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [viewingNote, setViewingNote] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            if (activeTab === 'view') {
                fetchNotes(1);
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, activeTab]);

    const fetchNotes = async (page: number) => {
        setLoading(true);
        try {
            const data = await NoteService.getMyNotesByPage(page);
            setNotes(data.notes || []);
            setCurrentPage(data.currentPage);
            setTotalPages(Math.ceil(data.totalNotes / 5));
            setHasMore(data.hasMore);
        } catch (err) {
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sanitize and render HTML content
    const renderRichText = (htmlContent: string) => {
        if (!htmlContent) return <p className="text-gray-400 italic">Aucune description</p>;

        const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
                'span', 'div', 'mark', 'a'
            ],
            ALLOWED_ATTR: ['href', 'target', 'class', 'style', 'color'],
            ALLOW_DATA_ATTR: false
        });

        return (
            <div
                className="rich-text-content prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        );
    };

    // Strip HTML for preview (line clamp)
    const stripHtml = (html: string) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    const getAlarmDate = (alarmAt) => {
        if (!alarmAt) return null;
        const date = new Date(alarmAt);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isAlarmUpcoming = (alarmAt) => {
        if (!alarmAt) return false;
        const alarmDate = new Date(alarmAt);
        const now = new Date();
        return alarmDate > now;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'client' && { meeting: '' })
        }));

        if (name === 'client' && value) {
            const clientMeetings = meetings.filter(meeting =>
                meeting.creatorUser?.id === value
            );
            setFilteredMeetings(clientMeetings);
        } else if (name === 'client' && !value) {
            setFilteredMeetings([]);
        }
    };

    const handleDescriptionChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            description: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = {
                title: formData.title,
                description: formData.description,
                client: formData.client === '' ? null : formData.client,
                meeting: formData.meeting === '' ? null : formData.meeting,
                alarmAt: formData.alarmAt
            };

            if (editingNote) {
                console.log('Updating note:', editingNote.id, submitData);
                await NoteService.editNote(editingNote.id, submitData);
                await fetchNotes(currentPage);
                setEditingNote(null);
                setActiveTab('view');
                setFormData({
                    title: '',
                    description: '',
                    client: '',
                    meeting: '',
                    alarmAt: null
                });
            } else {
                console.log('Creating new note:', submitData);
                await NoteService.addNote(submitData);
                onNoteCreated();
                setFormData({
                    title: '',
                    description: '',
                    client: '',
                    meeting: '',
                    alarmAt: null
                });
                setIsOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSubmit:', err);
            setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            description: note.description,
            client: note.client || '',
            meeting: note.meeting || '',
            alarmAt: note.alarmAt || null
        });
        setActiveTab('create');
        setViewingNote(null);
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            try {
                await NoteService.deleteNote(id);
                await fetchNotes(currentPage);
                if (viewingNote?.id === id) {
                    setViewingNote(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
            }
        }
    };

    const handleViewNote = (note) => {
        setViewingNote(viewingNote?.id === note.id ? null : note);
    };

    const handleClose = () => {
        setIsOpen(false);
        setActiveTab('create');
        setFormData({
            title: '',
            description: '',
            client: '',
            meeting: '',
            alarmAt: null
        });
        setEditingNote(null);
        setViewingNote(null);
        setError(null);
    };

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

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            fetchNotes(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (hasMore) {
            fetchNotes(currentPage + 1);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Dropup Popup */}
            {isOpen && (
                <div
                    ref={popupRef}
                    className="absolute bottom-16 right-0 mb-2 w-[500px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-slide-up"
                >
                    {/* Header with Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => {
                                    setActiveTab('create');
                                    setEditingNote(null);
                                    setViewingNote(null);
                                    setFormData({
                                        title: '',
                                        description: '',
                                        client: '',
                                        meeting: '',
                                        alarmAt: null
                                    });
                                    setError(null);
                                }}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'create'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                ✏️ Nouvelle note
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('view');
                                    setEditingNote(null);
                                    setViewingNote(null);
                                    fetchNotes(1);
                                }}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'view'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📋 Voir les notes
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[540px] overflow-y-auto">
                        {activeTab === 'create' && (
                            <div className="p-4">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {editingNote && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-600 text-sm">✏️ Modification de la note: {editingNote.title}</p>
                                    </div>
                                )}

                                <NoteForm
                                    formData={formData}
                                    editingNote={editingNote}
                                    filteredMeetings={filteredMeetings}
                                    uniqueClients={uniqueClients}
                                    onInputChange={handleInputChange}
                                    onSubmit={handleSubmit}
                                    onCancel={() => {
                                        if (editingNote) {
                                            setEditingNote(null);
                                            setFormData({
                                                title: '',
                                                description: '',
                                                client: '',
                                                meeting: '',
                                                alarmAt: null
                                            });
                                        } else {
                                            handleClose();
                                        }
                                    }}
                                    onDescriptionChange={handleDescriptionChange}
                                />
                            </div>
                        )}

                        {activeTab === 'view' && (
                            <div className="p-4">
                                {loading && notes.length === 0 ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : notes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Aucune note trouvée</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {notes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 text-lg">{note.title}</h4>
                                                            {/* Alarm indicator with tooltip */}
                                                            {note.alarmAt && (
                                                                <div className="relative group inline-block mt-1">
                                                                    <div className={`flex items-center gap-1 text-xs ${isAlarmUpcoming(note.alarmAt) ? 'text-orange-500' : 'text-gray-400'}`}>
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                        </svg>
                                                                        <span>Rappel</span>
                                                                    </div>
                                                                    <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                                        {getAlarmDate(note.alarmAt)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleViewNote(note)}
                                                                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
                                                                title="Voir"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditNote(note)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
                                                                title="Modifier"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
                                                                title="Supprimer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {viewingNote?.id === note.id ? (
                                                        <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                                            {renderRichText(note.description)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-600 line-clamp-3">
                                                            {renderRichText(note.description)}
                                                        </div>
                                                    )}

                                                    <div className="mt-3 pt-2 text-xs text-gray-400 border-t border-gray-100">
                                                        📅 {getFormattedDate(note.createdAt)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                        currentPage === 1
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    ← Précédent
                                                </button>
                                                <span className="text-sm text-gray-500">
                                                    Page {currentPage} / {totalPages}
                                                </span>
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={!hasMore}
                                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                        !hasMore
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Suivant →
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-full p-4 shadow-lg transition-all duration-300 group ${
                    isOpen
                        ? 'bg-blue-100 text-indigo-600 shadow-blue-200 hover:bg-blue-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'
                }`}
                style={{
                    boxShadow: isOpen ? '0 4px 15px rgba(59, 130, 246, 0.2)' : '0 4px 15px rgba(0,0,0,0.2)'
                }}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        </div>
    );
};

export default FloatingNoteButton;