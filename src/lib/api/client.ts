/**
 * Base API configuration
 */
const API_BASE = '/api';

/**
 * Generic API error class
 */
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic API client with error handling
 */
export class APIClient {
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(
          response.status,
          data.error || `Request failed with status ${response.status}`
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  collectibleStatus: {
    all: ['collectible-status'] as const,
    byAddress: (address: string) => [...queryKeys.collectibleStatus.all, address] as const,
  },
  farcasterAddress: {
    all: ['farcaster-address'] as const,
    byFid: (fid: number) => [...queryKeys.farcasterAddress.all, fid] as const,
  },
} as const;