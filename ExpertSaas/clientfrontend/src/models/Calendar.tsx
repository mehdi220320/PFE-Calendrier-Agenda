import type {Meeting} from "./Meeting.tsx";

export interface Availability {
    id?: string;
    userId: string;
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
    slotDuration: number;
}

export interface BlockedSlot {
    id?: string;
    userId: string;
    startDateTime: string;
    endDateTime: string;
    reason?: string;
}

export interface Break {
    id?: string;
    userId: string;
    startAt: string;
    endAt: string;
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

export interface DisponibilityData {
    blockSlots: BlockedSlot[];
    availability: Availability | null;
    break: Break | null;
    availabilityoverride: AvailabilityOverride [];
    meetings: Meeting[] ;
}

export interface AvailabilityOverride {
    id?: string;
    userId: string;
    day: string;
    workingTimes: WorkingInterval[];
}

export interface WorkingInterval {
    start: string;
    end: string;
}



