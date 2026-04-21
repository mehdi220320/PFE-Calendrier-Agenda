export interface Reclamation {
    id: string;
    title: string;
    description: string;
    user: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'service' | 'other';
    picture: string | null;
    date: string;
    adminResponse: string | null;
    adminResponsePicture: string | null;
    adminResponseDate: string | null;
    respondedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
};

export const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

export const categoryIcons = {
    technical: '🔧',
    billing: '💰',
    service: '⭐',
    other: '📝'
};