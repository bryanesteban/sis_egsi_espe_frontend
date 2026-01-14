'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Search, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  FileQuestion,
  MessageSquare,
  FolderKanban,
  ListChecks,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  processAPI, 
  phasesAPI, 
  answersAPI, 
  questionsAPI,
  questionariesAPI,
  ProcessEgsiDTO, 
  PhaseDTO, 
  AnswerDTO, 
  QuestionDTO,
  QuestionaryDTO
} from '@/lib/api';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';

// Tipos de respuesta
type AnswerType = 'TEXTO' | 'DATE' | 'TABLA';

// Interfaz para filas de tabla
interface TableRow {
  [key: string]: string;
}

// Mapeo de códigos de cuestionario a nombres legibles
const QUESTIONARY_NAMES: Record<string, string> = {
  'FASE1': 'Fase 1 - Diagnóstico Inicial',
  'FASE2': 'Fase 2 - Análisis de Riesgos',
  'FASE3': 'Fase 3 - Planificación',
  'FASE4': 'Fase 4 - Implementación',
  'FASE5': 'Fase 5 - Monitoreo',
  'FASE6': 'Fase 6 - Evaluación',
  'FASE7': 'Fase 7 - Mejora Continua',
  'FASE8': 'Fase 8 - Certificación',
};

interface QuestionWithAnswer extends QuestionDTO {
  answer?: AnswerDTO;
}

// Estado local para edición de respuestas
interface EditingAnswer {
  idQuestion: number;
  answerText: string;
  answerType: AnswerType;
  tableData?: TableRow[];
  tableColumns?: string[];
}

