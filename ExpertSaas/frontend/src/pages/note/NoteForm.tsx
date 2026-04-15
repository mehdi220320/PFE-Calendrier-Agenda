import React from 'react';

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
}

interface NoteFormProps {
    formData: FormData;
    editingNote: any;
    filteredMeetings: Meeting[];
    uniqueClients: Client[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
                                               formData,
                                               editingNote,
                                               filteredMeetings,
                                               uniqueClients,
                                               onInputChange,
                                               onSubmit,
                                               onCancel,
                                           }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onInputChange}
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
                    onChange={onInputChange}
                    required
                    rows={8}
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
                    onChange={onInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                    <option value="">Sélectionnez un client (optionnel)</option>
                    {uniqueClients.map(client => (
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
                    onChange={onInputChange}
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
                    onClick={onCancel}
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
    );
};

export default NoteForm;