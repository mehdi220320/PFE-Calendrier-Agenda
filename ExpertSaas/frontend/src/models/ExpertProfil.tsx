export interface ExpertProfilData {
    bio?: string;
    expertId: string;
    category?: string;
    headline?: string;
    languages?: string[];
    socialLinks?: string[];
    competences?: string[];
    experience?: number;
}

export interface ExpertProfil {
    id: string;
    bio: string | null;
    expert: string;
    category: string | null;
    headline: string | null;
    languages: string[];
    socialLinks: string[];
    competences: string[];
    experience: number;
}