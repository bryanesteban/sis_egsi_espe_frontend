'use client';

import { Home, User, Shield } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-3xl flex items-center justify-center shadow-xl">
            <Home className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Bienvenido al Sistema SIEGSI
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Sistema de Implementación de Gobierno de Seguridad de la Información
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">Usuario</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{user?.username}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">Rol</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{user?.rolename}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">Estado</h3>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">Sesión Activa</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-2xl">
        <p className="text-green-800 dark:text-green-200 font-medium text-center">
          📌 Esta es la página Home. Usa el menú lateral para navegar por las diferentes secciones.
        </p>
      </div>
    </div>
  );
}
