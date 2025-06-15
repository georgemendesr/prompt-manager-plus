
/**
 * Checks if an error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
  // Check error message patterns that typically indicate network issues
  if (typeof error?.message === 'string') {
    const networkErrorPatterns = [
      'failed to fetch',
      'network error',
      'network request failed',
      'network',
      'internet',
      'connection',
      'timeout',
      'abort',
      'offline'
    ];
    
    const lowerCaseMessage = error.message.toLowerCase();
    
    for (const pattern of networkErrorPatterns) {
      if (lowerCaseMessage.includes(pattern)) {
        return true;
      }
    }
  }
  
  // Check specific error codes or types
  return !!(
    error?.code === 'ECONNABORTED' ||
    error?.name === 'AbortError' ||
    error?.name === 'NetworkError' ||
    error?.name === 'TimeoutError' ||
    error?.type === 'network' ||
    // NavigatorOffline API check result may be passed in custom errors
    error?.isOffline === true
  );
};
