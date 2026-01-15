'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Table,
  Type,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  HourglassIcon,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Lock
} from 'lucide-react';
import { processAPI, ProcessEgsiDTO, egsiPhasesAPI, egsiAnswersAPI, phaseApprovalAPI, PhaseApprovalDTO } from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';

// Importar BlockEditor de forma lazy para evitar problemas de SSR
const BlockEditor = lazy(() => import('@/app/components/BlockEditor'));

// Tipos de preguntas
const QUESTION_TYPES = {
  TEXTO: { icon: Type, label: 'Texto' },
  DATE: { icon: Calendar, label: 'Fecha' },
  TABLA: { icon: Table, label: 'Tabla' },
};

// Configuración de columna de tabla
interface TableColumnConfig {
  key: string;
  header: string;
  width?: string;
  type?: 'text' | 'date'; // Tipo de input: texto o fecha
}

// Configuración de tabla
interface TableConfig {
  columns: TableColumnConfig[];
  minRows?: number;
  maxRows?: number;
}

// Estructura de pregunta
interface Question {
  idQuestion: string;
  title: string;
  description?: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: TableConfig;
  order: number;
}

// Estructura de sección
interface Section {
  idSection: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

// Estructura de fase
interface PhaseData {
  idPhase: string;
  title: string;
  description?: string;
  order: number;
  sections: Section[];
}

// Respuestas
interface Answers {
  [questionId: string]: string | string[][];
}

// Componente Editor de Tabla
interface TableEditorProps {
  columns: TableColumnConfig[];
  value: string[][];
  onChange: (data: string[][]) => void;
  minRows?: number;
  maxRows?: number;
  readOnly?: boolean;
}

function TableEditor({ columns, value, onChange, minRows = 1, maxRows = 50, readOnly = false }: TableEditorProps) {
  // Inicializar con filas mínimas si está vacío
  const rows = value.length > 0 ? value : Array(minRows).fill(null).map(() => columns.map(() => ''));

  const addRow = () => {
    if (readOnly) return;
    if (rows.length < maxRows) {
      const newRow = columns.map(() => '');
      onChange([...rows, newRow]);
    }
  };

  const removeRow = (rowIndex: number) => {
    if (readOnly) return;
    if (rows.length > minRows) {
      const newRows = rows.filter((_, index) => index !== rowIndex);
      onChange(newRows);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, newValue: string) => {
    if (readOnly) return;
    const newRows = rows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? newValue : cell));
      }
      return row;
    });
    onChange(newRows);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="w-10 px-2 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              #
            </th>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                style={{ width: col.width || 'auto' }}
              >
                {col.header}
              </th>
            ))}
            {!readOnly && (
              <th className="w-12 px-2 py-3 border-b border-gray-200 dark:border-gray-600"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-2 py-2 text-sm text-gray-400 dark:text-gray-500 text-center">
                {rowIndex + 1}
              </td>
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex} className="px-2 py-2">
                  {col.type === 'date' ? (
                    <input
                      type="date"
                      value={row[colIndex] || ''}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={row[colIndex] || ''}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                      placeholder={readOnly ? '' : `Ingrese ${col.header.toLowerCase()}...`}
                    />
                  )}
                </td>
              ))}
              {!readOnly && (
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    disabled={rows.length <= minRows}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Botón para agregar fila - solo si no es readOnly */}
      {!readOnly && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= maxRows}
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar fila</span>
          </button>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {rows.length} de {maxRows} filas máximas
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResponderFasePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  
  const processId = params.id as string;
  const phaseId = params.phaseCode as string; // Ahora es el ID de la fase
  
  // Detectar modo revisión (viene desde aprobador)
  const isReviewMode = searchParams.get('mode') === 'review';
  const approvalIdFromUrl = searchParams.get('approvalId');
  
  const [process, setProcess] = useState<ProcessEgsiDTO | null>(null);
  const [phase, setPhase] = useState<PhaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  
  // Estado de respuestas
  const [answers, setAnswers] = useState<Answers>({});
  
  // Sección actual (para navegación)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Estados para aprobación
  const [approvalStatus, setApprovalStatus] = useState<PhaseApprovalDTO | null>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  
  // Estados para modo revisión
  const [processingReview, setProcessingReview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Determinar estados de aprobación
  const isPendingApproval = approvalStatus?.status === 'PENDING';
  const isRejected = approvalStatus?.status === 'REJECTED';
  const isApproved = approvalStatus?.status === 'APPROVED';
  
  // Determinar si se puede editar:
  // - NO se puede editar si está en modo revisión (aprobador viendo)
  // - NO se puede editar si hay una solicitud PENDING (esperando aprobación)
  // - NO se puede editar si ya fue APPROVED (fase completada)
  // - SÍ se puede editar si fue REJECTED (para corregir)
  // - SÍ se puede editar si no hay solicitud de aprobación
  const canEdit = !isReviewMode && !isPendingApproval && !isApproved;

  // Cargar respuestas guardadas
  const loadSavedAnswers = async () => {
    try {
      setLoadingAnswers(true);
      const savedAnswers = await egsiAnswersAPI.getAnswersMap(processId, phaseId);
      
      // Convertir las respuestas guardadas al formato que usa el estado
      const loadedAnswers: Answers = {};
      for (const [questionId, value] of Object.entries(savedAnswers)) {
        // Intentar parsear como JSON (para tablas)
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            loadedAnswers[questionId] = parsed;
          } else {
            loadedAnswers[questionId] = value;
          }
        } catch {
          loadedAnswers[questionId] = value;
        }
      }
      
      setAnswers(loadedAnswers);
      console.log('Respuestas cargadas:', loadedAnswers);
    } catch (err) {
      console.log('No hay respuestas guardadas o error al cargar:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  // Cargar estado de aprobación
  const loadApprovalStatus = async () => {
    try {
      const response = await phaseApprovalAPI.checkPending(processId, phaseId);
      setApprovalStatus(response.lastApproval || null);
    } catch (err) {
      console.log('No hay estado de aprobación:', err);
      setApprovalStatus(null);
    }
  };

  // Solicitar aprobación
  const handleRequestApproval = async () => {
    if (!phase || !process) return;
    
    try {
      setRequestingApproval(true);
      
      // Obtener usuario actual del localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const requestedBy = user?.username || 'usuario@espe.edu.ec';
      
      await phaseApprovalAPI.create({
        idProcess: processId,
        idPhase: phaseId,
        phaseOrder: phase.order,
        phaseTitle: phase.title,
        requestedBy,
        comments: approvalComments,
      });
      
      dispatch(showToast({ 
        message: 'Solicitud de aprobación enviada correctamente', 
        type: 'success' 
      }));
      
      setShowApprovalModal(false);
      setApprovalComments('');
      await loadApprovalStatus();
    } catch (err: any) {
      console.error('Error requesting approval:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al enviar solicitud', 
        type: 'error' 
      }));
    } finally {
      setRequestingApproval(false);
    }
  };

  // Aprobar fase (modo revisión)
  const handleApprovePhase = async () => {
    if (!approvalIdFromUrl) return;
    
    try {
      setProcessingReview(true);
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const reviewedBy = user?.username || 'aprobador@espe.edu.ec';
      
      await phaseApprovalAPI.review({
        idApproval: approvalIdFromUrl,
        action: 'APPROVED',
        reviewedBy,
      });
      
      dispatch(showToast({ 
        message: `Fase "${phase?.title}" aprobada correctamente. El proceso avanzará a la siguiente fase.`, 
        type: 'success' 
      }));
      
      router.push('/aprobador');
    } catch (err: any) {
      console.error('Error approving:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al aprobar la fase', 
        type: 'error' 
      }));
    } finally {
      setProcessingReview(false);
    }
  };

  // Rechazar fase (modo revisión)
  const handleRejectPhase = async () => {
    if (!approvalIdFromUrl || !rejectionReason.trim()) {
      dispatch(showToast({ 
        message: 'Debe proporcionar un motivo de rechazo', 
        type: 'error' 
      }));
      return;
    }
    
    try {
      setProcessingReview(true);
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const reviewedBy = user?.username || 'aprobador@espe.edu.ec';
      
      await phaseApprovalAPI.review({
        idApproval: approvalIdFromUrl,
        action: 'REJECTED',
        reviewedBy,
        rejectionReason,
      });
      
      dispatch(showToast({ 
        message: `Fase "${phase?.title}" rechazada. El solicitante deberá realizar correcciones.`, 
        type: 'success' 
      }));
      
      setShowRejectModal(false);
      setRejectionReason('');
      router.push('/aprobador');
    } catch (err: any) {
      console.error('Error rejecting:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al rechazar la fase', 
        type: 'error' 
      }));
    } finally {
      setProcessingReview(false);
    }
  };

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar proceso
      const processData = await processAPI.getById(processId);
      setProcess(processData);
      
      // Cargar fase por ID directamente desde el API
      try {
        const phaseData = await egsiPhasesAPI.getById(phaseId);
        setPhase({
          idPhase: phaseData.idPhase,
          title: phaseData.title,
          description: phaseData.description,
          order: phaseData.order,
          sections: phaseData.sections.map(s => ({
            idSection: s.idSection,
            title: s.title,
            description: s.description,
            order: s.order,
            questions: s.questions.map(q => {
              // Parsear tableConfig si viene como string
              let parsedTableConfig = q.tableConfig;
              if (typeof q.tableConfig === 'string') {
                try {
                  parsedTableConfig = JSON.parse(q.tableConfig);
                } catch (e) {
                  console.error('Error parseando tableConfig:', e);
                  parsedTableConfig = undefined;
                }
              }
              
              return {
                idQuestion: q.idQuestion,
                title: q.title,
                description: q.description,
                inputType: q.inputType as 'TEXTO' | 'DATE' | 'TABLA',
                required: q.required,
                placeholder: q.placeholder,
                maxLength: q.maxLength,
                tableConfig: parsedTableConfig,
                order: q.order,
              };
            })
          })).sort((a, b) => a.order - b.order)
        });
        
        // Cargar respuestas guardadas después de cargar la fase
        await loadSavedAnswers();
        
        // Verificar estado de aprobación
        await loadApprovalStatus();
      } catch (phaseErr: any) {
        console.error('Error cargando fase:', phaseErr);
        setError('No se pudo cargar la fase. Verifique que existe en la base de datos.');
      }
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (processId && phaseId) {
      fetchData();
    }
  }, [processId, phaseId]);

  // Actualizar respuesta
  const handleAnswerChange = (questionId: string, value: string | string[][]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Guardar respuestas en el backend
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Preparar las respuestas para enviar al backend
      const answersToSave = Object.entries(answers).map(([questionId, value]) => ({
        idQuestion: questionId,
        // Convertir arrays a JSON string para tablas
        answerValue: Array.isArray(value) ? JSON.stringify(value) : String(value),
      }));

      // Llamar al API para guardar
      const response = await egsiAnswersAPI.save({
        idProcess: processId,
        idPhase: phaseId,
        answers: answersToSave,
      });
      
      console.log('Respuestas guardadas:', response);
      
      dispatch(showToast({ 
        message: `${response.savedCount} respuestas guardadas correctamente`, 
        type: 'success' 
      }));
    } catch (err: any) {
      console.error('Error saving answers:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al guardar las respuestas', 
        type: 'error' 
      }));
    } finally {
      setSaving(false);
    }
  };

  // Navegación entre secciones
  const goToNextSection = () => {
    if (phase && currentSectionIndex < phase.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  // Calcular progreso
  const calculateProgress = () => {
    if (!phase) return 0;
    const totalQuestions = phase.sections.reduce((acc, s) => acc + s.questions.length, 0);
    const answeredQuestions = Object.keys(answers).filter(key => {
      const value = answers[key];
      return value && (typeof value === 'string' ? value.trim() !== '' : value.length > 0);
    }).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Renderizar pregunta según tipo
  const renderQuestion = (question: Question) => {
    const value = answers[question.idQuestion] || '';
    const TypeIcon = QUESTION_TYPES[question.inputType]?.icon || Type;

    return (
      <div key={question.idQuestion} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {question.description}
              </p>
            )}
          </div>
        </div>

        {question.inputType === 'TEXTO' && (
          <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden min-h-[200px] ${!canEdit ? 'opacity-80' : ''}`}>
            <Suspense fallback={
              <div className="h-48 bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            }>
              <BlockEditor
                initialContent={value as string || undefined}
                onChange={(content) => handleAnswerChange(question.idQuestion, content)}
                editable={canEdit}
              />
            </Suspense>
          </div>
        )}

        {question.inputType === 'DATE' && (
          <input
            type="date"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.idQuestion, e.target.value)}
            disabled={!canEdit}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${!canEdit ? 'cursor-not-allowed opacity-80' : ''}`}
          />
        )}

        {question.inputType === 'TABLA' && (
          <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden ${!canEdit ? 'opacity-80' : ''}`}>
            {question.tableConfig && question.tableConfig.columns && question.tableConfig.columns.length > 0 ? (
              <TableEditor
                columns={question.tableConfig.columns}
                value={(value as string[][]) || []}
                onChange={(data) => handleAnswerChange(question.idQuestion, data)}
                minRows={question.tableConfig.minRows}
                maxRows={question.tableConfig.maxRows}
                readOnly={!canEdit}
              />
            ) : (
              <div className="p-4 text-center">
                <Table className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay configuración de columnas para esta tabla
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentSection = phase?.sections[currentSectionIndex];

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'APPROVER']}>
      <div className="space-y-6">
        {/* Banner de modo revisión (para aprobadores) */}
        {isReviewMode && (
          <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Modo Revisión
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Estás revisando esta fase para aprobarla o rechazarla. Los campos están bloqueados.
              </p>
            </div>
          </div>
        )}
        
        {/* Banner de esperando aprobación (para usuarios) */}
        {!isReviewMode && isPendingApproval && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <HourglassIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Esperando Aprobación
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Esta fase está pendiente de aprobación. No puedes modificar las respuestas hasta que sea revisada.
              </p>
            </div>
          </div>
        )}
        
        {/* Banner de fase rechazada (para usuarios) */}
        {!isReviewMode && isRejected && approvalStatus && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Fase Rechazada - Requiere Correcciones
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Motivo:</strong> {approvalStatus.rejectionReason || 'Sin motivo especificado'}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Corrige las observaciones y vuelve a solicitar aprobación.
              </p>
            </div>
          </div>
        )}
        
        {/* Banner de fase aprobada (para usuarios) */}
        {!isReviewMode && isApproved && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Fase Aprobada
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Esta fase ha sido aprobada y no puede ser modificada. Puedes continuar con la siguiente fase.
              </p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(isReviewMode ? '/aprobador' : `/ver-procesos/${processId}/fases`)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {phase?.title || 'Cargando...'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {process?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isReviewMode ? (
              /* Botones de aprobar/rechazar para modo revisión */
              <>
                <button
                  onClick={handleApprovePhase}
                  disabled={processingReview}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors shadow-lg shadow-green-600/25"
                >
                  {processingReview ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-5 h-5" />
                  )}
                  <span>Aprobar Fase</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processingReview}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors shadow-lg shadow-red-600/25"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>Rechazar</span>
                </button>
              </>
            ) : (
              /* Botones normales de guardar y solicitar aprobación */
              <>
                {/* Botón Guardar Respuestas - solo si puede editar */}
                {canEdit && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl transition-colors shadow-lg shadow-purple-600/25"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Guardar Respuestas</span>
                      </>
                    )}
                  </button>
                )}
                
                {/* Estado y botones de aprobación */}
                {isApproved ? (
                  /* Fase aprobada - mostrar badge verde */
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Fase Aprobada</span>
                  </div>
                ) : isPendingApproval ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-xl">
                    <HourglassIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Esperando aprobación</span>
                  </div>
                ) : isRejected ? (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    disabled={requestingApproval}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Volver a solicitar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    disabled={requestingApproval}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors shadow-lg shadow-green-600/25"
                  >
                    {requestingApproval ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Solicitar Aprobación</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso de la fase
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {calculateProgress()}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando preguntas...</p>
          </div>
        ) : phase && currentSection ? (
          <>
            {/* Section Navigation */}
            {phase.sections.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {phase.sections.map((section, index) => (
                  <button
                    key={section.idSection}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentSectionIndex
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Current Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentSection.title}
                </h2>
                {currentSection.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentSection.description}
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="p-6 space-y-6">
                {currentSection.questions
                  .sort((a, b) => a.order - b.order)
                  .map(renderQuestion)}
              </div>

              {/* Section Navigation Buttons */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <button
                  onClick={goToPrevSection}
                  disabled={currentSectionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Sección {currentSectionIndex + 1} de {phase.sections.length}
                </span>

                {currentSectionIndex < phase.sections.length - 1 ? (
                  <button
                    onClick={goToNextSection}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : isReviewMode ? (
                  /* En modo revisión, mostrar botones de aprobar/rechazar */
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApprovePhase}
                      disabled={processingReview}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      {processingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4" />
                      )}
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processingReview}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                ) : canEdit ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Finalizar</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl">
                    <Lock className="w-4 h-4" />
                    <span>Solo lectura</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}

        {/* Modal de solicitud de aprobación */}
        {showApprovalModal && phase && (
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
                    Fase {phase.order}: {phase.title}
                  </p>
                </div>
              </div>
              
              {approvalStatus?.status === 'REJECTED' && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>Motivo del rechazo anterior:</strong> {approvalStatus.rejectionReason || 'Sin motivo especificado'}
                  </p>
                </div>
              )}
              
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
                    setApprovalComments('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRequestApproval}
                  disabled={requestingApproval}
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

        {/* Modal de rechazo (modo revisión) */}
        {showRejectModal && phase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rechazar Fase
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fase {phase.order}: {phase.title}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Al rechazar esta fase, el solicitante deberá realizar las correcciones necesarias 
                y volver a solicitar aprobación.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explique las razones del rechazo y las correcciones necesarias..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejectPhase}
                  disabled={processingReview || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {processingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-4 h-4" />
                      Confirmar Rechazo
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
