import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Underline,
    Highlighter,
    Palette,
} from 'lucide-react';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';

interface Client {
    id: string;
    firstname: string;
    lastname: string;
}

interface Meeting {
    id: string;
    summary?: string;
    creatorUser?: { id: string };
}

interface FormData {
    title: string;
    description: string;
    client: string;
    meeting: string;
    alarmAt: string | null;
}

interface NoteFormProps {
    formData: FormData;
    editingNote: any;
    filteredMeetings: Meeting[];
    uniqueClients: Client[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
                                               formData,
                                               editingNote,
                                               filteredMeetings,
                                               uniqueClients,
                                               onInputChange,
                                               onDescriptionChange,
                                               onSubmit,
                                               onCancel,
                                           }) => {
    const [activeColorPicker, setActiveColorPicker] = useState(false);
    const isFirstRender = useRef(true);

    // Convert UTC date to local datetime-local format
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Adjust for timezone offset to show correct local time
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [alarmDateTime, setAlarmDateTime] = useState(() => formatDateForInput(formData.alarmAt));

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            TextStyle,
            Color,
            UnderlineExtension,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
            }),
            FontFamily,
            Placeholder.configure({
                placeholder: 'Entrez la description détaillée de la note...',
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: formData.description,
        onUpdate: ({ editor }) => {
            onDescriptionChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] p-4 custom-editor',
            },
        },
    });

    // Update editor content when formData.description changes (for edit mode)
    useEffect(() => {
        if (editor && !isFirstRender.current && formData.description !== editor.getHTML()) {
            editor.commands.setContent(formData.description);
        }
        isFirstRender.current = false;
    }, [editor, formData.description]);

    // Update alarmDateTime when formData.alarmAt changes (for edit mode)
    useEffect(() => {
        setAlarmDateTime(formatDateForInput(formData.alarmAt));
    }, [formData.alarmAt]);

    const handleAlarmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAlarmDateTime(value);
        // Convert local datetime to UTC ISO string for the server
        let isoValue = null;
        if (value) {
            // Create date from local datetime string
            const localDate = new Date(value);
            // Convert to UTC ISO string
            isoValue = localDate.toISOString();
        }
        // Create a synthetic event for onInputChange
        const syntheticEvent = {
            target: {
                name: 'alarmAt',
                value: isoValue
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
    };

    const ToolbarButton = ({ onClick, isActive, children, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

    const ColorPicker = () => {
        const colors = [
            '#000000', '#DC2626', '#059669', '#2563EB', '#D97706', '#7C3AED', '#DB2777',
            '#4B5563', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'
        ];

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setActiveColorPicker(!activeColorPicker)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeColorPicker
                            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title="Couleur du texte"
                >
                    <Palette size={18} />
                </button>
                {activeColorPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-30 flex flex-wrap gap-1 min-w-[160px]">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    editor?.chain().focus().setColor(color).run();
                                    setActiveColorPicker(false);
                                }}
                                className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={`Couleur ${color}`}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                editor?.chain().focus().unsetColor().run();
                                setActiveColorPicker(false);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 w-full text-center py-1 mt-1 border-t border-gray-100"
                        >
                            Réinitialiser
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                    placeholder="Entrez le titre de la note"
                />
            </div>

            {/* Description Field with Rich Text Editor */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 bg-white">
                    {editor && (
                        <div className="border-b border-gray-200 p-2 bg-gray-50/50 flex flex-wrap gap-1 sticky top-0 z-10">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                isActive={editor.isActive('bold')}
                                title="Gras (Ctrl+B)"
                            >
                                <Bold size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                isActive={editor.isActive('italic')}
                                title="Italique (Ctrl+I)"
                            >
                                <Italic size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                isActive={editor.isActive('underline')}
                                title="Souligné (Ctrl+U)"
                            >
                                <Underline size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                isActive={editor.isActive('strike')}
                                title="Barré (Ctrl+Shift+X)"
                            >
                                <Strikethrough size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                isActive={editor.isActive('highlight')}
                                title="Surligner"
                            >
                                <Highlighter size={18} />
                            </ToolbarButton>

                            <Divider />
                            <ColorPicker />
                            <Divider />

                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                isActive={editor.isActive({ textAlign: 'left' })}
                                title="Alignement gauche"
                            >
                                <AlignLeft size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                isActive={editor.isActive({ textAlign: 'center' })}
                                title="Centrer"
                            >
                                <AlignCenter size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                isActive={editor.isActive({ textAlign: 'right' })}
                                title="Alignement droit"
                            >
                                <AlignRight size={18} />
                            </ToolbarButton>

                            <Divider />

                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                isActive={editor.isActive('bulletList')}
                                title="Liste à puces"
                            >
                                <List size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                isActive={editor.isActive('orderedList')}
                                title="Liste numérotée"
                            >
                                <ListOrdered size={18} />
                            </ToolbarButton>

                            <Divider />

                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                isActive={editor.isActive('heading', { level: 1 })}
                                title="Titre 1"
                            >
                                <Heading1 size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={editor.isActive('heading', { level: 2 })}
                                title="Titre 2"
                            >
                                <Heading2 size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                isActive={editor.isActive('heading', { level: 3 })}
                                title="Titre 3"
                            >
                                <Heading3 size={18} />
                            </ToolbarButton>

                            <Divider />

                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                isActive={editor.isActive('blockquote')}
                                title="Citation"
                            >
                                <Quote size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                isActive={editor.isActive('codeBlock')}
                                title="Bloc de code"
                            >
                                <Code size={18} />
                            </ToolbarButton>

                            <Divider />

                            <ToolbarButton
                                onClick={() => editor.chain().focus().undo().run()}
                                isActive={false}
                                title="Annuler (Ctrl+Z)"
                            >
                                <Undo size={18} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().redo().run()}
                                isActive={false}
                                title="Rétablir (Ctrl+Y)"
                            >
                                <Redo size={18} />
                            </ToolbarButton>
                        </div>
                    )}

                    <EditorContent editor={editor} />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>💡 Astuce: Les titres et listes sont des éléments de bloc</span>
                    <span className="hidden sm:inline">⌨️ Ctrl+B | Ctrl+I | Ctrl+U | Ctrl+Z</span>
                </div>
            </div>

            {/* Alarm Field */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rappel
                    </div>
                </label>
                <input
                    type="datetime-local"
                    value={alarmDateTime}
                    onChange={handleAlarmChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Définissez une date et heure pour recevoir un rappel
                </p>
            </div>

            {/* Client Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client
                </label>
                <select
                    name="client"
                    value={formData.client}
                    onChange={onInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white cursor-pointer"
                >
                    <option value="">Sélectionnez un client (optionnel)</option>
                    {uniqueClients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.firstname} {client.lastname}
                        </option>
                    ))}
                </select>
            </div>

            {/* Meeting Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Réunion
                </label>
                <select
                    name="meeting"
                    value={formData.meeting}
                    onChange={onInputChange}
                    disabled={!formData.client}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                    <option value="">Sélectionnez une réunion (optionnel)</option>
                    {filteredMeetings.map(meeting => (
                        <option key={meeting.id} value={meeting.id}>
                            {meeting.summary || 'Sans titre'}
                        </option>
                    ))}
                </select>

                {formData.client && filteredMeetings.length === 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <span className="text-lg">⚠️</span>
                        <span>Aucune réunion trouvée pour ce client</span>
                    </div>
                )}
                {!formData.client && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-lg">ℹ️</span>
                        <span>Sélectionnez d'abord un client pour voir ses réunions</span>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                    {editingNote ? (
                        <span className="flex items-center gap-2">
                            ✏️ Mettre à jour
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            ✨ Créer
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default NoteForm;