export interface FileAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
}

export interface Document {
    id: string;
    title: string;
    description: string | null;
    summary: string | null;
    sender: string;
    receiver: string;
    files: FileAttachment[];
    status: 'pending' | 'sent' | 'received' | 'viewed';
    createdAt: Date;
    updatedAt: Date;
    senderUser?: {
        id: string;
        name: string;
        email: string;
    };
    documentsFiltres?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface DocumentResponse {
    message: string;
    document: Document;
}

export interface DocumentsListResponse {
    count: number;
    documents: Document[];
}

export interface AllDocumentsResponse {
    total: number;
    page: number;
    pages: number;
    documents: Document[];
}

export interface CreateDocumentData {
    title: string;
    description?: string;
    summary?: string;
    receiverId: string;
    files: File[];
}

export interface UpdateDocumentData {
    title?: string;
    description?: string;
    summary?: string;
}