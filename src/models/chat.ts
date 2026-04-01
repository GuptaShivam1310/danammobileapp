export interface ChatMessage {
    _id: string;
    chatId: string;
    senderId: string;
    text: string;
    imageUri?: string;
    type: 'text' | 'image' | 'document' | 'pdf' | 'doc';
    createdAt: string; // ISO string

    // Support for Document attachments
    documentUri?: string;
    documentName?: string;
    documentType?: string;
    documentSize?: string;

    // New fields as per request
    fileName?: string;
    fileUri?: string;
    mimeType?: string;
}
