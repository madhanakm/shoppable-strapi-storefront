/**
 * Error handling utilities for API requests
 */

// Define common error types
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

// Error response interface
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: any;
  status?: number;
}

/**
 * Process API errors and categorize them
 */
export function handleApiError(error: any): ErrorResponse {
  console.error('API Error:', error);
  
  // Network errors (no connection)
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: error
    };
  }
  
  // Server errors (500 range)
  if (error.status && error.status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'The server encountered an error. Please try again later.',
      details: error.details || {},
      status: error.status
    };
  }
  
  // Authentication errors (401, 403)
  if (error.status === 401 || error.status === 403) {
    return {
      type: ErrorType.AUTH,
      message: error.status === 401 
        ? 'Authentication required. Please log in.' 
        : 'You do not have permission to access this resource.',
      details: error.details || {},
      status: error.status
    };
  }
  
  // Validation errors (400)
  if (error.status === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: 'Invalid request. Please check your input.',
      details: error.details || {},
      status: error.status
    };
  }
  
  // Not found errors (404)
  if (error.status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      details: error.details || {},
      status: error.status
    };
  }
  
  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred.',
    details: error.details || {},
    status: error.status
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ErrorResponse): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorType.SERVER:
      return 'The server encountered an error. Please try again later.';
    case ErrorType.AUTH:
      return error.status === 401 
        ? 'Please log in to continue.' 
        : 'You do not have permission to access this resource.';
    case ErrorType.VALIDATION:
      return 'There was an issue with your request. Please check your input.';
    case ErrorType.NOT_FOUND:
      return 'The requested information could not be found.';
    default:
      return 'Something went wrong. Please try again later.';
  }
}

/**
 * Log error to monitoring service (placeholder)
 */
export function logErrorToMonitoring(error: ErrorResponse): void {
  // This would connect to an error monitoring service like Sentry
  console.error('Error logged to monitoring:', error);
  
  // Example implementation:
  // if (window.Sentry) {
  //   window.Sentry.captureException(new Error(error.message), {
  //     extra: {
  //       type: error.type,
  //       details: error.details,
  //       status: error.status
  //     }
  //   });
  // }
}