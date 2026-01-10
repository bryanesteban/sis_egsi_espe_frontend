'use client';

import { useState } from 'react';
import { CheckSquare, Clock, CheckCircle, XCircle, AlertTriangle, FileText, User, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';

interface Solicitud {
  id: number;
  tipo: string;
  titulo: string;
  solicitante: string;
  fecha: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  prioridad: 'alta' | 'media' | 'baja';
  descripcion: string;
}

export default function AprobadorPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    { id: 1, tipo: 'Política', titulo: 'Actualización de Política de Acceso', solicitante: 'Carlos García', fecha: '2026-01-10', estado: 'pendiente', prioridad: 'alta', descripcion: 'Actualización de los controles de acceso según ISO 27001' },
    { id: 2, tipo: 'Documento', titulo: 'Manual de Respuesta a Incidentes', solicitante: 'María López', fecha: '2026-01-09', estado: 'pendiente', prioridad: 'media', descripcion: 'Nuevo manual para gestión de incidentes de seguridad' },
    { id: 3, tipo: 'Cambio', titulo: 'Modificación de Roles de Usuario', solicitante: 'Juan Pérez', fecha: '2026-01-08', estado: 'pendiente', prioridad: 'baja', descripcion: 'Reasignación de permisos para el equipo de desarrollo' },
    { id: 4, tipo: 'Política', titulo: 'Política de Backup', solicitante: 'Ana Martínez', fecha: '2026-01-07', estado: 'aprobado', prioridad: 'alta', descripcion: 'Nueva política de respaldos y recuperación' },
    { id: 5, tipo: 'Documento', titulo: 'Informe de Riesgos Q4', solicitante: 'Pedro Sánchez', fecha: '2026-01-05', estado: 'rechazado', prioridad: 'media', descripcion: 'Informe trimestral de evaluación de riesgos' },
  ]);

  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  const handleAprobar = (id: number) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, estado: 'aprobado' as const } : s));
    setSelectedSolicitud(null);
  };

  const handleRechazar = (id: number) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, estado: 'rechazado' as const } : s));
    setSelectedSolicitud(null);
  };

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const aprobadas = solicitudes.filter(s => s.estado === 'aprobado');
  const rechazadas = solicitudes.filter(s => s.estado === 'rechazado');

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'media': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'baja': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'aprobado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rechazado': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'APPROVER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            Panel de Aprobaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las solicitudes pendientes de aprobación
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendientes.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{aprobadas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aprobadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rechazadas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rechazadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Solicitudes Pendientes de Aprobación
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendientes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No hay solicitudes pendientes</p>
              </div>
            ) : (
              pendientes.map((solicitud) => (
                <div key={solicitud.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPrioridadColor(solicitud.prioridad)}`}>
                          {solicitud.prioridad.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          {solicitud.tipo}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{solicitud.titulo}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{solicitud.descripcion}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {solicitud.solicitante}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {solicitud.fecha}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAprobar(solicitud.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(solicitud.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Historial de Solicitudes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Solicitud</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...aprobadas, ...rechazadas].map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{solicitud.titulo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {solicitud.solicitante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {solicitud.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${
                        solicitud.estado === 'aprobado'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {getEstadoIcon(solicitud.estado)}
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
