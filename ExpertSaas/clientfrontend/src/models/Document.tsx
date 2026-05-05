// models/Document.ts
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
        firstname: string;
        lastname: string;
        email: string;
    };
    receiverUser?: {
        id: string;
        firstname: string;
        lastname: string;
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