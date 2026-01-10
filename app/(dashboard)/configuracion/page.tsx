'use client';

import { Settings, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function ConfiguracionPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Personaliza tu experiencia en el sistema
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Perfil de Usuario</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actualiza tu información personal</p>
            </div>
          </div>
          <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Editar perfil →
          </button>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Apariencia</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tema actual: {theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
            >
              Cambiar tema
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configura tus preferencias de notificación</p>
            </div>
          </div>
          <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Configurar →
          </button>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cambia tu contraseña y configuración de seguridad</p>
            </div>
          </div>
          <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Configurar →
          </button>
        </div>

        {/* System */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Sistema</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configuración avanzada del sistema</p>
            </div>
          </div>
          <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Configurar →
          </button>
        </div>
      </div>
    </div>
  );
}
