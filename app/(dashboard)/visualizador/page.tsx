'use client';

import { Eye, FileText, BarChart3, Shield, Clock, CheckCircle } from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';

export default function VisualizadorPage() {
  const documentos = [
    { id: 1, nombre: 'Política de Seguridad v2.1', tipo: 'Política', fecha: '2026-01-08', estado: 'Vigente' },
    { id: 2, nombre: 'Manual de Procedimientos SGSI', tipo: 'Manual', fecha: '2026-01-05', estado: 'Vigente' },
    { id: 3, nombre: 'Informe de Auditoría Q4 2025', tipo: 'Informe', fecha: '2025-12-20', estado: 'Archivado' },
    { id: 4, nombre: 'Plan de Continuidad de Negocio', tipo: 'Plan', fecha: '2026-01-02', estado: 'Vigente' },
    { id: 5, nombre: 'Registro de Incidentes 2025', tipo: 'Registro', fecha: '2025-12-31', estado: 'Archivado' },
  ];

  const estadisticas = [
    { label: 'Documentos Disponibles', valor: 45, icon: FileText, color: 'bg-blue-500' },
    { label: 'Políticas Activas', valor: 12, icon: Shield, color: 'bg-green-500' },
    { label: 'Reportes Generados', valor: 28, icon: BarChart3, color: 'bg-purple-500' },
    { label: 'Últimas Actualizaciones', valor: 8, icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN', 'VIEWER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Panel de Visualización
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consulta documentos, políticas y reportes del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {estadisticas.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.valor}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Documentos Recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Documentos Recientes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                        {doc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {doc.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        doc.estado === 'Vigente'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {doc.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Modo de solo lectura
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Como visualizador, tienes acceso para consultar documentos y reportes. Para realizar modificaciones, contacta a un administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
