'use client';

import { useState, useEffect } from 'react';
import { 
  Layers, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  FileText,
  ArrowLeft,
  BookOpen,
  Shield,
  Settings,
  Target,
  ClipboardList,
  Send,
  XCircle,
  HourglassIcon
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO, egsiPhasesAPI, EgsiPhaseDTO, phaseApprovalAPI, PhaseApprovalDTO, egsiAnswersAPI } from '@/lib/api';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleGuard from '@/app/components/RoleGuard';

// Iconos disponibles para fases
const PHASE_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: FileText,
  2: AlertCircle,
  3: Clock,
  4: Play,
  5: Layers,
  6: Shield,
  7: Settings,
  8: Target,
  9: BookOpen,
  10: ClipboardList,
};

// Estados de fase
const PHASE_STATUS = {
  LOCKED: { label: 'Bloqueada', color: 'gray', icon: Lock, bgColor: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-500 dark:text-gray-400' },
  ACTIVE: { label: 'En Progreso', color: 'blue', icon: Play, bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  PENDING_APPROVAL: { label: 'Pendiente Aprobación', color: 'yellow', icon: HourglassIcon, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400' },
  REJECTED: { label: 'Rechazada', color: 'red', icon: XCircle, bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400' },
  COMPLETED: { label: 'Completada', color: 'green', icon: CheckCircle2, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' },
};

interface PhaseData {
  idPhase: string;
  title: string;
  description: string;
  order: number;
  icon: React.ComponentType<{ className?: string }>;
  status: 'LOCKED' | 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED';
  progress: number;
  questionsAnswered: number;
  totalQuestions: number;
  totalSections: number;
  approvalStatus?: PhaseApprovalDTO | null;
  canRequestApproval?: boolean;
}

export default function FasesProcesoPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const processId = params.id as string;
  
  const [process, setProcess] = useState<ProcessEgsiDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [requestingApproval, setRequestingApproval] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  
  // Obtener rol del usuario
  const [userRole, setUserRole] = useState<string>('USER');
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user?.rolename?.toUpperCase() || 'USER');
      } catch {
        setUserRole('USER');
      }
    }
  }, []);
  
  // Verificar si es visualizador (solo puede ver, no editar)
  const isViewer = userRole === 'VIEWER';

  // Cargar proceso y fases desde la base de datos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar proceso, fases y estado de aprobaciones en paralelo
      const [processData, phasesResponse] = await Promise.all([
        processAPI.getById(processId),
        egsiPhasesAPI.getActive() // Solo fases activas
      ]);
      
      setProcess(processData);
      
      // Determinar qué fase está activa basándose en customPhase del proceso
      const currentPhaseOrder = getCurrentPhaseOrder(processData.customPhase);
      
      // Transformar las fases de la BD al formato que necesitamos
      const phasesData: PhaseData[] = await Promise.all(
        phasesResponse.egsiPhases.map(async (phase) => {
          // Contar total de preguntas en todas las secciones
          const totalQuestions = phase.sections.reduce(
            (acc, section) => acc + section.questions.length, 
            0
          );
          
          // Verificar estado de aprobación para esta fase
          let approvalStatus: PhaseApprovalDTO | null = null;
          try {
            const approvalCheck = await phaseApprovalAPI.checkPending(processId, phase.idPhase);
            approvalStatus = approvalCheck.lastApproval;
          } catch (e) {
            console.log('No approval status for phase', phase.idPhase);
          }
          
          // Determinar estado basado en el orden y aprobaciones
          let status: 'LOCKED' | 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED' = 'LOCKED';
          let progress = 0;
          let questionsAnswered = 0;
          let canRequestApproval = false;
          
          if (phase.order < currentPhaseOrder) {
            status = 'COMPLETED';
            progress = 100;
            questionsAnswered = totalQuestions;
          } else if (phase.order === currentPhaseOrder) {
            // Verificar si hay solicitud de aprobación pendiente o rechazada
            if (approvalStatus?.status === 'PENDING') {
              status = 'PENDING_APPROVAL';
              progress = 100;
              questionsAnswered = totalQuestions;
            } else if (approvalStatus?.status === 'REJECTED') {
              status = 'REJECTED';
              progress = 100;
              questionsAnswered = totalQuestions;
              canRequestApproval = true; // Puede volver a solicitar
            } else {
              status = 'ACTIVE';
              // Obtener progreso real desde el backend
              try {
                const progressData = await egsiAnswersAPI.getProgress(processId, phase.idPhase);
                progress = progressData.progress || 0;
                questionsAnswered = Math.round((progress / 100) * totalQuestions);
              } catch (err) {
                console.error('Error getting progress for phase', phase.idPhase, err);
                progress = 0;
                questionsAnswered = 0;
              }
              // Siempre puede solicitar aprobación en la fase activa
              canRequestApproval = true;
            }
          }
          
          return {
            idPhase: phase.idPhase,
            title: phase.title,
            description: phase.description || 'Sin descripción',
            order: phase.order,
            icon: PHASE_ICONS[phase.order] || FileText,
            status,
            progress,
            questionsAnswered,
            totalQuestions,
            totalSections: phase.sections.length,
            approvalStatus,
            canRequestApproval,
          };
        })
      );
      
      // Ordenar por order
      phasesData.sort((a, b) => a.order - b.order);
      
      setPhases(phasesData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Solicitar aprobación de fase
  const handleRequestApproval = async () => {
    if (!selectedPhase || !process) return;
    
    try {
      setRequestingApproval(selectedPhase.idPhase);
      
      // Obtener usuario actual del localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const requestedBy = user?.username || 'usuario@espe.edu.ec';
      
      await phaseApprovalAPI.create({
        idProcess: processId,
        idPhase: selectedPhase.idPhase,
        phaseOrder: selectedPhase.order,
        phaseTitle: selectedPhase.title,
        requestedBy,
        comments: approvalComments,
      });
      
      dispatch(showToast({ 
        message: 'Solicitud de aprobación enviada correctamente', 
        type: 'success' 
      }));
      
      setShowApprovalModal(false);
      setApprovalComments('');
      setSelectedPhase(null);
      fetchData(); // Recargar datos
    } catch (err: any) {
      console.error('Error requesting approval:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al enviar solicitud', 
        type: 'error' 
      }));
    } finally {
      setRequestingApproval(null);
    }
  };

  const openApprovalModal = (phase: PhaseData) => {
    setSelectedPhase(phase);
    setShowApprovalModal(true);
  };

  // Convertir customPhase (FASE1, FASE2, etc.) a número de orden
  const getCurrentPhaseOrder = (customPhase: string | undefined): number => {
    if (!customPhase) return 1;
    const match = customPhase.match(/FASE(\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
  };

  useEffect(() => {
    if (processId) {
      fetchData();
    }
  }, [processId]);

  const getStatusConfig = (status: string) => {
    return PHASE_STATUS[status as keyof typeof PHASE_STATUS] || PHASE_STATUS.LOCKED;
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/ver-procesos')}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fases del Proceso</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {process?.name || 'Cargando...'}
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Process Info Card */}
        {process && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {process.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {process.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {phases.filter(p => p.status === 'COMPLETED').length}/{phases.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fases completadas</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(phases.reduce((acc, p) => acc + p.progress, 0) / phases.length)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Progreso total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchData}
              className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando fases...</p>
          </div>
        ) : (
          /* Phases Timeline */
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const statusConfig = getStatusConfig(phase.status);
              const StatusIcon = statusConfig.icon;
              const PhaseIcon = phase.icon;
              const isLocked = phase.status === 'LOCKED';
              
              return (
                <div key={phase.idPhase} className="relative">
                  {/* Connector Line */}
                  {index < phases.length - 1 && (
                    <div className="absolute left-6 top-20 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  {isLocked ? (
                    // Fase bloqueada - no clickeable
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 opacity-60">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Phase Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bgColor}`}>
                            <PhaseIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                                Fase {phase.order}: {phase.title}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                              {phase.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                              <Lock className="w-4 h-4" />
                              <span>Complete las fases anteriores para desbloquear</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fase activa o completada - clickeable
                    <Link
                      href={`/ver-procesos/${processId}/fases/${phase.idPhase}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all group"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Phase Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bgColor} group-hover:scale-110 transition-transform`}>
                            <PhaseIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                Fase {phase.order}: {phase.title}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {phase.description}
                            </p>
                            
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>{phase.questionsAnswered} de {phase.totalQuestions} preguntas respondidas</span>
                                <span>{phase.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    phase.status === 'COMPLETED' 
                                      ? 'bg-green-500' 
                                      : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${phase.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Arrow o botón de aprobación */}
                          <div className="flex flex-col items-center gap-2 self-center">
                            {/* Mostrar botón de solicitar aprobación si está activa y puede solicitar (solo si no es viewer) */}
                            {!isViewer && phase.status === 'ACTIVE' && phase.canRequestApproval && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  openApprovalModal(phase);
                                }}
                                disabled={requestingApproval === phase.idPhase}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {requestingApproval === phase.idPhase ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                Solicitar Aprobación
                              </button>
                            )}
                            
                            {/* Mostrar estado de rechazo con opción de volver a solicitar (solo si no es viewer) */}
                            {phase.status === 'REJECTED' && phase.approvalStatus && (
                              <div className="text-center">
                                <p className="text-xs text-red-500 dark:text-red-400 mb-2 max-w-[200px]">
                                  Rechazada: {phase.approvalStatus.rejectionReason || 'Sin motivo especificado'}
                                </p>
                                {!isViewer && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openApprovalModal(phase);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    Volver a solicitar
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Mostrar estado pendiente de aprobación */}
                            {phase.status === 'PENDING_APPROVAL' && (
                              <div className="text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <HourglassIcon className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                                  Esperando aprobación
                                </p>
                              </div>
                            )}
                            
                            {/* Flecha para navegar */}
                            {phase.status !== 'PENDING_APPROVAL' && (
                              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 rounded-xl transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de solicitud de aprobación */}
        {showApprovalModal && selectedPhase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Solicitar Aprobación
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fase {selectedPhase.order}: {selectedPhase.title}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Al solicitar aprobación, un administrador revisará el trabajo realizado en esta fase 
                antes de permitir el avance a la siguiente fase.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Agregue comentarios o notas para el aprobador..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedPhase(null);
                    setApprovalComments('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRequestApproval}
                  disabled={requestingApproval !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {requestingApproval ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Solicitud
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
