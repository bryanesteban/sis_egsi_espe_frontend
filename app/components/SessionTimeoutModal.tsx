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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Sesión por Expirar</h3>
              <p className="text-white/90 text-sm">Tu sesión está a punto de caducar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Countdown circle */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - countdown / 30)}`}
                  className="text-orange-500 transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-800 dark:text-white">
                  {countdown}
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
              La sesión se cerrará automáticamente en{' '}
              <span className="font-bold text-orange-500">{countdown} segundos</span>
            </p>
          </div>

          {/* Message */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ¿Deseas renovar tu sesión para continuar trabajando o cerrar sesión?
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRenew}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Renovar Sesión
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
