export interface WorkingHours {
    id?: string;
    userId: string;
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    slotDuration: number;
}

export interface WorkingHoursFormData {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    slotDuration: number;
}
export interface BlockedSlot {
    id?: string;
    userId: string;
    startDayDate: string;
    endDayDate: string;
    startDateTime: string;
    endDateTime: string;
    reason?: string;
}

export interface BlockedSlotFormData {
    startDayDate: string;
    endDayDate: string;
    startDateTime: string;
    endDateTime: string;
    reason: string;
}

export interface Break {
    id?: string;
    userId: string;
    startAt: string; // Format HH:mm
    endAt: string; // Format HH:mm
}

export interface BreakFormData {
    startAt: string;
    endAt: string;
}
export interface DisponibilityData {
    blockSlots: BlockedSlot[];
    workinghours: WorkingHours | null;
    break: Break | null;
}

export interface TimeSlot {
    date: Date;
    hour: number;
    minute: number;
    status: 'disponible' | 'pause' | 'bloque' | 'hors-service';
    reason?: string;
}

export interface DayDisponibility {
    date: Date;
    dayOfWeek: number;
    isWorkingDay: boolean;
    slots: TimeSlot[];
}

export interface ApiResponse<T = any> {
    message: string;
    result?: boolean;
    workingHours?: WorkingHours;
    blockedSlot?: BlockedSlot;
    blockedSlotId?: string;
}

