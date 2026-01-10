'use client';

import { AlertCircle, Plus, Search, Filter } from 'lucide-react';

export default function RiesgosPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            Gestión de Riesgos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Identifica y gestiona los riesgos de seguridad
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Riesgo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">Críticos</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">3</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Altos</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">5</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Medios</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">8</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">Bajos</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">12</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar riesgos..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
          <Filter className="w-5 h-5" />
          Filtrar
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay riesgos registrados
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comienza identificando tu primer riesgo de seguridad
          </p>
        </div>
      </div>
    </div>
  );
}
