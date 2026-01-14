'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
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
  CheckCircle2,
  Search,
  Layers,
  Play,
  Edit2,
  MoreVertical,
  Archive,
  RefreshCw,
  Filter,
  FolderPlus,
  Clock,
  AlertCircle
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

interface Process {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

// ============ DATOS DE PRUEBA ============
const MOCK_PROCESSES: Process[] = [
  {
    id: 'proc-001',
    name: 'Implementación EGSI 2026',
    description: 'Proceso principal de implementación del EGSI para la institución',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-13',
    phases: [
      {
        id: 'phase-001',
        title: 'Fase 1: Diagnóstico Inicial',
        description: 'Evaluación del estado actual de la seguridad',
        order: 1,
        isExpanded: false,
        sections: [
          { id: 'sec-001', title: 'Información General', description: '', order: 1, questions: [
            { id: 'q1', title: 'Nombre de la Institución', description: '', inputType: 'TEXTO', required: true },
            { id: 'q2', title: 'Fecha de Diagnóstico', description: '', inputType: 'DATE', required: true },
          ], isExpanded: false },
          { id: 'sec-002', title: 'Alcance del SGSI', description: '', order: 2, questions: [
            { id: 'q3', title: 'Descripción del Alcance', description: '', inputType: 'TEXTO', required: true },
          ], isExpanded: false }
        ]
      },
      {
        id: 'phase-002',
        title: 'Fase 2: Análisis de Riesgos',
        description: 'Identificación y evaluación de riesgos',
        order: 2,
        isExpanded: false,
        sections: [
          { id: 'sec-003', title: 'Identificación de Activos', description: '', order: 1, questions: [
            { id: 'q4', title: 'Inventario de Activos', description: '', inputType: 'TABLA', required: true, tableConfig: {
              columns: [{ key: 'nombre', header: 'Nombre' }, { key: 'tipo', header: 'Tipo' }], minRows: 1, maxRows: 50
            }},
          ], isExpanded: false }
        ]
      },
      {
        id: 'phase-003',
        title: 'Fase 3: Plan de Tratamiento',
        description: 'Definición de controles y tratamiento',
        order: 3,
        isExpanded: false,
        sections: []
      }
    ]
  },
  {
    id: 'proc-002',
    name: 'Auditoría Interna SGSI',
    description: 'Proceso de auditoría interna del sistema de gestión',
    status: 'DRAFT',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-12',
    phases: [
      {
        id: 'phase-004',
        title: 'Fase 1: Planificación',
        description: 'Planificación de la auditoría',
        order: 1,
        isExpanded: false,
        sections: []
      }
    ]
  },
  {
    id: 'proc-003',
    name: 'Revisión por la Dirección 2025',
    description: 'Revisión anual del SGSI por alta dirección',
    status: 'COMPLETED',
    createdAt: '2025-12-01',
    updatedAt: '2025-12-20',
    phases: []
  }
];

// ============ GENERADORES DE ID ============
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ COMPONENTE PRINCIPAL ============
export default function GestionFasesPage() {
  const dispatch = useAppDispatch();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{phaseId: string, sectionId: string, question: Question} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessDescription, setNewProcessDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos
  useEffect(() => {
    setTimeout(() => {
      setProcesses(MOCK_PROCESSES);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrar procesos
  const filteredProcesses = processes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ============ FUNCIONES DE PROCESO ============
  const createProcess = () => {
    if (!newProcessName.trim()) {
      dispatch(showToast({ message: 'El nombre del proceso es obligatorio', type: 'error' }));
      return;
    }

    const newProcess: Process = {
      id: generateId(),
      name: newProcessName,
      description: newProcessDescription,
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      phases: []
    };

    setProcesses([newProcess, ...processes]);
    setNewProcessName('');
    setNewProcessDescription('');
    setShowCreateModal(false);
    setSelectedProcess(newProcess);
    dispatch(showToast({ message: 'Proceso creado correctamente', type: 'success' }));
  };

  const updateProcessStatus = (processId: string, status: Process['status']) => {
    setProcesses(processes.map(p => 
      p.id === processId ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
    if (selectedProcess?.id === processId) {
      setSelectedProcess(prev => prev ? { ...prev, status } : null);
    }
    dispatch(showToast({ message: `Estado actualizado a ${status}`, type: 'success' }));
  };

  const deleteProcess = (processId: string) => {
    if (confirm('¿Estás seguro de eliminar este proceso y todo su contenido?')) {
      setProcesses(processes.filter(p => p.id !== processId));
      if (selectedProcess?.id === processId) {
        setSelectedProcess(null);
      }
      dispatch(showToast({ message: 'Proceso eliminado', type: 'success' }));
    }
  };

  // ============ FUNCIONES DE FASE ============
  const addPhase = () => {
    if (!selectedProcess) return;

    const newPhase: Phase = {
      id: generateId(),
      title: `Fase ${selectedProcess.phases.length + 1}`,
      description: '',
      order: selectedProcess.phases.length + 1,
      sections: [],
      isExpanded: true
    };

    const updated = {
      ...selectedProcess,
      phases: [...selectedProcess.phases, newPhase],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSelectedProcess(updated);
    setProcesses(processes.map(p => p.id === selectedProcess.id ? updated : p));
  };

  const updatePhase = (phaseId: string, updates: Partial<Phase>) => {
    if (!selectedProcess) return;

    const updated = {
      ...selectedProcess,
      phases: selectedProcess.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSelectedProcess(updated);
    setProcesses(processes.map(p => p.id === selectedProcess.id ? updated : p));
  };

  const deletePhase = (phaseId: string) => {
    if (!selectedProcess) return;
    if (confirm('¿Eliminar esta fase y todo su contenido?')) {
      const updated = {
        ...selectedProcess,
        phases: selectedProcess.phases.filter(p => p.id !== phaseId).map((p, idx) => ({ ...p, order: idx + 1 })),
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setSelectedProcess(updated);
      setProcesses(processes.map(p => p.id === selectedProcess.id ? updated : p));
    }
  };

  const togglePhaseExpand = (phaseId: string) => {
    if (!selectedProcess) return;
    updatePhase(phaseId, { isExpanded: !selectedProcess.phases.find(p => p.id === phaseId)?.isExpanded });
  };

  // ============ FUNCIONES DE SECCIÓN ============
  const addSection = (phaseId: string) => {
    if (!selectedProcess) return;
    const phase = selectedProcess.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const newSection: Section = {
      id: generateId(),
      title: `Sección ${phase.sections.length + 1}`,
      description: '',
      order: phase.sections.length + 1,
      questions: [],
      isExpanded: true
    };

    updatePhase(phaseId, { sections: [...phase.sections, newSection] });
  };

  const updateSection = (phaseId: string, sectionId: string, updates: Partial<Section>) => {
    if (!selectedProcess) return;
    const phase = selectedProcess.phases.find(p => p.id === phaseId);
    if (!phase) return;

    updatePhase(phaseId, {
      sections: phase.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    });
  };

  const deleteSection = (phaseId: string, sectionId: string) => {
    if (!selectedProcess) return;
    if (confirm('¿Eliminar esta sección?')) {
      const phase = selectedProcess.phases.find(p => p.id === phaseId);
      if (!phase) return;
      updatePhase(phaseId, {
        sections: phase.sections.filter(s => s.id !== sectionId).map((s, idx) => ({ ...s, order: idx + 1 }))
      });
    }
  };

  const toggleSectionExpand = (phaseId: string, sectionId: string) => {
    if (!selectedProcess) return;
    const phase = selectedProcess.phases.find(p => p.id === phaseId);
    if (!phase) return;
    const section = phase.sections.find(s => s.id === sectionId);
    if (!section) return;
    updateSection(phaseId, sectionId, { isExpanded: !section.isExpanded });
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
    if (!editingQuestion || !selectedProcess) return;
    
    const { phaseId, sectionId, question } = editingQuestion;
    
    if (!question.title.trim()) {
      dispatch(showToast({ message: 'El título de la pregunta es obligatorio', type: 'error' }));
      return;
    }

    const phase = selectedProcess.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const section = phase.sections.find(s => s.id === sectionId);
    if (!section) return;

    const existingQuestion = section.questions.find(q => q.id === question.id);
    let updatedQuestions: Question[];
    
    if (existingQuestion) {
      updatedQuestions = section.questions.map(q => q.id === question.id ? question : q);
    } else {
      updatedQuestions = [...section.questions, question];
    }

    updateSection(phaseId, sectionId, { questions: updatedQuestions });
    setEditingQuestion(null);
    dispatch(showToast({ message: 'Pregunta guardada', type: 'success' }));
  };

  const editQuestion = (phaseId: string, sectionId: string, question: Question) => {
    setEditingQuestion({ phaseId, sectionId, question: { ...question } });
  };

  const deleteQuestion = (phaseId: string, sectionId: string, questionId: string) => {
    if (!selectedProcess) return;
    if (confirm('¿Eliminar esta pregunta?')) {
      const phase = selectedProcess.phases.find(p => p.id === phaseId);
      if (!phase) return;
      const section = phase.sections.find(s => s.id === sectionId);
      if (!section) return;
      updateSection(phaseId, sectionId, { questions: section.questions.filter(q => q.id !== questionId) });
    }
  };

  // ============ FUNCIONES DE TABLA CONFIG ============
  const addTableColumn = () => {
    if (!editingQuestion || editingQuestion.question.inputType !== 'TABLA') return;
    
    const tableConfig = editingQuestion.question.tableConfig || { columns: [], minRows: 1, maxRows: 20 };
    const newColumn: TableColumn = {
      key: `col_${tableConfig.columns.length + 1}`,
      header: `Columna ${tableConfig.columns.length + 1}`,
      width: '25%'
    };

    setEditingQuestion({
      ...editingQuestion,
      question: {
        ...editingQuestion.question,
        tableConfig: { ...tableConfig, columns: [...tableConfig.columns, newColumn] }
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

  // ============ EXPORTAR ============
  const generateJSON = (process: Process) => {
    return {
      process: {
        idProcess: process.id,
        name: process.name,
        description: process.description,
        status: process.status,
        dateBegin: process.createdAt,
        dateEnd: '',
        currentPhaseOrder: 1,
        phases: process.phases.map((phase, phaseIdx) => ({
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
              ...(question.inputType === 'TEXTO' && { placeholder: question.placeholder, maxLength: question.maxLength }),
              ...(question.inputType === 'TABLA' && { tableConfig: question.tableConfig }),
              answer: { idAnswer: `ans-${generateId()}`, value: question.inputType === 'TABLA' ? [] : '', status: 'PENDING', createdAt: null, updatedAt: null }
            }))
          }))
        }))
      }
    };
  };

  const handleDownloadJSON = () => {
    if (!selectedProcess) return;
    const jsonData = generateJSON(selectedProcess);
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proceso-${selectedProcess.name.toLowerCase().replace(/\s/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch(showToast({ message: 'JSON descargado', type: 'success' }));
  };

  const handleCopyJSON = () => {
    if (!selectedProcess) return;
    const jsonData = generateJSON(selectedProcess);
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    dispatch(showToast({ message: 'JSON copiado al portapapeles', type: 'success' }));
  };

  // ============ HELPERS ============
  const getStatusColor = (status: Process['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'ACTIVE': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'COMPLETED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'ARCHIVED': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Process['status']) => {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activo';
      case 'COMPLETED': return 'Completado';
      case 'ARCHIVED': return 'Archivado';
      default: return status;
    }
  };

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXTO': return <FileText className="w-4 h-4" />;
      case 'DATE': return <Calendar className="w-4 h-4" />;
      case 'TABLA': return <Table className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTotalQuestions = (process: Process) => {
    return process.phases.reduce((acc, p) => acc + p.sections.reduce((acc2, s) => acc2 + s.questions.length, 0), 0);
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando procesos...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="flex h-[calc(100vh-2rem)] gap-6">
        {/* Panel Izquierdo - Lista de Procesos */}
        <div className="w-96 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Gestión de Fases</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{processes.length} procesos</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                title="Nuevo proceso"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar proceso..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                <option value="ALL">Todos los estados</option>
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activo</option>
                <option value="COMPLETED">Completado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>

          {/* Lista de Procesos */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredProcesses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No se encontraron procesos</p>
              </div>
            ) : (
              filteredProcesses.map((process) => (
                <button
                  key={process.id}
                  onClick={() => setSelectedProcess(process)}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all
                    ${selectedProcess?.id === process.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                      {process.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(process.status)}`}>
                      {getStatusLabel(process.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {process.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {process.phases.length} fases
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {getTotalQuestions(process)} preguntas
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel Derecho - Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {!selectedProcess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <FolderPlus className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Selecciona un proceso</p>
              <p className="text-sm">o crea uno nuevo para comenzar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Proceso
              </button>
            </div>
          ) : (
            <>
              {/* Header del Proceso */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedProcess.status)}`}>
                        {getStatusLabel(selectedProcess.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Actualizado: {selectedProcess.updatedAt}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {selectedProcess.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProcess.description || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJSON}
                      className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Copiar JSON"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Descargar JSON"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Vista previa"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                    <select
                      value={selectedProcess.status}
                      onChange={(e) => updateProcessStatus(selectedProcess.id, e.target.value as Process['status'])}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value="DRAFT">Borrador</option>
                      <option value="ACTIVE">Activo</option>
                      <option value="COMPLETED">Completado</option>
                      <option value="ARCHIVED">Archivado</option>
                    </select>
                    <button
                      onClick={() => deleteProcess(selectedProcess.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar proceso"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido - Fases */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedProcess.phases.map((phase) => (
                  <div 
                    key={phase.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                  >
                    {/* Phase Header */}
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 flex items-center gap-3">
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
                      
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={phase.title}
                          onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                          placeholder="Título de la fase"
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={phase.description}
                          onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                          placeholder="Descripción"
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                      </div>

                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {phase.sections.length} secciones
                      </span>
                      <button
                        onClick={() => deletePhase(phase.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Phase Content */}
                    {phase.isExpanded && (
                      <div className="p-4 space-y-3">
                        {/* Secciones */}
                        {phase.sections.map((section) => (
                          <div 
                            key={section.id}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                          >
                            {/* Section Header */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 flex items-center gap-2">
                              <button
                                onClick={() => toggleSectionExpand(phase.id, section.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              >
                                {section.isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                              </button>

                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateSection(phase.id, section.id, { title: e.target.value })}
                                  placeholder="Título sección"
                                  className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium text-gray-900 dark:text-white"
                                />
                                <input
                                  type="text"
                                  value={section.description}
                                  onChange={(e) => updateSection(phase.id, section.id, { description: e.target.value })}
                                  placeholder="Descripción"
                                  className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white"
                                />
                              </div>

                              <span className="text-xs text-gray-400">
                                {section.questions.length} preg.
                              </span>
                              <button
                                onClick={() => deleteSection(phase.id, section.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Questions */}
                            {section.isExpanded && (
                              <div className="p-3 space-y-2">
                                {section.questions.map((question) => (
                                  <div
                                    key={question.id}
                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg group"
                                  >
                                    <div className="w-7 h-7 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                      {getInputTypeIcon(question.inputType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                        {question.title || 'Sin título'}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        {question.inputType} {question.required && '• Obligatorio'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => editQuestion(phase.id, section.id, question)}
                                        className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                      >
                                        <Settings className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteQuestion(phase.id, section.id, question.id)}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  onClick={() => addQuestion(phase.id, section.id)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-green-400 hover:text-green-600 rounded-lg text-xs transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Agregar Pregunta
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => addSection(phase.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
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
            </>
          )}
        </div>

        {/* Modal Crear Proceso */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Proceso</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Proceso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProcessName}
                    onChange={(e) => setNewProcessName(e.target.value)}
                    placeholder="Ej: Implementación EGSI 2026"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={newProcessDescription}
                    onChange={(e) => setNewProcessDescription(e.target.value)}
                    placeholder="Descripción del proceso..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl">
                  Cancelar
                </button>
                <button onClick={createProcess} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                  Crear Proceso
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={editingQuestion.question.description}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, description: e.target.value }
                    })}
                    placeholder="Instrucciones..."
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
                      <h4 className="font-medium text-gray-900 dark:text-white">Columnas</h4>
                      <button onClick={addTableColumn} className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg">
                        <Plus className="w-4 h-4" /> Agregar
                      </button>
                    </div>
                    {editingQuestion.question.tableConfig?.columns.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={col.key}
                          onChange={(e) => updateTableColumn(idx, { key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                          placeholder="key"
                          className="w-24 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={col.header}
                          onChange={(e) => updateTableColumn(idx, { header: e.target.value })}
                          placeholder="Header"
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                        <button onClick={() => deleteTableColumn(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Filas Mínimas</label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.minRows || 1}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: { ...editingQuestion.question, tableConfig: { ...editingQuestion.question.tableConfig!, minRows: parseInt(e.target.value) }}
                          })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Filas Máximas</label>
                        <input
                          type="number"
                          value={editingQuestion.question.tableConfig?.maxRows || 20}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: { ...editingQuestion.question, tableConfig: { ...editingQuestion.question.tableConfig!, maxRows: parseInt(e.target.value) }}
                          })}
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
        {showPreview && selectedProcess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vista Previa JSON</h3>
                <button onClick={() => setShowPreview(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  {JSON.stringify(generateJSON(selectedProcess), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
