'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onRenew: () => void;
  onLogout: () => void;
  countdown: number;
}

export default function SessionTimeoutModal({
  isOpen,
  onRenew,
  onLogout,
  countdown,
}: SessionTimeoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-4 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 sm:p-3 rounded-full">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Sesión por Expirar</h3>
              <p className="text-white/90 text-xs sm:text-sm">Tu sesión está a punto de caducar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Countdown circle */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - countdown / 30)}`}
                  className="text-green-500 dark:text-green-400 transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
                  {countdown}
                </span>
              </div>
            </div>
            <p className="mt-3 sm:mt-4 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
              La sesión se cerrará en{' '}
              <span className="font-bold text-green-600 dark:text-green-400">{countdown}s</span>
            </p>
          </div>

          {/* Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              ¿Deseas renovar tu sesión o cerrar sesión?
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onRenew}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Renovar Sesión
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
