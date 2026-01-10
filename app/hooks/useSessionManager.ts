'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, refreshToken as refreshTokenAction } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
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
    if (!token || typeof token !== 'string') {
      console.error('[decodeJWT] Token inválido:', token);
      return null;
    }
    
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('[decodeJWT] Token no tiene formato JWT válido');
      return null;
    }
    
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
  const countdownStartedRef = useRef(false);

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
    console.log('[SessionManager] Ejecutando logout');
    clearAllTimers();
    countdownStartedRef.current = false;
    setShowModal(false);
    dispatch(showToast({ message: 'Sesión expirada. Por favor inicia sesión nuevamente.', type: 'warning' }));
    dispatch(logout());
  }, [dispatch, clearAllTimers]);

  const handleRenew = useCallback(async () => {
    if (isRenewing || !token) return;
    
    setIsRenewing(true);
    try {
      console.log('[SessionManager] Renovando token...');
      // Call refresh token endpoint
      const response = await authAPI.refreshToken(token);
      
      // El backend devuelve { token: "..." } o directamente el token
      const newToken = typeof response === 'string' ? response : response.token;
      
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Token inválido recibido del servidor');
      }
      
      // Update token in Redux and localStorage
      dispatch(refreshTokenAction(newToken));
      
      console.log('[SessionManager] ✅ Token renovado exitosamente');
      dispatch(showToast({ message: 'Sesión renovada correctamente', type: 'success' }));
      setShowModal(false);
      setCountdown(30);
      countdownStartedRef.current = false;
      clearAllTimers();
    } catch (error) {
      console.error('Error refreshing token:', error);
      dispatch(showToast({ message: 'Error al renovar la sesión', type: 'error' }));
      handleLogout();
    } finally {
      setIsRenewing(false);
    }
  }, [token, isRenewing, handleLogout, clearAllTimers, dispatch]);

  const startCountdown = useCallback(() => {
    if (countdownStartedRef.current) {
      console.log('[SessionManager] Countdown ya iniciado, ignorando llamada duplicada');
      return;
    }
    
    console.log('[SessionManager] 🚨 Iniciando countdown de 30 segundos');
    countdownStartedRef.current = true;
    setShowModal(true);
    setCountdown(30);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev <= 1 ? 0 : prev - 1;
        console.log(`[SessionManager] ⏱️ Countdown: ${newValue}s`);
        if (prev <= 1) {
          console.log('[SessionManager] ⏰ Countdown terminado - Auto logout');
          handleLogout();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    // Auto logout after 30 seconds
    autoLogoutTimeoutRef.current = setTimeout(() => {
      console.log('[SessionManager] ⏰ Timeout de 30s alcanzado - Auto logout');
      handleLogout();
    }, 30000);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log('[SessionManager] No autenticado o sin token, timers detenidos');
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    console.log('[SessionManager] Iniciando monitoreo de sesión');

    // Check token expiration every 5 seconds
    const checkTokenExpiration = () => {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) {
        console.log('[SessionManager] Error decodificando token, cerrando sesión');
        handleLogout();
        return;
      }

      const now = Date.now() / 1000; // Current time in seconds
      const timeUntilExpiry = decoded.exp - now;
      const minutesLeft = Math.floor(timeUntilExpiry / 60);
      const secondsLeft = Math.floor(timeUntilExpiry % 60);

      console.log(`[SessionManager] Verificando token - Tiempo restante: ${minutesLeft}m ${secondsLeft}s`);

      // Token already expired
      if (timeUntilExpiry <= 0) {
        console.log('[SessionManager] Token expirado, cerrando sesión');
        handleLogout();
        return;
      }

      // Token expires in less than 30 seconds - show modal
      if (timeUntilExpiry <= 30 && !countdownStartedRef.current) {
        console.log('[SessionManager] ⚠️ Token por expirar, mostrando modal');
        startCountdown();
      }
    };

    // Initial check
    checkTokenExpiration();

    // Set interval to check every 5 seconds
    console.log('[SessionManager] Timer iniciado - verificando cada 5 segundos');
    checkIntervalRef.current = setInterval(checkTokenExpiration, 5000);

    return () => {
      console.log('[SessionManager] Limpiando timer de verificación');
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [token, isAuthenticated, handleLogout, startCountdown]);

  return {
    showModal,
    countdown,
    handleRenew,
    handleLogout,
  };
}
