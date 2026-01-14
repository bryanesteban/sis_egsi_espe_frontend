'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Calendar,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ClipboardList,
  AlertCircle,
  Lock,
  Play
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

interface Answer {
  idAnswer: string;
  value: string | string[] | Record<string, string>[];
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  createdAt: string | null;
  updatedAt: string | null;
}

interface Question {
  idQuestion: number;
  title: string;
  description: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: TableConfig;
  answer: Answer;
}

interface Section {
  idSection: string;
  title: string;
  description: string;
  order: number;
  questions: Question[];
}

interface Phase {
  idPhase: string;
  title: string;
  description: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  order: number;
  isCompleted: boolean;
  completedPercentage: number;
  sections: Section[];
}

interface Process {
  idProcess: string;
  name: string;
  description: string;
  status: string;
  dateBegin: string;
  dateEnd: string;
  currentPhaseOrder: number;
  phases: Phase[];
}

interface ProcessData {
  process: Process;
}

// ============ DATOS DE PRUEBA ============
const MOCK_DATA: ProcessData = {
  "process": {
    "idProcess": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Implementación EGSI - ESPE 2026",
    "description": "Proceso de implementación del Esquema Gubernamental de Seguridad de la Información.",
    "status": "IN_PROGRESS",
    "dateBegin": "2026-01-15",
    "dateEnd": "2026-12-31",
    "currentPhaseOrder": 1,
    "phases": [
      {
        "idPhase": "phase-001",
        "title": "Fase 1: Diagnóstico Inicial",
        "description": "Realizar un diagnóstico completo del estado actual de la seguridad de la información en la institución.",
        "status": "ACTIVE",
        "order": 1,
        "isCompleted": false,
        "completedPercentage": 0,
        "sections": [
          {
            "idSection": "sec-001",
            "title": "1.1 Información General de la Institución",
            "description": "Complete la información básica de identificación institucional.",
            "order": 1,
            "questions": [
              {
                "idQuestion": 1,
                "title": "Nombre de la Institución",
                "description": "Ingrese el nombre oficial completo de la institución.",
                "inputType": "TEXTO",
                "required": true,
                "placeholder": "Ej: Universidad de las Fuerzas Armadas ESPE",
                "answer": { "idAnswer": "ans-001", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              },
              {
                "idQuestion": 2,
                "title": "Fecha de Inicio del Diagnóstico",
                "description": "Seleccione la fecha de inicio del diagnóstico.",
                "inputType": "DATE",
                "required": true,
                "answer": { "idAnswer": "ans-002", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              },
              {
                "idQuestion": 3,
                "title": "Responsable del Proceso",
                "description": "Nombre del funcionario responsable del proceso EGSI.",
                "inputType": "TEXTO",
                "required": true,
                "placeholder": "Ej: Ing. Juan Pérez García",
                "answer": { "idAnswer": "ans-003", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          },
          {
            "idSection": "sec-002",
            "title": "1.2 Alcance del Sistema de Gestión",
            "description": "Defina el alcance del SGSI.",
            "order": 2,
            "questions": [
              {
                "idQuestion": 4,
                "title": "Descripción del Alcance",
                "description": "Describa detalladamente el alcance del SGSI.",
                "inputType": "TEXTO",
                "required": true,
                "placeholder": "Describa el alcance del sistema...",
                "maxLength": 2000,
                "answer": { "idAnswer": "ans-004", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              },
              {
                "idQuestion": 5,
                "title": "Ubicaciones Físicas",
                "description": "Liste todas las ubicaciones físicas dentro del alcance.",
                "inputType": "TABLA",
                "required": true,
                "tableConfig": {
                  "columns": [
                    { "key": "ubicacion", "header": "Ubicación", "width": "30%" },
                    { "key": "direccion", "header": "Dirección", "width": "40%" },
                    { "key": "responsable", "header": "Responsable", "width": "30%" }
                  ],
                  "minRows": 1,
                  "maxRows": 20
                },
                "answer": { "idAnswer": "ans-005", "value": [], "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          }
        ]
      },
      {
        "idPhase": "phase-002",
        "title": "Fase 2: Análisis de Riesgos",
        "description": "Identificar, analizar y evaluar los riesgos de seguridad de la información.",
        "status": "LOCKED",
        "order": 2,
        "isCompleted": false,
        "completedPercentage": 0,
        "sections": [
          {
            "idSection": "sec-003",
            "title": "2.1 Identificación de Activos",
            "description": "Identifique los activos de información críticos.",
            "order": 1,
            "questions": [
              {
                "idQuestion": 6,
                "title": "Inventario de Activos Críticos",
                "description": "Complete la tabla con los activos críticos.",
                "inputType": "TABLA",
                "required": true,
                "tableConfig": {
                  "columns": [
                    { "key": "codigo", "header": "Código", "width": "10%" },
                    { "key": "nombre", "header": "Nombre", "width": "30%" },
                    { "key": "tipo", "header": "Tipo", "width": "20%" },
                    { "key": "propietario", "header": "Propietario", "width": "20%" },
                    { "key": "criticidad", "header": "Criticidad", "width": "20%" }
                  ],
                  "minRows": 1,
                  "maxRows": 50
                },
                "answer": { "idAnswer": "ans-006", "value": [], "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          },
          {
            "idSection": "sec-004",
            "title": "2.2 Evaluación de Riesgos",
            "description": "Evalúe los riesgos identificados.",
            "order": 2,
            "questions": [
              {
                "idQuestion": 7,
                "title": "Metodología de Evaluación",
                "description": "Describa la metodología utilizada.",
                "inputType": "TEXTO",
                "required": true,
                "placeholder": "Describa la metodología...",
                "answer": { "idAnswer": "ans-007", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              },
              {
                "idQuestion": 8,
                "title": "Matriz de Riesgos",
                "description": "Complete la matriz de riesgos.",
                "inputType": "TABLA",
                "required": true,
                "tableConfig": {
                  "columns": [
                    { "key": "riesgo", "header": "Riesgo", "width": "30%" },
                    { "key": "probabilidad", "header": "Prob.", "width": "15%" },
                    { "key": "impacto", "header": "Impacto", "width": "15%" },
                    { "key": "nivel", "header": "Nivel", "width": "15%" },
                    { "key": "tratamiento", "header": "Tratamiento", "width": "25%" }
                  ],
                  "minRows": 1,
                  "maxRows": 100
                },
                "answer": { "idAnswer": "ans-008", "value": [], "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          }
        ]
      },
      {
        "idPhase": "phase-003",
        "title": "Fase 3: Plan de Tratamiento",
        "description": "Desarrollar el plan de tratamiento de riesgos.",
        "status": "LOCKED",
        "order": 3,
        "isCompleted": false,
        "completedPercentage": 0,
        "sections": [
          {
            "idSection": "sec-005",
            "title": "3.1 Selección de Controles",
            "description": "Seleccione los controles apropiados.",
            "order": 1,
            "questions": [
              {
                "idQuestion": 9,
                "title": "Controles Seleccionados",
                "description": "Liste los controles del Anexo A de ISO 27001.",
                "inputType": "TABLA",
                "required": true,
                "tableConfig": {
                  "columns": [
                    { "key": "control", "header": "Control", "width": "20%" },
                    { "key": "descripcion", "header": "Descripción", "width": "40%" },
                    { "key": "riesgo", "header": "Riesgo", "width": "20%" },
                    { "key": "responsable", "header": "Responsable", "width": "20%" }
                  ],
                  "minRows": 1,
                  "maxRows": 50
                },
                "answer": { "idAnswer": "ans-009", "value": [], "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          },
          {
            "idSection": "sec-006",
            "title": "3.2 Cronograma",
            "description": "Defina el cronograma de implementación.",
            "order": 2,
            "questions": [
              {
                "idQuestion": 10,
                "title": "Fecha de Inicio",
                "description": "Fecha de inicio del plan.",
                "inputType": "DATE",
                "required": true,
                "answer": { "idAnswer": "ans-010", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              },
              {
                "idQuestion": 11,
                "title": "Fecha de Finalización",
                "description": "Fecha estimada de finalización.",
                "inputType": "DATE",
                "required": true,
                "answer": { "idAnswer": "ans-011", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          }
        ]
      },
      {
        "idPhase": "phase-004",
        "title": "Fase 4: Implementación",
        "description": "Implementar los controles de seguridad.",
        "status": "LOCKED",
        "order": 4,
        "isCompleted": false,
        "completedPercentage": 0,
        "sections": [
          {
            "idSection": "sec-007",
            "title": "4.1 Políticas de Seguridad",
            "description": "Documente las políticas implementadas.",
            "order": 1,
            "questions": [
              {
                "idQuestion": 12,
                "title": "Política General de Seguridad",
                "description": "Describa la política general.",
                "inputType": "TEXTO",
                "required": true,
                "placeholder": "Describa la política...",
                "maxLength": 5000,
                "answer": { "idAnswer": "ans-012", "value": "", "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          }
        ]
      },
      {
        "idPhase": "phase-005",
        "title": "Fase 5: Monitoreo",
        "description": "Establecer mecanismos de monitoreo y mejora continua.",
        "status": "LOCKED",
        "order": 5,
        "isCompleted": false,
        "completedPercentage": 0,
        "sections": [
          {
            "idSection": "sec-008",
            "title": "5.1 Indicadores",
            "description": "Defina los indicadores de desempeño.",
            "order": 1,
            "questions": [
              {
                "idQuestion": 13,
                "title": "KPIs de Seguridad",
                "description": "Liste los indicadores clave.",
                "inputType": "TABLA",
                "required": true,
                "tableConfig": {
                  "columns": [
                    { "key": "indicador", "header": "Indicador", "width": "30%" },
                    { "key": "meta", "header": "Meta", "width": "20%" },
                    { "key": "frecuencia", "header": "Frecuencia", "width": "20%" },
                    { "key": "responsable", "header": "Responsable", "width": "30%" }
                  ],
                  "minRows": 3,
                  "maxRows": 20
                },
                "answer": { "idAnswer": "ans-013", "value": [], "status": "PENDING", "createdAt": null, "updatedAt": null }
              }
            ]
          }
        ]
      }
    ]
  }
};

// ============ COMPONENTE PRINCIPAL ============
export default function FaseDinamicaPage() {
  const dispatch = useAppDispatch();
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());

  // Cargar datos al inicio
  useEffect(() => {
    setTimeout(() => {
      setProcessData(MOCK_DATA);
      initializeAnswers(MOCK_DATA);
      setLoading(false);
    }, 500);
  }, []);

  // Inicializar respuestas cuando cambia de fase
  const initializeAnswers = (data: ProcessData, phaseIndex: number = 0) => {
    const phase = data.process.phases[phaseIndex];
    const initialAnswers = new Map<number, any>();
    
    phase.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.inputType === 'TABLA') {
          const tableValue = question.answer.value as Record<string, string>[];
          initialAnswers.set(question.idQuestion, tableValue.length > 0 ? tableValue : [createEmptyRow(question.tableConfig!)]);
        } else {
          initialAnswers.set(question.idQuestion, question.answer.value);
        }
      });
    });
    
    setAnswers(initialAnswers);
    setExpandedSections(new Set(phase.sections.map(s => s.idSection)));
  };

  // Crear fila vacía para tabla
  const createEmptyRow = (tableConfig: TableConfig): Record<string, string> => {
    const row: Record<string, string> = {};
    tableConfig.columns.forEach(col => {
      row[col.key] = '';
    });
    return row;
  };

  // Toggle sección
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Actualizar respuesta de texto/fecha
  const updateAnswer = (questionId: number, value: string) => {
    setAnswers(prev => {
      const newMap = new Map(prev);
      newMap.set(questionId, value);
      return newMap;
    });
  };

  // Actualizar celda de tabla
  const updateTableCell = (questionId: number, rowIndex: number, columnKey: string, value: string) => {
    setAnswers(prev => {
      const newMap = new Map(prev);
      const tableData = [...(newMap.get(questionId) || [])];
      tableData[rowIndex] = { ...tableData[rowIndex], [columnKey]: value };
      newMap.set(questionId, tableData);
      return newMap;
    });
  };

  // Agregar fila a tabla
  const addTableRow = (questionId: number, tableConfig: TableConfig) => {
    setAnswers(prev => {
      const newMap = new Map(prev);
      const tableData = [...(newMap.get(questionId) || [])];
      if (!tableConfig.maxRows || tableData.length < tableConfig.maxRows) {
        tableData.push(createEmptyRow(tableConfig));
        newMap.set(questionId, tableData);
      }
      return newMap;
    });
  };

  // Eliminar fila de tabla
  const removeTableRow = (questionId: number, rowIndex: number, tableConfig: TableConfig) => {
    setAnswers(prev => {
      const newMap = new Map(prev);
      const tableData = [...(newMap.get(questionId) || [])];
      const minRows = tableConfig.minRows || 1;
      if (tableData.length > minRows) {
        tableData.splice(rowIndex, 1);
        newMap.set(questionId, tableData);
      }
      return newMap;
    });
  };

  // Guardar fase actual
  const handleSavePhase = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Respuestas fase guardadas:', Object.fromEntries(answers));
    dispatch(showToast({ message: 'Fase guardada correctamente', type: 'success' }));
    setSaving(false);
  };

  // Completar fase y pasar a la siguiente
  const handleCompletePhase = async () => {
    if (!processData) return;
    
    const progress = calculateProgress();
    if (progress.percentage < 100) {
      dispatch(showToast({ message: 'Debes completar todos los campos obligatorios antes de continuar', type: 'error' }));
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Actualizar estado de la fase
    const updatedData = { ...processData };
    updatedData.process.phases[currentPhaseIndex].status = 'COMPLETED';
    updatedData.process.phases[currentPhaseIndex].isCompleted = true;
    updatedData.process.phases[currentPhaseIndex].completedPercentage = 100;
    
    // Desbloquear siguiente fase si existe
    if (currentPhaseIndex + 1 < updatedData.process.phases.length) {
      updatedData.process.phases[currentPhaseIndex + 1].status = 'ACTIVE';
      updatedData.process.currentPhaseOrder = currentPhaseIndex + 2;
    }
    
    setProcessData(updatedData);
    dispatch(showToast({ message: '¡Fase completada! Avanzando a la siguiente fase...', type: 'success' }));
    
    // Pasar a la siguiente fase
    if (currentPhaseIndex + 1 < updatedData.process.phases.length) {
      setTimeout(() => {
        goToPhase(currentPhaseIndex + 1);
      }, 500);
    }
    
    setSaving(false);
  };

  // Navegar a una fase específica
  const goToPhase = (index: number) => {
    if (!processData) return;
    const phase = processData.process.phases[index];
    if (phase.status === 'LOCKED') {
      dispatch(showToast({ message: 'Esta fase está bloqueada. Completa las fases anteriores primero.', type: 'error' }));
      return;
    }
    setCurrentPhaseIndex(index);
    initializeAnswers(processData, index);
  };

  // Calcular progreso de la fase actual
  const calculateProgress = () => {
    if (!processData) return { completed: 0, total: 0, percentage: 0 };
    
    const phase = processData.process.phases[currentPhaseIndex];
    let completed = 0;
    let total = 0;
    
    phase.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required) {
          total++;
          const answer = answers.get(question.idQuestion);
          if (question.inputType === 'TABLA') {
            const tableData = answer as Record<string, string>[];
            const hasData = tableData && tableData.length > 0 && tableData.some(row => 
              Object.values(row).some(val => val && val.trim() !== '')
            );
            if (hasData) completed++;
          } else {
            if (answer && answer.trim() !== '') completed++;
          }
        }
      });
    });
    
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Verificar si una pregunta está completada
  const isQuestionCompleted = (question: Question) => {
    const answer = answers.get(question.idQuestion);
    if (question.inputType === 'TABLA') {
      const tableData = answer as Record<string, string>[];
      return tableData && tableData.length > 0 && tableData.some(row => 
        Object.values(row).some(val => val && val.trim() !== '')
      );
    }
    return answer && answer.trim() !== '';
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando formulario...</p>
        </div>
      </RoleGuard>
    );
  }

  if (!processData) {
    return (
      <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Error al cargar el formulario</p>
        </div>
      </RoleGuard>
    );
  }

  const currentPhase = processData.process.phases[currentPhaseIndex];
  const progress = calculateProgress();
  const isLastPhase = currentPhaseIndex === processData.process.phases.length - 1;

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header con navegación */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/cuestionarios"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a cuestionarios</span>
          </Link>
          
          {/* Nombre del Proceso */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{processData.process.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{processData.process.description}</p>
          </div>

          {/* Navegador de Fases */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Fases del Proceso</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {processData.process.phases.map((phase, index) => {
                const isActive = index === currentPhaseIndex;
                const isLocked = phase.status === 'LOCKED';
                const isCompleted = phase.status === 'COMPLETED';
                
                return (
                  <button
                    key={phase.idPhase}
                    onClick={() => goToPhase(index)}
                    disabled={isLocked}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all min-w-fit
                      ${isActive 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : isCompleted
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : isLocked
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">Fase {index + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título de la Fase Actual */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                    Fase {currentPhaseIndex + 1} de {processData.process.phases.length}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{currentPhase.title}</h1>
                <p className="text-purple-100 text-sm leading-relaxed">
                  {currentPhase.description}
                </p>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progreso de la fase</span>
                <span>{progress.completed} de {progress.total} campos obligatorios</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-right text-sm mt-1 font-semibold">{progress.percentage}% completado</p>
            </div>
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-4">
          {currentPhase.sections.map((section) => {
            const isExpanded = expandedSections.has(section.idSection);
            const sectionQuestions = section.questions;
            const completedInSection = sectionQuestions.filter(q => isQuestionCompleted(q)).length;
            
            return (
              <div 
                key={section.idSection}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.idSection)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      completedInSection === sectionQuestions.length 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {completedInSection === sectionQuestions.length ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {completedInSection} de {sectionQuestions.length} preguntas completadas
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 py-4 border-b border-gray-100 dark:border-gray-700">
                      {section.description}
                    </p>

                    <div className="space-y-6 pt-4">
                      {section.questions.map((question) => (
                        <div key={question.idQuestion} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isQuestionCompleted(question) ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {question.title}
                                {question.required && <span className="text-red-500 text-sm">*</span>}
                              </label>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {question.description}
                              </p>
                            </div>
                          </div>

                          <div className="ml-8">
                            {question.inputType === 'TEXTO' && (
                              <textarea
                                value={answers.get(question.idQuestion) || ''}
                                onChange={(e) => updateAnswer(question.idQuestion, e.target.value)}
                                placeholder={question.placeholder}
                                maxLength={question.maxLength}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                              />
                            )}

                            {question.inputType === 'DATE' && (
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <input
                                  type="date"
                                  value={answers.get(question.idQuestion) || ''}
                                  onChange={(e) => updateAnswer(question.idQuestion, e.target.value)}
                                  className="flex-1 max-w-xs px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                />
                              </div>
                            )}

                            {question.inputType === 'TABLA' && question.tableConfig && (
                              <div className="space-y-3">
                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-xl">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        {question.tableConfig.columns.map((col) => (
                                          <th 
                                            key={col.key}
                                            className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600"
                                            style={{ width: col.width }}
                                          >
                                            {col.header}
                                          </th>
                                        ))}
                                        <th className="w-12 px-2 py-3 border-b border-gray-200 dark:border-gray-600"></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(answers.get(question.idQuestion) as Record<string, string>[] || []).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                                          {question.tableConfig!.columns.map((col) => (
                                            <td key={col.key} className="p-0">
                                              <input
                                                type="text"
                                                value={row[col.key] || ''}
                                                onChange={(e) => updateTableCell(question.idQuestion, rowIndex, col.key, e.target.value)}
                                                className="w-full px-4 py-3 bg-transparent focus:bg-gray-50 dark:focus:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 text-gray-900 dark:text-white"
                                                placeholder={`${col.header}...`}
                                              />
                                            </td>
                                          ))}
                                          <td className="px-2 py-2 text-center">
                                            <button
                                              onClick={() => removeTableRow(question.idQuestion, rowIndex, question.tableConfig!)}
                                              disabled={(answers.get(question.idQuestion) as Record<string, string>[])?.length <= (question.tableConfig?.minRows || 1)}
                                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                                  onClick={() => addTableRow(question.idQuestion, question.tableConfig!)}
                                  disabled={(answers.get(question.idQuestion) as Record<string, string>[])?.length >= (question.tableConfig?.maxRows || 100)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                  Agregar fila
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botones de acción */}
        <div className="sticky bottom-4 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Navegación anterior */}
          <button
            onClick={() => goToPhase(currentPhaseIndex - 1)}
            disabled={currentPhaseIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Fase Anterior</span>
          </button>

          {/* Botones centrales */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePhase}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span className="hidden sm:inline">Guardar</span>
            </button>

            <button
              onClick={handleCompletePhase}
              disabled={saving || progress.percentage < 100}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium
                ${progress.percentage === 100 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="hidden sm:inline">{isLastPhase ? 'Finalizar Proceso' : 'Completar y Continuar'}</span>
              <span className="sm:hidden">{isLastPhase ? 'Finalizar' : 'Completar'}</span>
            </button>
          </div>

          {/* Navegación siguiente */}
          <button
            onClick={() => goToPhase(currentPhaseIndex + 1)}
            disabled={currentPhaseIndex === processData.process.phases.length - 1 || processData.process.phases[currentPhaseIndex + 1]?.status === 'LOCKED'}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Siguiente Fase</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}
