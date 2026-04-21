export interface ProgressBreakdown {
    profile: {
        progress: number;
        weight: string;
        completed: boolean;
        fieldsCovered?: string[];
    };
    availability: {
        progress: number;
        weight: string;
        completed: boolean;
        daysConfigured?: number;
        slotDuration?: number;
    };
    breakTimes: {
        progress: number;
        weight: string;
        completed: boolean;
        configured?: boolean;
    };
    overrides: {
        progress: number;
        weight: string;
        completed: boolean;
        count?: number;
    };
}

export interface ProgressWarning {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    message: string;
    action: string | null;
    progress?: number;
    [key: string]: any; // For dynamic fields like daysOfWeek, dateRange, etc.
}

export interface NextStep {
    id: string;
    action: string;
}

export interface AccountProgress {
    totalProgress: number;
    setupStatus: 'complete' | 'almost-complete' | 'in-progress' | 'incomplete';
    breakdown: ProgressBreakdown;
    warnings: ProgressWarning[];
    criticalBlockers: boolean;
    nextSteps?: NextStep[];
}