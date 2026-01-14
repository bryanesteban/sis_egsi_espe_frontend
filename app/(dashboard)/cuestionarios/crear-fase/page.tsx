'use client';

import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  ArrowLeft,
  GripVertical,
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
  CheckCircle2
} from 'lucide-react';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';
import Link from 'next/link';

// ============ TIPOS ============
interface TableColumn {
  key: string;
  header: string;
  width?: string;
  type?: 'text' | 'date'; // Tipo de input: texto o fecha
}

interface TableConfig {
  columns: TableColumn[];
  minRows?: number;
  maxRows?: number;
}

interface Question {
  id: string;
  title: string;
  description: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: TableConfig;
}

interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: Question[];
  isExpanded: boolean;
}

interface Phase {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: Section[];
  isExpanded: boolean;
}

// ============ GENERADORES DE ID ============
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ COMPONENTE PRINCIPAL ============
export default function CrearFasePage() {
  const dispatch = useAppDispatch();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{phaseId: string, sectionId: string, question: Question} | null>(null);

  // ============ FUNCIONES DE FASE ============
  const addPhase = () => {
    const newPhase: Phase = {
      id: generateId(),
      title: `Fase ${phases.length + 1}`,
      description: '',
      order: phases.length + 1,
      sections: [],
      isExpanded: true
    };
    setPhases([...phases, newPhase]);
  };

  const updatePhase = (phaseId: string, updates: Partial<Phase>) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const deletePhase = (phaseId: string) => {
    if (confirm('¿Estás seguro de eliminar esta fase y todo su contenido?')) {
      setPhases(phases.filter(p => p.id !== phaseId).map((p, idx) => ({ ...p, order: idx + 1 })));
    }
  };

  const togglePhaseExpand = (phaseId: string) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  // ============ FUNCIONES DE SECCIÓN ============
  const addSection = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newSection: Section = {
      id: generateId(),
      title: `Sección ${phase.sections.length + 1}`,
      description: '',
      order: phase.sections.length + 1,
      questions: [],
      isExpanded: true
    };

    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { ...p, sections: [...p.sections, newSection] }
        : p
    ));
  };

  const updateSection = (phaseId: string, sectionId: string, updates: Partial<Section>) => {
    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s) }
        : p
    ));
  };

  const deleteSection = (phaseId: string, sectionId: string) => {
    if (confirm('¿Estás seguro de eliminar esta sección y todas sus preguntas?')) {
      setPhases(phases.map(p => 
        p.id === phaseId 
          ? { ...p, sections: p.sections.filter(s => s.id !== sectionId).map((s, idx) => ({ ...s, order: idx + 1 })) }
          : p
      ));
    }
  };

  const toggleSectionExpand = (phaseId: string, sectionId: string) => {
    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s) }
        : p
    ));
  };

  // ============ FUNCIONES DE PREGUNTA ============
  const addQuestion = (phaseId: string, sectionId: string) => {
    const newQuestion: Question = {
      id: generateId(),
      title: '',
      description: '',
      inputType: 'TEXTO',
      required: true,
      placeholder: '',
      maxLength: 1000
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

    setPhases(phases.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== sectionId) return s;
          const existingQuestion = s.questions.find(q => q.id === question.id);
          if (existingQuestion) {
            return { ...s, questions: s.questions.map(q => q.id === question.id ? question : q) };
          } else {
            return { ...s, questions: [...s.questions, question] };
          }
        })
      };
    }));

    setEditingQuestion(null);
    dispatch(showToast({ message: 'Pregunta guardada correctamente', type: 'success' }));
  };

  const editQuestion = (phaseId: string, sectionId: string, question: Question) => {
    setEditingQuestion({ phaseId, sectionId, question: { ...question } });
  };

  const deleteQuestion = (phaseId: string, sectionId: string, questionId: string) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      setPhases(phases.map(p => 
        p.id === phaseId 
          ? { 
              ...p, 
              sections: p.sections.map(s => 
                s.id === sectionId 
                  ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
                  : s
              )
            }
          : p
      ));
    }
  };

  // ============ FUNCIONES DE TABLA CONFIG ============
  const addTableColumn = () => {
    if (!editingQuestion || editingQuestion.question.inputType !== 'TABLA') return;
    
    const tableConfig = editingQuestion.question.tableConfig || { columns: [], minRows: 1, maxRows: 20 };
    const newColumn: TableColumn = {
      key: `col_${tableConfig.columns.length + 1}`,
      header: `Columna ${tableConfig.columns.length + 1}`,
      width: '25%',
      type: 'text' // Por defecto tipo texto
    };

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: {
          ...tableConfig,
          columns: [...tableConfig.columns, newColumn]
        }
      }
    });
  };

  const updateTableColumn = (index: number, updates: Partial<TableColumn>) => {
    if (!editingQuestion || !editingQuestion.question.tableConfig) return;

    const newColumns = [...editingQuestion.question.tableConfig.columns];
    newColumns[index] = { ...newColumns[index], ...updates };

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: {
          ...editingQuestion.question.tableConfig,
          columns: newColumns
        }
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

  // ============ EXPORTAR/GUARDAR ============
  const generateJSON = () => {
    const processData = {
      process: {
        idProcess: generateId(),
        name: processName || 'Proceso sin nombre',
        description: processDescription || '',
        status: 'DRAFT',
        dateBegin: new Date().toISOString().split('T')[0],
        dateEnd: '',
        currentPhaseOrder: 1,
        phases: phases.map((phase, phaseIdx) => ({
          idPhase: phase.id,
          title: phase.title,
          description: phase.description,
          status: phaseIdx === 0 ? 'ACTIVE' : 'LOCKED',
          order: phase.order,
          isCompleted: false,
          completedPercentage: 0,
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
              ...(question.inputType === 'TEXTO' && {
                placeholder: question.placeholder,
                maxLength: question.maxLength
              }),
              ...(question.inputType === 'TABLA' && {
                tableConfig: question.tableConfig
              }),
              answer: {
                idAnswer: `ans-${generateId()}`,
                value: question.inputType === 'TABLA' ? [] : '',
                status: 'PENDING',
                createdAt: null,
                updatedAt: null
              }
            }))
          }))
        }))
      }
    };
    return processData;
  };

  const handleSave = async () => {
    if (!processName.trim()) {
      dispatch(showToast({ message: 'El nombre del proceso es obligatorio', type: 'error' }));
      return;
    }
    if (phases.length === 0) {
      dispatch(showToast({ message: 'Debes agregar al menos una fase', type: 'error' }));
      return;
    }

    setSaving(true);
    const jsonData = generateJSON();
    console.log('Datos del proceso:', jsonData);
    
    // Simular guardado en servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    dispatch(showToast({ message: 'Proceso guardado correctamente', type: 'success' }));
    setSaving(false);
  };

  const handleDownloadJSON = () => {
    const jsonData = generateJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proceso-${processName || 'nuevo'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch(showToast({ message: 'JSON descargado correctamente', type: 'success' }));
  };

  const handleCopyJSON = () => {
    const jsonData = generateJSON();
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    dispatch(showToast({ message: 'JSON copiado al portapapeles', type: 'success' }));
  };

  // ============ CONTADORES ============
  const getTotalSections = () => phases.reduce((acc, p) => acc + p.sections.length, 0);
  const getTotalQuestions = () => phases.reduce((acc, p) => acc + p.sections.reduce((acc2, s) => acc2 + s.questions.length, 0), 0);

  // ============ INPUT TYPE ICON ============
  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXTO': return <FileText className="w-4 h-4" />;
      case 'DATE': return <Calendar className="w-4 h-4" />;
      case 'TABLA': return <Table className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/cuestionarios"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a cuestionarios</span>
          </Link>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Crear Proceso con Fases</h1>
                <p className="text-purple-100">
                  Diseña la estructura de fases, secciones y preguntas para tu proceso EGSI
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold">{phases.length}</div>
                  <div className="text-purple-200">Fases</div>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold">{getTotalSections()}</div>
                  <div className="text-purple-200">Secciones</div>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold">{getTotalQuestions()}</div>
                  <div className="text-purple-200">Preguntas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Proceso */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información del Proceso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Proceso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Ej: Implementación EGSI 2026"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={processDescription}
                onChange={(e) => setProcessDescription(e.target.value)}
                placeholder="Descripción breve del proceso..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Lista de Fases */}
        <div className="space-y-4">
          {phases.map((phase, phaseIndex) => (
            <div 
              key={phase.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Phase Header */}
              <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePhaseExpand(phase.id)}
                    className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded"
                  >
                    {phase.isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={phase.title}
                      onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                      placeholder="Título de la fase"
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium"
                    />
                    <input
                      type="text"
                      value={phase.description}
                      onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                      placeholder="Descripción de la fase"
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 py-1 bg-purple-100 dark:bg-purple-800/30 rounded">
                      {phase.sections.length} secciones
                    </span>
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
                  {phase.sections.map((section, sectionIndex) => (
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
                            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm font-medium"
                          />
                          <input
                            type="text"
                            value={section.description}
                            onChange={(e) => updateSection(phase.id, section.id, { description: e.target.value })}
                            placeholder="Descripción"
                            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {section.questions.length} preguntas
                          </span>
                          <button
                            onClick={() => deleteSection(phase.id, section.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar sección"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Section Content - Questions */}
                      {section.isExpanded && (
                        <div className="p-4 space-y-3">
                          {section.questions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No hay preguntas en esta sección
                            </p>
                          ) : (
                            section.questions.map((question, qIndex) => (
                              <div
                                key={question.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
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
                                    className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    title="Editar pregunta"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(phase.id, section.id, question.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Eliminar pregunta"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}

                          <button
                            onClick={() => addQuestion(phase.id, section.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
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
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/30"
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
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/30"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Guardar Proceso</span>
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
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título de la Pregunta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.question.title}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, title: e.target.value }
                    })}
                    placeholder="Ej: Nombre de la Institución"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción / Instrucciones
                  </label>
                  <textarea
                    value={editingQuestion.question.description}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, description: e.target.value }
                    })}
                    placeholder="Instrucciones para el usuario..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Tipo de Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Respuesta
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['TEXTO', 'DATE', 'TABLA'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const updates: Partial<Question> = { inputType: type };
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
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        {getInputTypeIcon(type)}
                        <span className="text-sm font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opciones según tipo */}
                {editingQuestion.question.inputType === 'TEXTO' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={editingQuestion.question.placeholder || ''}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, placeholder: e.target.value }
                        })}
                        placeholder="Texto de ayuda..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Longitud Máxima
                      </label>
                      <input
                        type="number"
                        value={editingQuestion.question.maxLength || 1000}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, maxLength: parseInt(e.target.value) }
                        })}
                        min={1}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Configuración de Tabla */}
                {editingQuestion.question.inputType === 'TABLA' && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">Columnas de la Tabla</h4>
                      <button
                        onClick={addTableColumn}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>

                    {editingQuestion.question.tableConfig?.columns.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay columnas definidas. Agrega al menos una columna.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {editingQuestion.question.tableConfig?.columns.map((col, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Columna {idx + 1}</span>
                              <button
                                onClick={() => deleteTableColumn(idx)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
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
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Título</label>
                                <input
                                  type="text"
                                  value={col.header}
                                  onChange={(e) => updateTableColumn(idx, { header: e.target.value })}
                                  placeholder="ej: Nombre"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de Input</label>
                                <select
                                  value={col.type || 'text'}
                                  onChange={(e) => updateTableColumn(idx, { type: e.target.value as 'text' | 'date' })}
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
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
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Filas Mínimas
                        </label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.minRows || 1}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: {
                              ...editingQuestion.question,
                              tableConfig: {
                                ...editingQuestion.question.tableConfig!,
                                minRows: parseInt(e.target.value)
                              }
                            }
                          })}
                          min={1}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Filas Máximas
                        </label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.maxRows || 20}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: {
                              ...editingQuestion.question,
                              tableConfig: {
                                ...editingQuestion.question.tableConfig!,
                                maxRows: parseInt(e.target.value)
                              }
                            }
                          })}
                          min={1}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Obligatorio */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, required: !editingQuestion.question.required }
                    })}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${editingQuestion.question.required ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow
                      ${editingQuestion.question.required ? 'translate-x-6' : 'translate-x-0.5'}
                    `} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pregunta obligatoria
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Guardar Pregunta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Vista Previa JSON */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vista Previa JSON
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
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
