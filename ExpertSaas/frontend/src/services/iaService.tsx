import axios from 'axios';
import { authService } from "./authservice.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/gemini/`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Types
export interface FileFromUrl {
    url: string;
    fileName: string;
}

export interface AnalysisResult {
    status: string;
    data?: {
        fileName: string;
        fileType: string;
        generatedAt: string;
        preview: string;
        fullText: string;
        analysis: {
            statistics: {
                totalCharacters: number;
                totalWords: number;
                totalLines: number;
                totalSentences: number;
                totalParagraphs: number;
                pageCount: number;
                averageWordLength: string;
                averageSentenceLength: string;
                estimatedReadingTime: string;
                detectedLanguage: string;
            };
            complexity: {
                score: string;
                level: string;
                index: string;
            };
            topKeywords: Array<{ word: string; count: number }>;
        };
        aiSummary: {
            summary: string;
            themes: string[];
            keyPoints: string[];
            documentType: string;
            sentiment: string;
        };
        metadata: any;
    };
    error?: string;
}

export interface BatchAnalysisResult {
    status: string;
    totalFiles: number;
    successful: number;
    failed: number;
    processingTime: string;
    results: Array<{
        status: string;
        fileName?: string;
        data?: any;
        error?: string;
    }>;
}

export interface ExtractTextResult {
    status: string;
    fileName: string;
    fileType: string;
    extractedText: string;
    pageCount: number;
    metadata: any;
}

export interface HealthStatus {
    status: string;
    timestamp: string;
    services: {
        server: string;
        geminiAI: string;
    };
    message: string;
}

export interface TestModelsResult {
    timestamp: string;
    totalTested: number;
    workingCount: number;
    failedCount: number;
    workingModels: Array<{
        model: string;
        type: string;
        status: string;
        responseTime: string;
        working: boolean;
    }>;
    failedModels: Array<{
        name: string;
        error: string;
    }>;
    recommendation: string;
}

export const iaService = {
    /**
     * Analyze a single file from Cloudinary URL
     * POST /from-url
     */
    async analyzeFromUrl(url: string, fileName: string): Promise<AnalysisResult> {
        try {
            const response = await api.post('/from-url', { url, fileName });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Batch analyze multiple files from Cloudinary URLs
     * POST /from-urls
     */
    async analyzeFromUrls(files: FileFromUrl[]): Promise<BatchAnalysisResult> {
        try {
            const response = await api.post('/from-urls', { files });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Upload and analyze a single local file
     * POST /upload
     */
    async uploadAndAnalyze(file: File): Promise<AnalysisResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Upload and analyze multiple local files
     * POST /batch
     */
    async uploadBatchAndAnalyze(files: File[]): Promise<BatchAnalysisResult> {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post('/batch', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Analyze raw text
     * POST /analyze
     */
    async analyzeText(text: string): Promise<AnalysisResult> {
        try {
            const response = await api.post('/analyze', text, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Extract text from local file without AI analysis
     * POST /extract
     */
    async extractText(file: File): Promise<ExtractTextResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Extract text from URL without AI analysis
     * POST /extract-from-url
     */
    async extractTextFromUrl(url: string, fileName: string): Promise<ExtractTextResult> {
        try {
            const response = await api.post('/extract-from-url', { url, fileName });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Get service health status
     * GET /health
     */
    async getHealth(): Promise<HealthStatus> {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Test available Gemini models
     * GET /test-models
     */
    async testModels(): Promise<TestModelsResult> {
        try {
            const response = await api.get('/test-models');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Get API documentation
     * GET /
     */
    async getDocumentation(): Promise<any> {
        try {
            const response = await api.get('/');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    },

    /**
     * Test endpoint with example Cloudinary files
     * POST /test
     */
    async testEndpoint(type: 'text' | 'docx'): Promise<any> {
        try {
            const response = await api.post('/test', { type });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { status: 'error', error: error.message };
        }
    }
};

// Export types for use in components
export type {
    FileFromUrl,
    AnalysisResult,
    BatchAnalysisResult,
    ExtractTextResult,
    HealthStatus,
    TestModelsResult
};