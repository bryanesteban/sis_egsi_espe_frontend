'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Search, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO } from '@/lib/api';
import { useAppSelector } from '@/app/store/hooks';
import Link from 'next/link';
import RoleGuard from '@/app/components/RoleGuard';

// Estados disponibles para un proceso
const PROCESS_STATUS = [
  { value: 'ACTIVE', label: 'Activo', color: 'green', icon: PlayCircle, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
  { value: 'PAUSED', label: 'Pausado', color: 'yellow', icon: PauseCircle, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400' },
  { value: 'COMPLETED', label: 'Completado', color: 'blue', icon: CheckCircle2, bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'red', icon: X, bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
];

export default function VerProcesosPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [processes, setProcesses] = useState<ProcessEgsiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Cargar procesos desde el backend
  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await processAPI.getAll();
      setProcesses(response.process || []);
    } catch (err: any) {
      console.error('Error fetching processes:', err);
      setError(err.response?.data?.error || 'Error al cargar los procesos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  // Filtrar procesos por búsqueda y estado
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Obtener configuración del estado
  const getStatusConfig = (status: string) => {
    return PROCESS_STATUS.find(s => s.value === status) || PROCESS_STATUS[0];
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Si viene en formato dd/MM/yyyy
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ver Procesos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selecciona un proceso para ver y completar sus fases
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchProcesses}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar procesos por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="ALL">Todos los estados</option>
            {PROCESS_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{processes.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processes.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <PauseCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processes.filter(p => p.status === 'PAUSED').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pausados</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processes.filter(p => p.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchProcesses}
              className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando procesos...</p>
          </div>
        ) : (
          /* Process List */
          <div className="space-y-4">
            {filteredProcesses.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay procesos disponibles
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'No se encontraron procesos con los filtros aplicados' 
                    : 'Aún no se han creado procesos'}
                </p>
              </div>
            ) : (
              filteredProcesses.map((process) => {
                const statusConfig = getStatusConfig(process.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Link
                    key={process.idProcess}
                    href={`/ver-procesos/${process.idProcess}/fases`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Título y Estado */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {process.name}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Descripción */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {process.description}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>Inicio: {formatDate(process.dateBegin)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>Fin: {formatDate(process.dateEnd)}</span>
                            </div>
                            {process.customPhase && (
                              <div className="flex items-center gap-1.5">
                                <FolderOpen className="w-4 h-4" />
                                <span>Fase actual: {process.customPhase}</span>
                              </div>
                            )}
                            {process.userCreator && (
                              <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span>Creado por: {process.userCreator}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
