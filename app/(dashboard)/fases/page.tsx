'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  Table,
  Copy,
  Download,
  Eye,
  Settings,
  X,
  CheckCircle2,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';
import { 
  egsiPhasesAPI, 
  EgsiPhaseDTO, 
  EgsiSectionDTO, 
  EgsiQuestionDTO,
  CreatePhaseRequestDTO,
  CreateSectionRequestDTO,
  CreateQuestionRequestDTO,
  TableConfig
} from '@/lib/api';

// ============ TIPOS LOCALES (con campos UI) ============
interface QuestionLocal {
  id: string;
  title: string;
  description: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: TableConfig;
  order: number;
}

interface SectionLocal {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: QuestionLocal[];
  isExpanded: boolean;
}

interface PhaseLocal {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: SectionLocal[];
  isExpanded: boolean;
  isActive: boolean;
}

// ============ GENERADORES DE ID ============
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ CONVERTIDORES ============
const convertFromAPI = (apiPhases: EgsiPhaseDTO[]): PhaseLocal[] => {
  return apiPhases.map(phase => ({
    id: phase.idPhase,
    title: phase.title,
    description: phase.description || '',
    order: phase.order,
    isActive: phase.isActive,
    isExpanded: false,
    sections: phase.sections?.map(section => ({
      id: section.idSection,
      title: section.title,
      description: section.description || '',
      order: section.order,
      isExpanded: false,
      questions: section.questions?.map(q => ({
        id: q.idQuestion,
        title: q.title,
        description: q.description || '',
        inputType: q.inputType,
        required: q.required,
        placeholder: q.placeholder,
        maxLength: q.maxLength,
        tableConfig: typeof q.tableConfig === 'string' ? JSON.parse(q.tableConfig) : q.tableConfig,
        order: q.order
      })) || []
    })) || []
  }));
};

const convertToAPI = (phases: PhaseLocal[]): CreatePhaseRequestDTO[] => {
  return phases.map(phase => ({
    title: phase.title,
    description: phase.description,
    order: phase.order,
    isActive: phase.isActive,
    sections: phase.sections.map(section => ({
      title: section.title,
      description: section.description,
      order: section.order,
      questions: section.questions.map(q => ({
        title: q.title,
        description: q.description,
        inputType: q.inputType,
        required: q.required,
        placeholder: q.placeholder,
        maxLength: q.maxLength,
        tableConfig: q.tableConfig ? JSON.stringify(q.tableConfig) : undefined,
        order: q.order
      }))
    }))
  }));
};

