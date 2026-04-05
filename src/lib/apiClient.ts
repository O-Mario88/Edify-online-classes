/**
 * API Client for Edify Backend
 * Handles all HTTP requests to the Django REST API
 * Includes JWT token management and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V1 = '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: `${API_BASE_URL}${API_V1}/auth/register/`,
  AUTH_LOGIN: `${API_BASE_URL}${API_V1}/auth/token/`,
  AUTH_REFRESH: `${API_BASE_URL}${API_V1}/auth/token/refresh/`,
  
  // Curriculum
  COUNTRIES: `${API_BASE_URL}${API_V1}/curriculum/countries/`,
  SUBJECTS: `${API_BASE_URL}${API_V1}/curriculum/subjects/`,
  CLASS_LEVELS: `${API_BASE_URL}${API_V1}/curriculum/class-levels/`,
  TOPICS: `${API_BASE_URL}${API_V1}/curriculum/topics/`,
  
  // Institutions
  INSTITUTIONS: `${API_BASE_URL}${API_V1}/institutions/`,
  INSTITUTION_MEMBERSHIPS: `${API_BASE_URL}${API_V1}/institution-memberships/`,
  
  // Marketplace
  LISTINGS: `${API_BASE_URL}${API_V1}/marketplace/listings/`,
  PAYOUTS: `${API_BASE_URL}${API_V1}/marketplace/payouts/`,
  
  // Live Sessions
  LIVE_SESSIONS: `${API_BASE_URL}${API_V1}/live-sessions/live-session/`,
  SESSION_REMINDERS: `${API_BASE_URL}${API_V1}/live-sessions/session-reminder/`,
  
  // Assessments
  ASSESSMENTS: `${API_BASE_URL}${API_V1}/assessments/assessment/`,
  ASSESSMENT_WINDOWS: `${API_BASE_URL}${API_V1}/assessments/assessment-window/`,
  SUBMISSIONS: `${API_BASE_URL}${API_V1}/assessments/submission/`,
  
  // Classes
  CLASSES: `${API_BASE_URL}${API_V1}/classes/`,
  CLASS_ENROLLMENTS: `${API_BASE_URL}${API_V1}/class-enrollments/`,
  
  // Lessons
  LESSONS: `${API_BASE_URL}${API_V1}/lessons/lesson/`,
  LESSON_NOTES: `${API_BASE_URL}${API_V1}/lessons/lesson-note/`,
  LESSON_RECORDINGS: `${API_BASE_URL}${API_V1}/lessons/lesson-recording/`,
  LESSON_ATTENDANCE: `${API_BASE_URL}${API_V1}/lessons/lesson-attendance/`,
  
  // Resources
  RESOURCES: `${API_BASE_URL}${API_V1}/resources/resource/`,
  
  // Discussions
  THREADS: `${API_BASE_URL}${API_V1}/discussions/thread/`,
  POSTS: `${API_BASE_URL}${API_V1}/discussions/post/`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}${API_V1}/notifications/notification/`,
  
  // Dashboards
  STUDENT_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/student-dashboard/`,
  TEACHER_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/teacher-dashboard/`,
  PARENT_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/parent-dashboard/`,
  ADMIN_DASHBOARD: `${API_BASE_URL}${API_V1}/analytics/admin-dashboard/`,
};

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

/**
 * Get JWT tokens from localStorage
 */
export const getStoredTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return { accessToken, refreshToken };
};

/**
 * Store JWT tokens in localStorage
 */
export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Refresh JWT token using refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = getStoredTokens();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.access;
      storeTokens(newAccessToken, refreshToken);
      return newAccessToken;
    } else {
      // Refresh token expired, clear all tokens
      clearTokens();
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Make an API request with JWT token
 */
export const apiRequest = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const { accessToken } = getStoredTokens();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired, try refresh
    if (response.status === 401 && accessToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return { data: data as T };
        } else if (retryResponse.status === 401) {
          // Still 401 after refresh, redirect to login
          clearTokens();
          window.location.href = '/login';
          return { data: null as unknown as T, error: { status: 401, message: 'Unauthorized' } };
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login';
        return { data: null as unknown as T, error: { status: 401, message: 'Session expired' } };
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null as unknown as T,
        error: {
          status: response.status,
          message: response.statusText,
          data: errorData,
        },
      };
    }

    const data = await response.json();
    return { data: data as T };
  } catch (error) {
    console.error('API request error:', error);
    return {
      data: null as unknown as T,
      error: {
        status: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * GET request
 */
export const apiGet = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'GET' });
};

/**
 * POST request
 */
export const apiPost = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = async <T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'DELETE' });
};

/**
 * Register new user
 */
export const registerUser = async (userData: {
  email: string;
  full_name: string;
  password: string;
  country_code: string;
  role: 'student' | 'teacher' | 'institution' | 'admin';
}) => {
  return apiPost(API_ENDPOINTS.AUTH_REGISTER, userData);
};

/**
 * Login user and get JWT tokens
 */
export const loginUser = async (email: string, password: string) => {
  const response = await apiPost<{ access: string; refresh: string }>(
    API_ENDPOINTS.AUTH_LOGIN,
    { email, password }
  );

  if (response.data) {
    storeTokens(response.data.access, response.data.refresh);
  }

  return response;
};

/**
 * Logout user by clearing tokens
 */
export const logoutUser = () => {
  clearTokens();
  window.location.href = '/login';
};

/**
 * Format paginated response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch paginated results with automatic page concatenation
 */
export const fetchAllPaginated = async <T = unknown>(
  url: string,
  maxPages?: number
): Promise<T[]> => {
  const results: T[] = [];
  let page = 1;
  let hasMore = true;
  const pageLimit = maxPages || 10;

  while (hasMore && page <= pageLimit) {
    const pageUrl = url.includes('?')
      ? `${url}&page=${page}`
      : `${url}?page=${page}`;

    const response = await apiGet<PaginatedResponse<T>>(pageUrl);

    if (response.data?.results) {
      results.push(...response.data.results);
      hasMore = !!response.data.next;
      page++;
    } else {
      hasMore = false;
    }
  }

  return results;
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  request: apiRequest,
  registerUser,
  loginUser,
  logoutUser,
  getStoredTokens,
  storeTokens,
  clearTokens,
  refreshAccessToken,
  endpoints: API_ENDPOINTS,
};
