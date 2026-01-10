'use client';

import { BarChart3, Download, Calendar } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
            Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Genera y visualiza reportes del sistema
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
          <Download className="w-5 h-5" />
          Exportar Reporte
        </button>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="bg-transparent text-gray-900 dark:text-white outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="bg-transparent text-gray-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reporte de Cumplimiento</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Estado actual de cumplimiento EGSI</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">75%</span>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reporte de Riesgos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Resumen de riesgos identificados</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-600">28</span>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reporte de Auditoría</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hallazgos de auditoría interna</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">12</span>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Selecciona un reporte para visualizar
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Haz clic en una de las tarjetas de arriba para ver el detalle
          </p>
        </div>
      </div>
    </div>
  );
}
