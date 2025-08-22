// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      // Clear corrupted session data
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData, userRole = 'admin') => {
    try {
      const enrichedUserData = {
        ...userData,
        role: userRole,
        loginTime: new Date().toISOString()
      };

      setUser(enrichedUserData);
      setIsAuthenticated(true);
      
      localStorage.setItem('user', JSON.stringify(enrichedUserData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userRole);
      
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all auth-related localStorage items
    const keysToRemove = [
      'user',
      'isAuthenticated',
      'userRole',
      'currentClassroom',
      'adminData'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return false;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }, [user]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Check if user is spectator
  const isSpectator = useCallback(() => {
    return hasRole('spectator');
  }, [hasRole]);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isSpectator
  };
};
