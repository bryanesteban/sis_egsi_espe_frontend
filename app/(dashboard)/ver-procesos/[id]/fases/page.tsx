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
  ClipboardList
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO, egsiPhasesAPI, EgsiPhaseDTO } from '@/lib/api';
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
  COMPLETED: { label: 'Completada', color: 'green', icon: CheckCircle2, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' },
};

interface PhaseData {
  idPhase: string;
  title: string;
  description: string;
  order: number;
  icon: React.ComponentType<{ className?: string }>;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  progress: number;
  questionsAnswered: number;
  totalQuestions: number;
  totalSections: number;
}

export default function FasesProcesoPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;
  
  const [process, setProcess] = useState<ProcessEgsiDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<PhaseData[]>([]);

  // Cargar proceso y fases desde la base de datos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar proceso y fases en paralelo
      const [processData, phasesResponse] = await Promise.all([
        processAPI.getById(processId),
        egsiPhasesAPI.getActive() // Solo fases activas
      ]);
      
      setProcess(processData);
      
      // Determinar qué fase está activa basándose en customPhase del proceso
      const currentPhaseOrder = getCurrentPhaseOrder(processData.customPhase);
      
      // Transformar las fases de la BD al formato que necesitamos
      const phasesData: PhaseData[] = phasesResponse.egsiPhases.map((phase) => {
        // Contar total de preguntas en todas las secciones
        const totalQuestions = phase.sections.reduce(
          (acc, section) => acc + section.questions.length, 
          0
        );
        
        // Determinar estado basado en el orden
        let status: 'LOCKED' | 'ACTIVE' | 'COMPLETED' = 'LOCKED';
        let progress = 0;
        let questionsAnswered = 0;
        
        if (phase.order < currentPhaseOrder) {
          status = 'COMPLETED';
          progress = 100;
          questionsAnswered = totalQuestions;
        } else if (phase.order === currentPhaseOrder) {
          status = 'ACTIVE';
          progress = 30; // TODO: Calcular basado en respuestas guardadas
          questionsAnswered = Math.floor(totalQuestions * 0.3);
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
        };
      });
      
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
                          
                          {/* Arrow */}
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 rounded-xl transition-colors self-center">
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
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
      </div>
    </RoleGuard>
  );
}
