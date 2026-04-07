// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
  provider?: 'google' | 'apple';
  providerToken?: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password?: string;
  firstName: string;
  language: 'en' | 'am' | 'es';
}

// Discovery filters
export interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  gender?: string;
  interests?: string[];
  minCompatibility?: number;
  hasAstrologyData?: boolean;
  mode?: 'self' | 'referral';
}
