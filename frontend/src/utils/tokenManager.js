// Token management utilities

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenExpiringSoon = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return (expirationTime - currentTime) < fiveMinutes;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;

    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get user from token
 */
export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      role: payload.role,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
};

