'use client';

import { useState, useEffect } from 'react';
import { 
  Layers, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleGuard from '@/app/components/RoleGuard';

// Fases estándar EGSI
const EGSI_PHASES = [
  { 
    code: 'FASE1', 
    name: 'Fase 1: Diagnóstico Inicial', 
    description: 'Evaluación del estado actual de seguridad de la información',
    icon: FileText
  },
  { 
    code: 'FASE2', 
    name: 'Fase 2: Análisis de Riesgos', 
    description: 'Identificación y análisis de riesgos de seguridad',
    icon: AlertCircle
  },
  { 
    code: 'FASE3', 
    name: 'Fase 3: Planificación', 
    description: 'Definición del plan de implementación del EGSI',
    icon: Clock
  },
  { 
    code: 'FASE4', 
    name: 'Fase 4: Implementación', 
    description: 'Ejecución de controles y medidas de seguridad',
    icon: Play
  },
  { 
    code: 'FASE5', 
    name: 'Fase 5: Monitoreo y Control', 
    description: 'Seguimiento y control de las medidas implementadas',
    icon: Layers
  },
];

// Estados de fase
const PHASE_STATUS = {
  LOCKED: { label: 'Bloqueada', color: 'gray', icon: Lock, bgColor: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-500 dark:text-gray-400' },
  ACTIVE: { label: 'En Progreso', color: 'blue', icon: Play, bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  COMPLETED: { label: 'Completada', color: 'green', icon: CheckCircle2, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' },
};

interface PhaseData {
  code: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  progress: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export default function FasesProcesoPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;
  
  const [process, setProcess] = useState<ProcessEgsiDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular fases con estado (esto debería venir del backend)
  const [phases, setPhases] = useState<PhaseData[]>([]);

  // Cargar proceso
  const fetchProcess = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await processAPI.getById(processId);
      setProcess(data);
      
      // Determinar el estado de las fases basado en customPhase del proceso
      const currentPhaseIndex = EGSI_PHASES.findIndex(p => p.code === data.customPhase);
      
      const phasesData: PhaseData[] = EGSI_PHASES.map((phase, index) => {
        let status: 'LOCKED' | 'ACTIVE' | 'COMPLETED' = 'LOCKED';
        let progress = 0;
        
        if (index < currentPhaseIndex) {
          status = 'COMPLETED';
          progress = 100;
        } else if (index === currentPhaseIndex) {
          status = 'ACTIVE';
          progress = 30; // Esto debería calcularse basado en respuestas
        }
        
        return {
          ...phase,
          status,
          progress,
          questionsAnswered: status === 'COMPLETED' ? 10 : (status === 'ACTIVE' ? 3 : 0),
          totalQuestions: 10,
        };
      });
      
      setPhases(phasesData);
    } catch (err: any) {
      console.error('Error fetching process:', err);
      setError(err.response?.data?.error || 'Error al cargar el proceso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (processId) {
      fetchProcess();
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
            onClick={fetchProcess}
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
              onClick={fetchProcess}
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
                <div key={phase.code} className="relative">
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
                                {phase.name}
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
                      href={`/ver-procesos/${processId}/fases/${phase.code}`}
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
                                {phase.name}
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
