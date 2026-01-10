'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, refreshToken as refreshTokenAction } from '../store/slices/authSlice';
import { authAPI } from '@/lib/api';

interface UseSessionManagerReturn {
  showModal: boolean;
  countdown: number;
  handleRenew: () => void;
  handleLogout: () => void;
}

// Decode JWT to get expiration time
function decodeJWT(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function useSessionManager(): UseSessionManagerReturn {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isRenewing, setIsRenewing] = useState(false);
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoLogoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoLogoutTimeoutRef.current) {
      clearTimeout(autoLogoutTimeoutRef.current);
      autoLogoutTimeoutRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    setShowModal(false);
    dispatch(logout());
  }, [dispatch, clearAllTimers]);

  const handleRenew = useCallback(async () => {
    if (isRenewing || !token) return;
    
    setIsRenewing(true);
    try {
      // Call refresh token endpoint
      const newToken = await authAPI.refreshToken(token);
      
      // Update token in Redux and localStorage
      dispatch(refreshTokenAction(newToken));
      
      setShowModal(false);
      setCountdown(30);
      clearAllTimers();
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    } finally {
      setIsRenewing(false);
    }
  }, [token, isRenewing, handleLogout, clearAllTimers, dispatch]);

  const startCountdown = useCallback(() => {
    setShowModal(true);
    setCountdown(30);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto logout after 30 seconds
    autoLogoutTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 30000);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      clearAllTimers();
      return;
    }

    // Check token expiration every 5 seconds
    const checkTokenExpiration = () => {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) {
        handleLogout();
        return;
      }

      const now = Date.now() / 1000; // Current time in seconds
      const timeUntilExpiry = decoded.exp - now;

      // Token already expired
      if (timeUntilExpiry <= 0) {
        handleLogout();
        return;
      }

      // Token expires in less than 30 seconds - show modal
      if (timeUntilExpiry <= 30 && !showModal) {
        startCountdown();
      }
    };

    // Initial check
    checkTokenExpiration();

    // Set interval to check every 5 seconds
    checkIntervalRef.current = setInterval(checkTokenExpiration, 5000);

    return () => {
      clearAllTimers();
    };
  }, [token, isAuthenticated, showModal, handleLogout, startCountdown, clearAllTimers]);

  return {
    showModal,
    countdown,
    handleRenew,
    handleLogout,
  };
}
