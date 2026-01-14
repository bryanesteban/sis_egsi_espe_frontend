'use client';

import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Save,
  Calendar,
  FileText,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';

// Estados disponibles para un proceso
const PROCESS_STATUS = [
  { value: 'ACTIVE', label: 'Activo', color: 'green', icon: PlayCircle },
  { value: 'PAUSED', label: 'Pausado', color: 'yellow', icon: PauseCircle },
  { value: 'COMPLETED', label: 'Completado', color: 'blue', icon: CheckCircle2 },
  { value: 'CANCELLED', label: 'Cancelado', color: 'red', icon: X },
];

// Fases del cuestionario EGSI
const QUESTIONNAIRE_PHASES = [
  { code: 'FASE1', name: 'Fase 1 - Diagnóstico Inicial' },
  { code: 'FASE2', name: 'Fase 2 - Análisis de Riesgos' },
  { code: 'FASE3', name: 'Fase 3 - Planificación' },
  { code: 'FASE4', name: 'Fase 4 - Implementación' },
  { code: 'FASE5', name: 'Fase 5 - Monitoreo' },
  { code: 'FASE6', name: 'Fase 6 - Evaluación' },
  { code: 'FASE7', name: 'Fase 7 - Mejora Continua' },
  { code: 'FASE8', name: 'Fase 8 - Certificación' },
];

// Función para convertir fecha de yyyy-MM-dd a dd/MM/yyyy (para backend)
const formatDateToBackend = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Función para convertir fecha de dd/MM/yyyy a yyyy-MM-dd (para input HTML)
const formatDateToInput = (dateStr: string): string => {
  if (!dateStr) return '';
  // Si ya está en formato yyyy-MM-dd, retornarlo
  if (dateStr.includes('-')) return dateStr;
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

export default function ProcesosPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [processes, setProcesses] = useState<ProcessEgsiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessEgsiDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProcessEgsiDTO>({
    name: '',
    description: '',
    dateBegin: '',
    dateEnd: '',
    status: 'ACTIVE',
    customPhase: 'FASE1',
  });

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

  // Filtrar procesos por búsqueda
  const filteredProcesses = processes.filter(process => 
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal para editar
  const handleEdit = (process: ProcessEgsiDTO) => {
    setEditingProcess(process);
    setFormData({
      idProcess: process.idProcess,
      name: process.name,
      description: process.description,
      dateBegin: formatDateToInput(process.dateBegin),
      dateEnd: formatDateToInput(process.dateEnd),
      status: process.status,
      customPhase: process.customPhase || 'FASE1',
    });
    setIsModalOpen(true);
  };

  // Abrir modal para crear nuevo proceso
  const handleNewProcess = () => {
    setEditingProcess(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    setFormData({
      name: '',
      description: '',
      dateBegin: today,
      dateEnd: nextYear.toISOString().split('T')[0],
      status: 'ACTIVE',
      customPhase: 'FASE1',
      userCreator: user?.username || '',
    });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
    setFormData({
      name: '',
      description: '',
      dateBegin: '',
      dateEnd: '',
      status: 'ACTIVE',
      customPhase: 'FASE1',
    });
  };

  // Guardar proceso (crear o actualizar)
  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      dispatch(showToast({ message: 'El nombre es requerido', type: 'error' }));
      return;
    }
    if (!formData.description.trim()) {
      dispatch(showToast({ message: 'La descripción es requerida', type: 'error' }));
      return;
    }
    if (!formData.dateBegin) {
      dispatch(showToast({ message: 'La fecha de inicio es requerida', type: 'error' }));
      return;
    }
    if (!formData.dateEnd) {
      dispatch(showToast({ message: 'La fecha de fin es requerida', type: 'error' }));
      return;
    }
    if (new Date(formData.dateEnd) < new Date(formData.dateBegin)) {
      dispatch(showToast({ message: 'La fecha de fin debe ser posterior a la fecha de inicio', type: 'error' }));
      return;
    }

    try {
      setSaving(true);
      
      // Preparar datos con fechas en formato dd/MM/yyyy para el backend
      const dataToSend: ProcessEgsiDTO = {
        ...formData,
        dateBegin: formatDateToBackend(formData.dateBegin),
        dateEnd: formatDateToBackend(formData.dateEnd),
      };
      
      if (editingProcess) {
        // Actualizar proceso existente
        const updatedProcess = await processAPI.update(dataToSend);
        setProcesses(processes.map(p => p.idProcess === updatedProcess.idProcess ? updatedProcess : p));
        dispatch(showToast({ message: 'Proceso actualizado correctamente', type: 'success' }));
      } else {
        // Crear nuevo proceso
        const processToCreate: ProcessEgsiDTO = {
          ...dataToSend,
          userCreator: user?.username || '',
        };
        const response = await processAPI.create(processToCreate);
        setProcesses([...processes, response.processCreated]);
        dispatch(showToast({ 
          message: `Proceso "${response.processCreated.name}" creado con la fase inicial`, 
          type: 'success' 
        }));
      }
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving process:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al guardar el proceso', 
        type: 'error' 
      }));
    } finally {
      setSaving(false);
    }
  };

  // Eliminar proceso
  const handleDelete = async (id: string) => {
    try {
      await processAPI.delete(id);
      setProcesses(processes.filter(p => p.idProcess !== id));
      dispatch(showToast({ message: 'Proceso eliminado correctamente', type: 'success' }));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Error deleting process:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al eliminar el proceso', 
        type: 'error' 
      }));
    }
  };

  // Obtener configuración del estado
  const getStatusConfig = (status: string) => {
    return PROCESS_STATUS.find(s => s.value === status) || PROCESS_STATUS[0];
  };

  // Obtener nombre de fase
  const getPhaseName = (code: string) => {
    const phase = QUESTIONNAIRE_PHASES.find(p => p.code === code);
    return phase?.name || code;
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Procesos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión de procesos de implementación del EGSI
              </p>
            </div>
          </div>
          
          <button
            onClick={handleNewProcess}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-lg shadow-green-600/25"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Proceso</span>
          </button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar procesos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Stats */}
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchProcesses}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando procesos...</p>
          </div>
        ) : (
          /* Processes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProcesses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FolderKanban className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No hay procesos registrados</p>
                <button
                  onClick={handleNewProcess}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Crear primer proceso
                </button>
              </div>
            ) : (
              filteredProcesses.map((process) => {
                const statusConfig = getStatusConfig(process.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={process.idProcess}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {process.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2
                          ${statusConfig.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                          ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${statusConfig.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        `}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {process.description}
                    </p>

                    {/* Current Phase */}
                    {process.customPhase && (
                      <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getPhaseName(process.customPhase)}
                        </span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">Inicio</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">{process.dateBegin}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">Fin</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">{process.dateEnd}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(process)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm">Editar</span>
                      </button>
                      
                      {deleteConfirmId === process.idProcess ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(process.idProcess!)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(process.idProcess!)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProcess ? 'Editar Proceso' : 'Nuevo Proceso EGSI'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre del Proceso *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Implementación EGSI 2026"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={50}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el propósito y alcance del proceso..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    maxLength={1000}
                  />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Fecha de Inicio *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateBegin}
                        onChange={(e) => setFormData({ ...formData, dateBegin: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Fecha de Fin *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateEnd}
                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {PROCESS_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info adicional para nuevo proceso */}
                {!editingProcess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Información importante
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Al crear el proceso, se generará automáticamente la Fase 1 (Diagnóstico Inicial) 
                          con sus preguntas correspondientes del cuestionario EGSI.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProcess ? 'Actualizar' : 'Crear Proceso'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