export default function CuestionariosPage() {
  const dispatch = useAppDispatch();
  
  // Estados principales
  const [processes, setProcesses] = useState<ProcessEgsiDTO[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcessEgsiDTO | null>(null);
  const [phases, setPhases] = useState<PhaseDTO[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<PhaseDTO | null>(null);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([]);
  const [questionaries, setQuestionaries] = useState<QuestionaryDTO[]>([]);
  
  // Estados de edición
  const [editingAnswers, setEditingAnswers] = useState<Map<number, EditingAnswer>>(new Map());
  const [savingAnswers, setSavingAnswers] = useState<Set<number>>(new Set());
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Cargar procesos al inicio
  useEffect(() => {
    fetchProcesses();
    fetchQuestionaries();
  }, []);

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

  const fetchQuestionaries = async () => {
    try {
      const data = await questionariesAPI.getAll();
      setQuestionaries(data);
    } catch (err: any) {
      console.error('Error fetching questionaries:', err);
    }
  };

  // Cargar fases cuando se selecciona un proceso
  const handleSelectProcess = async (process: ProcessEgsiDTO) => {
    setSelectedProcess(process);
    setSelectedPhase(null);
    setQuestionsWithAnswers([]);
    
    try {
      setLoadingPhases(true);
      const phasesData = await phasesAPI.getByProcess(process.idProcess!);
      setPhases(phasesData);
    } catch (err: any) {
      console.error('Error fetching phases:', err);
      dispatch(showToast({ 
        message: 'Error al cargar las fases del proceso', 
        type: 'error' 
      }));
    } finally {
      setLoadingPhases(false);
    }
  };

  // Cargar preguntas y respuestas cuando se selecciona una fase
  const handleSelectPhase = async (phase: PhaseDTO) => {
    setSelectedPhase(phase);
    
    try {
      setLoadingQuestions(true);
      
      // Cargar preguntas del cuestionario de esta fase
      const questions = await questionsAPI.getByQuestionary(phase.questionaryCode);
      
      // Cargar respuestas de esta fase
      const answers = await answersAPI.getByPhase(phase.idPhase);
      
      // Combinar preguntas con sus respuestas
      const questionsWithAns: QuestionWithAnswer[] = questions.map(q => ({
        ...q,
        answer: answers.find(a => a.idQuestion === q.idQuestion)
      }));
      
      setQuestionsWithAnswers(questionsWithAns);
    } catch (err: any) {
      console.error('Error fetching questions and answers:', err);
      dispatch(showToast({ 
        message: 'Error al cargar las preguntas', 
        type: 'error' 
      }));
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Volver a la lista de procesos
  const handleBack = () => {
    if (selectedPhase) {
      setSelectedPhase(null);
      setQuestionsWithAnswers([]);
    } else if (selectedProcess) {
      setSelectedProcess(null);
      setPhases([]);
    }
  };

  // Toggle expansión de pregunta
  const toggleQuestion = (idQuestion: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(idQuestion)) {
      newExpanded.delete(idQuestion);
    } else {
      newExpanded.add(idQuestion);
    }
    setExpandedQuestions(newExpanded);
  };

  // Obtener nombre del cuestionario
  const getQuestionaryName = (code: string) => {
    const questionary = questionaries.find(q => q.idQuestionary === code);
    return questionary?.questionaryName || QUESTIONARY_NAMES[code] || code;
  };

  // Filtrar procesos
  const filteredProcesses = processes.filter(process => 
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas de la fase
  const getPhaseStats = (questions: QuestionWithAnswer[]) => {
    const total = questions.length;
    const completed = questions.filter(q => q.answer?.answerStatus === 'COMPLETED').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percentage };
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  // Inicializar respuesta para edición
  const initializeEditingAnswer = (question: QuestionWithAnswer) => {
    const answerType = (question.answer?.answerType as AnswerType) || 'TEXTO';
    let tableData: TableRow[] = [];
    let tableColumns: string[] = ['Columna 1', 'Columna 2', 'Columna 3'];
    
    if (answerType === 'TABLA' && question.answer?.answerText) {
      try {
        const parsed = JSON.parse(question.answer.answerText);
        tableData = parsed.rows || [];
        tableColumns = parsed.columns || ['Columna 1', 'Columna 2', 'Columna 3'];
      } catch {
        tableData = [{ 'Columna 1': '', 'Columna 2': '', 'Columna 3': '' }];
      }
    } else if (answerType === 'TABLA') {
      tableData = [{ 'Columna 1': '', 'Columna 2': '', 'Columna 3': '' }];
    }

    setEditingAnswers(prev => {
      const newMap = new Map(prev);
      newMap.set(question.idQuestion, {
        idQuestion: question.idQuestion,
        answerText: question.answer?.answerText || '',
        answerType,
        tableData,
        tableColumns,
      });
      return newMap;
    });
  };

  // Actualizar texto de respuesta
  const updateAnswerText = (idQuestion: number, text: string) => {
    setEditingAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(idQuestion);
      if (current) {
        newMap.set(idQuestion, { ...current, answerText: text });
      }
      return newMap;
    });
  };

  // Actualizar celda de tabla
  const updateTableCell = (idQuestion: number, rowIndex: number, column: string, value: string) => {
    setEditingAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(idQuestion);
      if (current && current.tableData) {
        const newTableData = [...current.tableData];
        newTableData[rowIndex] = { ...newTableData[rowIndex], [column]: value };
        newMap.set(idQuestion, { ...current, tableData: newTableData });
      }
      return newMap;
    });
  };

  // Agregar fila a tabla
  const addTableRow = (idQuestion: number) => {
    setEditingAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(idQuestion);
      if (current && current.tableData && current.tableColumns) {
        const newRow: TableRow = {};
        current.tableColumns.forEach(col => newRow[col] = '');
        newMap.set(idQuestion, { 
          ...current, 
          tableData: [...current.tableData, newRow] 
        });
      }
      return newMap;
    });
  };

  // Eliminar fila de tabla
  const removeTableRow = (idQuestion: number, rowIndex: number) => {
    setEditingAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(idQuestion);
      if (current && current.tableData && current.tableData.length > 1) {
        const newTableData = current.tableData.filter((_, i) => i !== rowIndex);
        newMap.set(idQuestion, { ...current, tableData: newTableData });
      }
      return newMap;
    });
  };

  // Guardar respuesta
  const saveAnswer = async (question: QuestionWithAnswer) => {
    const editing = editingAnswers.get(question.idQuestion);
    if (!editing || !selectedPhase) return;

    setSavingAnswers(prev => new Set(prev).add(question.idQuestion));

    try {
      let answerText = editing.answerText;
      
      // Para tablas, serializar los datos
      if (editing.answerType === 'TABLA' && editing.tableData) {
        answerText = JSON.stringify({
          columns: editing.tableColumns,
          rows: editing.tableData,
        });
      }

      const answerData: AnswerDTO = {
        idAnswer: question.answer?.idAnswer || '',
        idQuestion: question.idQuestion,
        idPhase: selectedPhase.idPhase,
        answerText,
        answerType: editing.answerType,
        answerStatus: answerText ? 'COMPLETED' : 'PENDING',
      };

      const updatedAnswer = await answersAPI.update(answerData);
      
      // Actualizar el estado local
      setQuestionsWithAnswers(prev => 
        prev.map(q => 
          q.idQuestion === question.idQuestion 
            ? { ...q, answer: updatedAnswer }
            : q
        )
      );

      dispatch(showToast({ message: 'Respuesta guardada correctamente', type: 'success' }));
    } catch (err: any) {
      console.error('Error saving answer:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al guardar la respuesta', 
        type: 'error' 
      }));
    } finally {
      setSavingAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.idQuestion);
        return newSet;
      });
    }
  };

  // Renderizar input según tipo de respuesta
  const renderAnswerInput = (question: QuestionWithAnswer) => {
    const editing = editingAnswers.get(question.idQuestion);
    const isSaving = savingAnswers.has(question.idQuestion);
    const answerType = (question.answer?.answerType as AnswerType) || 'TEXTO';
    
    // Inicializar si no existe
    if (!editing) {
      initializeEditingAnswer(question);
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Input según tipo */}
        {answerType === 'TEXTO' && (
          <textarea
            value={editing.answerText}
            onChange={(e) => updateAnswerText(question.idQuestion, e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
          />
        )}

        {answerType === 'DATE' && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={editing.answerText}
              onChange={(e) => updateAnswerText(question.idQuestion, e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
            />
          </div>
        )}

        {answerType === 'TABLA' && editing.tableData && editing.tableColumns && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {editing.tableColumns.map((col, idx) => (
                      <th 
                        key={idx}
                        className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-left text-sm font-medium text-purple-700 dark:text-purple-300 border border-gray-200 dark:border-gray-600"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="w-12 px-2 py-2 bg-purple-50 dark:bg-purple-900/30 border border-gray-200 dark:border-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {editing.tableData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {editing.tableColumns!.map((col, colIdx) => (
                        <td key={colIdx} className="border border-gray-200 dark:border-gray-600 p-0">
                          <input
                            type="text"
                            value={row[col] || ''}
                            onChange={(e) => updateTableCell(question.idQuestion, rowIdx, col, e.target.value)}
                            className="w-full px-3 py-2 bg-transparent focus:bg-gray-50 dark:focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 text-gray-900 dark:text-white"
                            placeholder={`${col}...`}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-200 dark:border-gray-600 p-1 text-center">
                        <button
                          onClick={() => removeTableRow(question.idQuestion, rowIdx)}
                          disabled={editing.tableData!.length <= 1}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => addTableRow(question.idQuestion)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar fila
            </button>
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Tipo: <span className="font-medium">{answerType}</span>
          </span>
          <button
            onClick={() => saveAnswer(question)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {(selectedProcess || selectedPhase) && (
              <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPhase 
                  ? getQuestionaryName(selectedPhase.questionaryCode)
                  : selectedProcess 
                    ? selectedProcess.name 
                    : 'Cuestionarios EGSI'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPhase 
                  ? `${questionsWithAnswers.length} preguntas`
                  : selectedProcess 
                    ? `${phases.length} fases disponibles`
                    : 'Selecciona un proceso para ver sus fases y preguntas'}
              </p>
            </div>
          </div>
          
          {!selectedProcess && (
            <div className="flex items-center gap-2">
              <Link
                href="/cuestionarios/crear-fase"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Proceso</span>
              </Link>
              <Link
                href="/cuestionarios/fase"
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-xl transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Ver Demo</span>
              </Link>
              <button
                onClick={fetchProcesses}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Actualizar</span>
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        {selectedProcess && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <button 
              onClick={() => { setSelectedProcess(null); setSelectedPhase(null); setPhases([]); }}
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Procesos
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => { setSelectedPhase(null); setQuestionsWithAnswers([]); }}
              className={`hover:text-purple-600 dark:hover:text-purple-400 ${!selectedPhase ? 'text-gray-900 dark:text-white font-medium' : ''}`}
            >
              {selectedProcess.name}
            </button>
            {selectedPhase && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">
                  {getQuestionaryName(selectedPhase.questionaryCode)}
                </span>
              </>
            )}
          </div>
        )}

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
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando procesos...</p>
          </div>
        ) : !selectedProcess ? (
          /* Lista de Procesos */
          <>
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar procesos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProcesses.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <FolderKanban className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No hay procesos disponibles</p>
                </div>
              ) : (
                filteredProcesses.map((process) => (
                  <button
                    key={process.idProcess}
                    onClick={() => handleSelectProcess(process)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                        <FolderKanban className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {process.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {process.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                        {process.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {process.dateBegin} - {process.dateEnd}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : !selectedPhase ? (
          /* Lista de Fases */
          loadingPhases ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando fases...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phases.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <ListChecks className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No hay fases para este proceso</p>
                </div>
              ) : (
                phases.map((phase, index) => (
                  <button
                    key={phase.idPhase}
                    onClick={() => handleSelectPhase(phase)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getQuestionaryName(phase.questionaryCode)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Código: {phase.questionaryCode}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                        {phase.status === 'COMPLETED' ? 'Completado' : phase.status === 'ACTIVE' ? 'Activo' : phase.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Responsable: {phase.responsibles || 'Sin asignar'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        ) : (
          /* Lista de Preguntas con Respuestas */
          loadingQuestions ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando preguntas...</p>
            </div>
          ) : (
            <>
              {/* Stats de la fase */}
              {questionsWithAnswers.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = getPhaseStats(questionsWithAnswers);
                    return (
                      <>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <FileQuestion className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Completadas</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <div className="relative w-6 h-6">
                                <svg className="w-6 h-6 transform -rotate-90">
                                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-600" />
                                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${stats.percentage * 0.628} 62.8`} className="text-blue-600 dark:text-blue-400" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.percentage}%</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Progreso</p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Lista de preguntas */}
              <div className="space-y-3">
                {questionsWithAnswers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FileQuestion className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No hay preguntas para esta fase</p>
                  </div>
                ) : (
                  questionsWithAnswers.map((question, index) => {
                    const isExpanded = expandedQuestions.has(question.idQuestion);
                    const isCompleted = question.answer?.answerStatus === 'COMPLETED';
                    
                    return (
                      <div
                        key={question.idQuestion}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {/* Question Header */}
                        <button
                          onClick={() => toggleQuestion(question.idQuestion)}
                          className="w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                                #{index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {question.questionType}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {question.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {/* Question Details (expanded) */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="pt-4 pl-9">
                              {/* Header de respuesta */}
                              <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Respuesta:
                                </span>
                                {question.answer && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(question.answer.answerStatus)}`}>
                                    {question.answer.answerStatus === 'COMPLETED' ? 'Completada' : question.answer.answerStatus === 'PENDING' ? 'Pendiente' : question.answer.answerStatus}
                                  </span>
                                )}
                              </div>
                              
                              {/* Input de respuesta según tipo */}
                              {renderAnswerInput(question)}
                              
                              {/* Fechas de auditoría */}
                              {question.answer && (question.answer.createdAt || question.answer.updatedAt) && (
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                  {question.answer.createdAt && (
                                    <span>Creada: {question.answer.createdAt}</span>
                                  )}
                                  {question.answer.updatedAt && (
                                    <span>Actualizada: {question.answer.updatedAt}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )
        )}
      </div>
    </RoleGuard>
  );
}