// ============ COMPONENTE PRINCIPAL ============
export default function GestionFasesPage() {
  const dispatch = useAppDispatch();
  const [phases, setPhases] = useState<PhaseLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{phaseId: string, sectionId: string, question: QuestionLocal} | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ totalPhases: 0, activePhases: 0, totalSections: 0, totalQuestions: 0 });

  // ============ CARGAR DATOS ============
  const loadPhases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await egsiPhasesAPI.getAll();
      setPhases(convertFromAPI(response.egsiPhases));
      setStats({
        totalPhases: response.totalPhases,
        activePhases: response.activePhases,
        totalSections: response.totalSections,
        totalQuestions: response.totalQuestions
      });
    } catch (error) {
      console.error('Error al cargar fases:', error);
      dispatch(showToast({ message: 'Error al cargar las fases. Usando datos locales.', type: 'error' }));
      // Cargar datos de ejemplo si falla la API
      setPhases(getDefaultPhases());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadPhases();
  }, [loadPhases]);

  // ============ FUNCIONES DE FASE ============
  const addPhase = () => {
    const newPhase: PhaseLocal = {
      id: generateId(),
      title: `Fase ${phases.length + 1}: Nueva Fase`,
      description: '',
      order: phases.length + 1,
      sections: [],
      isExpanded: true,
      isActive: true
    };
    setPhases([...phases, newPhase]);
    dispatch(showToast({ message: 'Fase agregada', type: 'success' }));
  };

  const updatePhase = (phaseId: string, updates: Partial<PhaseLocal>) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const deletePhase = (phaseId: string) => {
    if (confirm('¿Eliminar esta fase y todo su contenido?')) {
      setPhases(phases.filter(p => p.id !== phaseId).map((p, idx) => ({ ...p, order: idx + 1 })));
      dispatch(showToast({ message: 'Fase eliminada', type: 'success' }));
    }
  };

  const togglePhaseExpand = (phaseId: string) => {
    updatePhase(phaseId, { isExpanded: !phases.find(p => p.id === phaseId)?.isExpanded });
  };

  const togglePhaseActive = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, { isActive: !phase.isActive });
      dispatch(showToast({ message: phase.isActive ? 'Fase desactivada' : 'Fase activada', type: 'success' }));
    }
  };

  // ============ FUNCIONES DE SECCIÓN ============
  const addSection = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newSection: SectionLocal = {
      id: generateId(),
      title: `${phase.order}.${phase.sections.length + 1} Nueva Sección`,
      description: '',
      order: phase.sections.length + 1,
      questions: [],
      isExpanded: true
    };

    updatePhase(phaseId, { sections: [...phase.sections, newSection] });
  };

  const updateSection = (phaseId: string, sectionId: string, updates: Partial<SectionLocal>) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    updatePhase(phaseId, {
      sections: phase.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    });
  };

  const deleteSection = (phaseId: string, sectionId: string) => {
    if (confirm('¿Eliminar esta sección y sus preguntas?')) {
      const phase = phases.find(p => p.id === phaseId);
      if (!phase) return;
      updatePhase(phaseId, {
        sections: phase.sections.filter(s => s.id !== sectionId).map((s, idx) => ({ ...s, order: idx + 1 }))
      });
    }
  };

  const toggleSectionExpand = (phaseId: string, sectionId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    const section = phase.sections.find(s => s.id === sectionId);
    if (!section) return;
    updateSection(phaseId, sectionId, { isExpanded: !section.isExpanded });
  };

  // ============ FUNCIONES DE PREGUNTA ============
  const addQuestion = (phaseId: string, sectionId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    const section = phase?.sections.find(s => s.id === sectionId);
    
    const newQuestion: QuestionLocal = {
      id: generateId(),
      title: '',
      description: '',
      inputType: 'TEXTO',
      required: true,
      placeholder: '',
      maxLength: 1000,
      order: (section?.questions.length || 0) + 1
    };
    setEditingQuestion({ phaseId, sectionId, question: newQuestion });
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;
    
    const { phaseId, sectionId, question } = editingQuestion;
    
    if (!question.title.trim()) {
      dispatch(showToast({ message: 'El título de la pregunta es obligatorio', type: 'error' }));
      return;
    }

    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    const section = phase.sections.find(s => s.id === sectionId);
    if (!section) return;

    const existingQuestion = section.questions.find(q => q.id === question.id);
    let updatedQuestions: QuestionLocal[];
    
    if (existingQuestion) {
      updatedQuestions = section.questions.map(q => q.id === question.id ? question : q);
    } else {
      updatedQuestions = [...section.questions, question];
    }

    updateSection(phaseId, sectionId, { questions: updatedQuestions });
    setEditingQuestion(null);
    dispatch(showToast({ message: 'Pregunta guardada', type: 'success' }));
  };

  const editQuestion = (phaseId: string, sectionId: string, question: QuestionLocal) => {
    setEditingQuestion({ phaseId, sectionId, question: { ...question } });
  };

  const deleteQuestion = (phaseId: string, sectionId: string, questionId: string) => {
    if (confirm('¿Eliminar esta pregunta?')) {
      const phase = phases.find(p => p.id === phaseId);
      if (!phase) return;
      const section = phase.sections.find(s => s.id === sectionId);
      if (!section) return;
      updateSection(phaseId, sectionId, { 
        questions: section.questions.filter(q => q.id !== questionId).map((q, idx) => ({ ...q, order: idx + 1 }))
      });
    }
  };

  // ============ FUNCIONES DE TABLA CONFIG ============
  const addTableColumn = () => {
    if (!editingQuestion || editingQuestion.question.inputType !== 'TABLA') return;
    
    const tableConfig = editingQuestion.question.tableConfig || { columns: [], minRows: 1, maxRows: 20 };
    const newColumn = {
      key: `col_${tableConfig.columns.length + 1}`,
      header: `Columna ${tableConfig.columns.length + 1}`,
      width: '25%',
      type: 'text' as 'text' | 'date'
    };

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: { ...tableConfig, columns: [...tableConfig.columns, newColumn] }
      }
    });
  };

  const updateTableColumn = (index: number, updates: Partial<{ key: string; header: string; width?: string; type?: 'text' | 'date' }>) => {
    if (!editingQuestion || !editingQuestion.question.tableConfig) return;

    const newColumns = [...editingQuestion.question.tableConfig.columns];
    newColumns[index] = { ...newColumns[index], ...updates };

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: { ...editingQuestion.question.tableConfig, columns: newColumns }
      }
    });
  };

  const deleteTableColumn = (index: number) => {
    if (!editingQuestion || !editingQuestion.question.tableConfig) return;

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: {
          ...editingQuestion.question.tableConfig,
          columns: editingQuestion.question.tableConfig.columns.filter((_, i) => i !== index)
        }
      }
    });
  };

  // ============ GUARDAR TODO EN API ============
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const phasesToSave = convertToAPI(phases);
      const response = await egsiPhasesAPI.saveAll({ phases: phasesToSave });
      
      setPhases(convertFromAPI(response.egsiPhases));
      setStats({
        totalPhases: response.totalPhases,
        activePhases: response.activePhases,
        totalSections: response.totalSections,
        totalQuestions: response.totalQuestions
      });
      
      dispatch(showToast({ message: 'Todas las fases guardadas correctamente', type: 'success' }));
    } catch (error) {
      console.error('Error al guardar fases:', error);
      dispatch(showToast({ message: 'Error al guardar las fases', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // ============ EXPORTAR ============
  const generateJSON = () => {
    return {
      egsiPhases: phases.filter(p => p.isActive).map(phase => ({
        idPhase: phase.id,
        title: phase.title,
        description: phase.description,
        order: phase.order,
        sections: phase.sections.map(section => ({
          idSection: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          questions: section.questions.map((question, qIdx) => ({
            idQuestion: qIdx + 1,
            title: question.title,
            description: question.description,
            inputType: question.inputType,
            required: question.required,
            ...(question.inputType === 'TEXTO' && { placeholder: question.placeholder, maxLength: question.maxLength }),
            ...(question.inputType === 'TABLA' && { tableConfig: question.tableConfig })
          }))
        }))
      }))
    };
  };

  const handleDownloadJSON = () => {
    const jsonData = generateJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fases-egsi.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch(showToast({ message: 'JSON descargado', type: 'success' }));
  };

  const handleCopyJSON = () => {
    const jsonData = generateJSON();
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    dispatch(showToast({ message: 'JSON copiado al portapapeles', type: 'success' }));
  };

  // ============ HELPERS ============
  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXTO': return <FileText className="w-4 h-4" />;
      case 'DATE': return <Calendar className="w-4 h-4" />;
      case 'TABLA': return <Table className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTotalSections = () => phases.reduce((acc, p) => acc + p.sections.length, 0);
  const getTotalQuestions = () => phases.reduce((acc, p) => acc + p.sections.reduce((acc2, s) => acc2 + s.questions.length, 0), 0);
  const getActivePhases = () => phases.filter(p => p.isActive).length;

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando fases...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Fases EGSI</h1>
                <p className="text-green-100 text-sm mt-1">
                  Configura las fases que se aplicarán a todos los procesos de implementación
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{getActivePhases()}/{phases.length}</div>
                <div className="text-xs text-green-200">Fases Activas</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{getTotalSections()}</div>
                <div className="text-xs text-green-200">Secciones</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{getTotalQuestions()}</div>
                <div className="text-xs text-green-200">Preguntas</div>
              </div>
              <button
                onClick={loadPhases}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Recargar desde servidor"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Plantilla de Fases Estándar</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Estas fases se aplicarán automáticamente a todos los nuevos procesos de implementación EGSI. 
              Puedes activar/desactivar fases según las necesidades de tu institución. 
              <strong> Recuerda guardar los cambios.</strong>
            </p>
          </div>
        </div>

        {/* Lista de Fases */}
        <div className="space-y-4">
          {phases.map((phase) => (
            <div 
              key={phase.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                phase.isActive 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              {/* Phase Header */}
              <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
                phase.isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePhaseExpand(phase.id)}
                    className="p-1 hover:bg-green-100 dark:hover:bg-green-800/30 rounded"
                  >
                    {phase.isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                  
                  <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                    {phase.order}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={phase.title}
                      onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold"
                    />
                    <input
                      type="text"
                      value={phase.description}
                      onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                      placeholder="Descripción de la fase..."
                      className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {phase.sections.length} secciones
                    </span>
                    
                    {/* Toggle Activo */}
                    <button
                      onClick={() => togglePhaseActive(phase.id)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${phase.isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                      title={phase.isActive ? 'Desactivar fase' : 'Activar fase'}
                    >
                      <div className={`
                        absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow
                        ${phase.isActive ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>

                    <button
                      onClick={() => deletePhase(phase.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar fase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Phase Content */}
              {phase.isExpanded && (
                <div className="p-6 space-y-4">
                  {/* Secciones */}
                  {phase.sections.map((section) => (
                    <div 
                      key={section.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center gap-3">
                        <button
                          onClick={() => toggleSectionExpand(phase.id, section.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          {section.isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(phase.id, section.id, { title: e.target.value })}
                            placeholder="Título de la sección"
                            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={section.description}
                            onChange={(e) => updateSection(phase.id, section.id, { description: e.target.value })}
                            placeholder="Descripción"
                            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300"
                          />
                        </div>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {section.questions.length} preg.
                        </span>
                        <button
                          onClick={() => deleteSection(phase.id, section.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Section Content - Questions */}
                      {section.isExpanded && (
                        <div className="p-4 space-y-2">
                          {section.questions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No hay preguntas en esta sección
                            </p>
                          ) : (
                            section.questions.map((question) => (
                              <div
                                key={question.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                  {getInputTypeIcon(question.inputType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {question.title || 'Sin título'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {question.inputType} {question.required && '• Obligatorio'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => editQuestion(phase.id, section.id, question)}
                                    className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(phase.id, section.id, question.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}

                          <button
                            onClick={() => addQuestion(phase.id, section.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg text-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Pregunta
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Section Button */}
                  <button
                    onClick={() => addSection(phase.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Sección
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Phase Button */}
          <button
            onClick={addPhase}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30"
          >
            <Plus className="w-5 h-5" />
            Agregar Nueva Fase
          </button>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-4 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="Copiar JSON"
            >
              <Copy className="w-5 h-5" />
              <span className="hidden sm:inline">Copiar</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="Descargar JSON"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="Vista previa"
            >
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Vista Previa</span>
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Guardar en BD</span>
          </button>
        </div>

        {/* Modal Editor de Pregunta */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingQuestion.question.title ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h3>
                <button onClick={() => setEditingQuestion(null)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.question.title}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, title: e.target.value }
                    })}
                    placeholder="Ej: Nombre de la Institución"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción / Instrucciones</label>
                  <textarea
                    value={editingQuestion.question.description}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, description: e.target.value }
                    })}
                    placeholder="Instrucciones para el usuario..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Respuesta</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['TEXTO', 'DATE', 'TABLA'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const updates: Partial<QuestionLocal> = { inputType: type };
                          if (type === 'TABLA' && !editingQuestion.question.tableConfig) {
                            updates.tableConfig = { columns: [], minRows: 1, maxRows: 20 };
                          }
                          setEditingQuestion({
                            ...editingQuestion,
                            question: { ...editingQuestion.question, ...updates }
                          });
                        }}
                        className={`
                          flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                          ${editingQuestion.question.inputType === type
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        {getInputTypeIcon(type)}
                        <span className="text-sm font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {editingQuestion.question.inputType === 'TEXTO' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placeholder</label>
                      <input
                        type="text"
                        value={editingQuestion.question.placeholder || ''}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, placeholder: e.target.value }
                        })}
                        placeholder="Texto de ayuda..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max. Caracteres</label>
                      <input
                        type="number"
                        value={editingQuestion.question.maxLength || 1000}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, maxLength: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {editingQuestion.question.inputType === 'TABLA' && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">Columnas de la Tabla</h4>
                      <button onClick={addTableColumn} className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg">
                        <Plus className="w-4 h-4" /> Agregar
                      </button>
                    </div>

                    {editingQuestion.question.tableConfig?.columns.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay columnas. Agrega al menos una.</p>
                    ) : (
                      <div className="space-y-3">
                        {editingQuestion.question.tableConfig?.columns.map((col, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Columna {idx + 1}</span>
                              <button onClick={() => deleteTableColumn(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Key</label>
                                <input
                                  type="text"
                                  value={col.key}
                                  onChange={(e) => updateTableColumn(idx, { key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                  placeholder="ej: nombre"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Título</label>
                                <input
                                  type="text"
                                  value={col.header}
                                  onChange={(e) => updateTableColumn(idx, { header: e.target.value })}
                                  placeholder="ej: Nombre"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de Input</label>
                                <select
                                  value={(col as any).type || 'text'}
                                  onChange={(e) => updateTableColumn(idx, { type: e.target.value as 'text' | 'date' } as any)}
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                >
                                  <option value="text">📝 Texto</option>
                                  <option value="date">📅 Fecha</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ancho</label>
                                <input
                                  type="text"
                                  value={col.width || ''}
                                  onChange={(e) => updateTableColumn(idx, { width: e.target.value })}
                                  placeholder="ej: 25%"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filas Mínimas</label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.minRows || 1}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: { ...editingQuestion.question, tableConfig: { ...editingQuestion.question.tableConfig!, minRows: parseInt(e.target.value) }}
                          })}
                          min={1}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filas Máximas</label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.maxRows || 20}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: { ...editingQuestion.question, tableConfig: { ...editingQuestion.question.tableConfig!, maxRows: parseInt(e.target.value) }}
                          })}
                          min={1}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, required: !editingQuestion.question.required }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${editingQuestion.question.required ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${editingQuestion.question.required ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pregunta obligatoria</span>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button onClick={() => setEditingQuestion(null)} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl">
                  Cancelar
                </button>
                <button onClick={saveQuestion} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                  <CheckCircle2 className="w-5 h-5" /> Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Vista Previa */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vista Previa JSON - Fases EGSI</h3>
                <button onClick={() => setShowPreview(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  {JSON.stringify(generateJSON(), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

// ============ DATOS DE PRUEBA (FALLBACK) ============
function getDefaultPhases(): PhaseLocal[] {
  return [
    {
      id: 'phase-001',
      title: 'Fase 1: Diagnóstico Inicial',
      description: 'Evaluación del estado actual de la seguridad de la información en la institución.',
      order: 1,
      isExpanded: false,
      isActive: true,
      sections: [
        {
          id: 'sec-001',
          title: '1.1 Información General de la Institución',
          description: 'Complete la información básica de identificación institucional.',
          order: 1,
          isExpanded: false,
          questions: [
            { id: 'q1', title: 'Nombre de la Institución', description: 'Ingrese el nombre oficial completo.', inputType: 'TEXTO', required: true, placeholder: 'Ej: Universidad de las Fuerzas Armadas ESPE', order: 1 },
            { id: 'q2', title: 'Fecha de Inicio del Diagnóstico', description: 'Seleccione la fecha de inicio.', inputType: 'DATE', required: true, order: 2 },
            { id: 'q3', title: 'Responsable del Proceso', description: 'Nombre del funcionario responsable.', inputType: 'TEXTO', required: true, placeholder: 'Ej: Ing. Juan Pérez', order: 3 }
          ]
        }
      ]
    },
    {
      id: 'phase-002',
      title: 'Fase 2: Análisis de Riesgos',
      description: 'Identificar, analizar y evaluar los riesgos de seguridad de la información.',
      order: 2,
      isExpanded: false,
      isActive: true,
      sections: []
    },
    {
      id: 'phase-003',
      title: 'Fase 3: Plan de Tratamiento',
      description: 'Desarrollar el plan de tratamiento de riesgos.',
      order: 3,
      isExpanded: false,
      isActive: true,
      sections: []
    },
    {
      id: 'phase-004',
      title: 'Fase 4: Implementación',
      description: 'Implementar los controles de seguridad seleccionados.',
      order: 4,
      isExpanded: false,
      isActive: true,
      sections: []
    },
    {
      id: 'phase-005',
      title: 'Fase 5: Monitoreo y Mejora',
      description: 'Establecer mecanismos de monitoreo y mejora continua.',
      order: 5,
      isExpanded: false,
      isActive: true,
      sections: []
    }
  ];
}
