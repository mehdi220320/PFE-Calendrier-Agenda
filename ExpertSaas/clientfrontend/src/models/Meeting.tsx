export interface Meeting {
    id: string;
    summary: string | null;
    creator: string;
    expert: string;
    description: string | null;
    date: string | Date;
    slotDuration: number;
    meetingLink: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    deletedAt?: string | Date | null;
}

export interface CreateMeetingData {
    creator: string;
    summary?: string;
    expertId: string;
    description?: string;
    date: Date | string;
    slotDuration?: number;
}

export interface MeetingResponse {
    meeting: Meeting;
    message: string;
}

export interface MeetingsResponse {
    meetings: Meeting[];
    message: string;
}