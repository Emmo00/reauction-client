import { APIClient, queryKeys } from "./client";
import type { Waitlist } from "@/types";

// Response types for waitlist API
export interface WaitlistResponse {
  message: string;
  entry: Waitlist;
}

export interface WaitlistRecordsResponse {
  records: Waitlist[];
}

export interface WaitlistCountResponse {
  count: number;
}

export interface WaitlistStatsResponse {
  total: number;
  allowed: number;
  notAllowed: number;
}

export interface JoinWaitlistRequest {
  fid: string;
  username: string;
}

/**
 * Waitlist API helper functions
 */
export const waitlistAPI = {
  /**
   * Add a user to the waitlist
   */
  async joinWaitlist(data: JoinWaitlistRequest): Promise<WaitlistResponse> {
    return APIClient.post<WaitlistResponse>("/waitlist", data);
  },

  /**
   * Get all waitlist records
   */
  async getAllRecords(): Promise<WaitlistRecordsResponse> {
    return APIClient.get<WaitlistRecordsResponse>("/waitlist?action=all");
  },

  /**
   * Get total count of users on waitlist
   */
  async getCount(): Promise<WaitlistCountResponse> {
    return APIClient.get<WaitlistCountResponse>("/waitlist?action=count");
  },

  /**
   * Get count of allowed users
   */
  async getAllowedCount(): Promise<WaitlistCountResponse> {
    return APIClient.get<WaitlistCountResponse>("/waitlist?action=allowed-count");
  },

  /**
   * Get count of not allowed users
   */
  async getNotAllowedCount(): Promise<WaitlistCountResponse> {
    return APIClient.get<WaitlistCountResponse>("/waitlist?action=not-allowed-count");
  },

  /**
   * Get all waitlist statistics
   */
  async getStats(): Promise<WaitlistStatsResponse> {
    return APIClient.get<WaitlistStatsResponse>("/waitlist?action=stats");
  },
};

/**
 * Add waitlist to query keys
 */
export const waitlistQueryKeys = {
  all: ['waitlist'] as const,
  records: () => [...waitlistQueryKeys.all, 'records'] as const,
  count: () => [...waitlistQueryKeys.all, 'count'] as const,
  allowedCount: () => [...waitlistQueryKeys.all, 'allowed-count'] as const,
  notAllowedCount: () => [...waitlistQueryKeys.all, 'not-allowed-count'] as const,
  stats: () => [...waitlistQueryKeys.all, 'stats'] as const,
} as const;
