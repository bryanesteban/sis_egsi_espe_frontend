'use client';

import { useState } from 'react';
import { UserCircle, FileText, Send, Clock, CheckCircle, AlertCircle, Plus, Calendar, Briefcase, Target } from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  estado: 'pendiente' | 'en-progreso' | 'completada';
  prioridad: 'alta' | 'media' | 'baja';
}

interface Solicitud {
  id: number;
  tipo: string;
  titulo: string;
  fecha: string;
  estado: 'enviada' | 'aprobada' | 'rechazada' | 'pendiente';
}

export default function MiEspacioPage() {
  const [tareas, setTareas] = useState<Tarea[]>([
    { id: 1, titulo: 'Completar evaluación de riesgos', descripcion: 'Evaluar los riesgos del departamento de TI', fechaLimite: '2026-01-15', estado: 'en-progreso', prioridad: 'alta' },
    { id: 2, titulo: 'Revisar políticas de acceso', descripcion: 'Verificar cumplimiento de políticas actuales', fechaLimite: '2026-01-20', estado: 'pendiente', prioridad: 'media' },
    { id: 3, titulo: 'Actualizar documentación', descripcion: 'Documentar nuevos procedimientos de seguridad', fechaLimite: '2026-01-18', estado: 'pendiente', prioridad: 'baja' },
    { id: 4, titulo: 'Capacitación en seguridad', descripcion: 'Completar módulo de concientización', fechaLimite: '2026-01-12', estado: 'completada', prioridad: 'alta' },
  ]);

  const [solicitudes] = useState<Solicitud[]>([
    { id: 1, tipo: 'Acceso', titulo: 'Solicitud de acceso a sistema de backup', fecha: '2026-01-08', estado: 'pendiente' },
    { id: 2, tipo: 'Documento', titulo: 'Solicitud de política personalizada', fecha: '2026-01-05', estado: 'aprobada' },
    { id: 3, tipo: 'Cambio', titulo: 'Cambio de rol de usuario', fecha: '2026-01-03', estado: 'rechazada' },
  ]);

  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado !== 'completada').length;

  const getEstadoTareaColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'en-progreso': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pendiente': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getEstadoSolicitudColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'rechazada': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'pendiente': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'enviada': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const toggleTareaEstado = (id: number) => {
    setTareas(tareas.map(t => {
      if (t.id === id) {
        if (t.estado === 'pendiente') return { ...t, estado: 'en-progreso' as const };
        if (t.estado === 'en-progreso') return { ...t, estado: 'completada' as const };
        return { ...t, estado: 'pendiente' as const };
      }
      return t;
    }));
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Mi Espacio de Trabajo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus tareas, solicitudes y actividades
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tareas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tareas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tareasPendientes}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tareasCompletadas}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{solicitudes.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Solicitudes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mis Tareas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Mis Tareas
              </h2>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Nueva
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {tareas.map((tarea) => (
                <div key={tarea.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTareaEstado(tarea.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        tarea.estado === 'completada'
                          ? 'bg-green-500 border-green-500 text-white'
                          : tarea.estado === 'en-progreso'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {tarea.estado === 'completada' && <CheckCircle className="w-3 h-3" />}
                      {tarea.estado === 'en-progreso' && <Clock className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        tarea.estado === 'completada' 
                          ? 'text-gray-400 dark:text-gray-500 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {tarea.titulo}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tarea.descripcion}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEstadoTareaColor(tarea.estado)}`}>
                          {tarea.estado === 'en-progreso' ? 'En Progreso' : tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {tarea.fechaLimite}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mis Solicitudes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Mis Solicitudes
              </h2>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Nueva
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {solicitud.tipo}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{solicitud.titulo}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{solicitud.fecha}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getEstadoSolicitudColor(solicitud.estado)}`}>
                      {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mis Documentos</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reportar Incidente</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Solicitud</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <UserCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mi Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
