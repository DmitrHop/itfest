/**
 * RAG API Service
 * Connects to the RAG backend for university-specific answers
 */

const RAG_API_URL = 'http://localhost:8000';

// Types matching the backend schema
export interface SourceDocument {
    id: number;
    name: string;
    city: string;
    category: string;
    relevance_score: number;
    programs: string;
    ent_score_range: string;
    contact_info: {
        email?: string;
        phone?: string;
        address?: string;
    };
}

export interface RAGResponse {
    answer: string;
    sources: SourceDocument[];
    processing_time: number;
    cached: boolean;
    timestamp: string;
}

export interface RAGError {
    detail: string;
}

/**
 * Send a query to the RAG API
 */
export async function queryRAG(
    question: string,
    filters?: {
        city?: string;
        category?: string;
        ent_min_score?: number;
        ent_max_score?: number;
    }
): Promise<RAGResponse> {
    const response = await fetch(`${RAG_API_URL}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            filters: filters || null,
            top_k: 5,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error: RAGError = await response.json();
        throw new Error(error.detail || 'RAG API error');
    }

    return response.json();
}

/**
 * Check RAG API health
 */
export async function checkRAGHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${RAG_API_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get available filter options
 */
export async function getFilterOptions(): Promise<{
    cities: string[];
    categories: string[];
    ent_score_range: { min: number; max: number };
} | null> {
    try {
        const response = await fetch(`${RAG_API_URL}/filters`);
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}
