'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Target,
  TrendingUp,
  FileText,
  ArrowRight,
  Play,
  Pause,
  Archive,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import RoleGuard from '@/app/components/RoleGuard';
import Link from 'next/link';

// ============ TIPOS ============
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number;
  startDate: string;
  endDate: string;
  budget?: number;
  team: TeamMember[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  category: string;
}

// ============ DATOS DE PRUEBA ============
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Implementación EGSI 2026',
    description: 'Proyecto principal de implementación del Esquema Gubernamental de Seguridad de la Información para la institución.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    progress: 45,
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    budget: 150000,
    category: 'Seguridad',
    team: [
      { id: 't1', name: 'Juan Pérez', role: 'Project Manager' },
      { id: 't2', name: 'María García', role: 'Analista de Seguridad' },
      { id: 't3', name: 'Carlos López', role: 'Desarrollador' },
    ],
    milestones: [
      { id: 'm1', title: 'Diagnóstico Inicial', dueDate: '2026-02-28', status: 'COMPLETED' },
      { id: 'm2', title: 'Análisis de Riesgos', dueDate: '2026-04-30', status: 'IN_PROGRESS' },
      { id: 'm3', title: 'Plan de Tratamiento', dueDate: '2026-06-30', status: 'PENDING' },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-13'
  },
  {
    id: 'proj-002',
    name: 'Auditoría Interna SGSI',
    description: 'Proceso de auditoría interna del sistema de gestión de seguridad de la información.',
    status: 'PLANNING',
    priority: 'HIGH',
    progress: 10,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    budget: 25000,
    category: 'Auditoría',
    team: [
      { id: 't4', name: 'Ana Martínez', role: 'Auditor Líder' },
      { id: 't5', name: 'Pedro Sánchez', role: 'Auditor' },
    ],
    milestones: [
      { id: 'm4', title: 'Plan de Auditoría', dueDate: '2026-03-15', status: 'PENDING' },
      { id: 'm5', title: 'Ejecución', dueDate: '2026-04-30', status: 'PENDING' },
    ],
    createdAt: '2026-01-12',
    updatedAt: '2026-01-12'
  },
  {
    id: 'proj-003',
    name: 'Capacitación en Seguridad',
    description: 'Programa de capacitación y concientización en seguridad de la información para todo el personal.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    progress: 65,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    budget: 15000,
    category: 'Capacitación',
    team: [
      { id: 't6', name: 'Laura Vega', role: 'Capacitador' },
    ],
    milestones: [
      { id: 'm6', title: 'Módulo 1 - Fundamentos', dueDate: '2026-02-15', status: 'COMPLETED' },
      { id: 'm7', title: 'Módulo 2 - Políticas', dueDate: '2026-03-31', status: 'COMPLETED' },
      { id: 'm8', title: 'Módulo 3 - Incidentes', dueDate: '2026-05-15', status: 'IN_PROGRESS' },
    ],
    createdAt: '2025-12-20',
    updatedAt: '2026-01-10'
  },
  {
    id: 'proj-004',
    name: 'Actualización de Políticas',
    description: 'Revisión y actualización de todas las políticas de seguridad de la información.',
    status: 'COMPLETED',
    priority: 'HIGH',
    progress: 100,
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    category: 'Documentación',
    team: [
      { id: 't7', name: 'Roberto Díaz', role: 'Analista' },
      { id: 't8', name: 'Sandra Ruiz', role: 'Revisor' },
    ],
    milestones: [
      { id: 'm9', title: 'Revisión', dueDate: '2025-11-15', status: 'COMPLETED' },
      { id: 'm10', title: 'Aprobación', dueDate: '2025-12-31', status: 'COMPLETED' },
    ],
    createdAt: '2025-09-25',
    updatedAt: '2025-12-31'
  },
  {
    id: 'proj-005',
    name: 'Implementación de Controles',
    description: 'Implementación de controles técnicos según el análisis de riesgos.',
    status: 'ON_HOLD',
    priority: 'MEDIUM',
    progress: 30,
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    budget: 80000,
    category: 'Técnico',
    team: [
      { id: 't9', name: 'Miguel Torres', role: 'Ingeniero' },
    ],
    milestones: [],
    createdAt: '2026-01-08',
    updatedAt: '2026-01-11'
  }
];

const CATEGORIES = ['Todos', 'Seguridad', 'Auditoría', 'Capacitación', 'Documentación', 'Técnico'];

// ============ GENERADOR DE ID ============
const generateId = () => `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ COMPONENTE PRINCIPAL ============
export default function ProyectosPage() {
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Formulario nuevo proyecto
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: 'Seguridad',
    priority: 'MEDIUM' as Project['priority'],
    startDate: '',
    endDate: '',
    budget: ''
  });

  // Cargar datos
  useEffect(() => {
    setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrar proyectos
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Estadísticas
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    avgProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) || 0
  };

  // Crear proyecto
  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      dispatch(showToast({ message: 'El nombre del proyecto es obligatorio', type: 'error' }));
      return;
    }

    const project: Project = {
      id: generateId(),
      name: newProject.name,
      description: newProject.description,
      status: 'PLANNING',
      priority: newProject.priority,
      progress: 0,
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      endDate: newProject.endDate || '',
      budget: newProject.budget ? parseFloat(newProject.budget) : undefined,
      category: newProject.category,
      team: [],
      milestones: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setProjects([project, ...projects]);
    setNewProject({ name: '', description: '', category: 'Seguridad', priority: 'MEDIUM', startDate: '', endDate: '', budget: '' });
    setShowCreateModal(false);
    dispatch(showToast({ message: 'Proyecto creado correctamente', type: 'success' }));
  };

  // Actualizar estado
  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
    setActiveDropdown(null);
    dispatch(showToast({ message: 'Estado actualizado', type: 'success' }));
  };

  // Eliminar proyecto
  const deleteProject = (projectId: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      dispatch(showToast({ message: 'Proyecto eliminado', type: 'success' }));
    }
    setActiveDropdown(null);
  };

  // Ver detalles
  const viewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
    setActiveDropdown(null);
  };

  // Helpers
  const getStatusConfig = (status: Project['status']) => {
    const configs = {
      'PLANNING': { label: 'Planificación', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Target },
      'IN_PROGRESS': { label: 'En Progreso', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: Play },
      'ON_HOLD': { label: 'En Pausa', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Pause },
      'COMPLETED': { label: 'Completado', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: CheckCircle2 },
      'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: X }
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: Project['priority']) => {
    const configs = {
      'LOW': { label: 'Baja', color: 'text-gray-500' },
      'MEDIUM': { label: 'Media', color: 'text-blue-500' },
      'HIGH': { label: 'Alta', color: 'text-orange-500' },
      'CRITICAL': { label: 'Crítica', color: 'text-red-500' }
    };
    return configs[priority];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'No definido';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(budget);
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN', 'USER']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando proyectos...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              Gestión de Proyectos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra y da seguimiento a los proyectos de implementación EGSI
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all shadow-lg shadow-green-500/30"
          >
            <Plus className="w-5 h-5" />
            Nuevo Proyecto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">En Progreso</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onHold}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">En Pausa</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgProgress}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyectos..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PLANNING">Planificación</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="ON_HOLD">En Pausa</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron proyectos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'Todos' 
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza creando tu primer proyecto'}
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              const priorityConfig = getPriorityConfig(project.priority);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                              onClick={() => viewProjectDetails(project)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" /> Ver detalles
                            </button>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'IN_PROGRESS')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Play className="w-4 h-4" /> Iniciar
                            </button>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'ON_HOLD')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Pause className="w-4 h-4" /> Pausar
                            </button>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'COMPLETED')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Completar
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => deleteProject(project.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(project.progress)} rounded-full transition-all`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {project.startDate}
                      </span>
                      <span className={`font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        {project.team.length} miembros
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Footer - Milestones */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {project.milestones.filter(m => m.status === 'COMPLETED').length}/{project.milestones.length} hitos completados
                      </span>
                      <button
                        onClick={() => viewProjectDetails(project)}
                        className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                      >
                        Ver más <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Crear Proyecto */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Proyecto</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Ej: Implementación EGSI 2026"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Descripción del proyecto..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                    >
                      {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridad</label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project['priority'] })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="CRITICAL">Crítica</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Inicio</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Fin</label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presupuesto (USD)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCreateProject} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
                  Crear Proyecto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle Proyecto */}
        {showDetailModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedProject.status).color}`}>
                      {getStatusConfig(selectedProject.status).label}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityConfig(selectedProject.priority).color}`}>
                      Prioridad {getPriorityConfig(selectedProject.priority).label}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProject.name}</h3>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Descripción */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProject.description || 'Sin descripción'}</p>
                </div>

                {/* Progreso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso General</h4>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedProject.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(selectedProject.progress)} rounded-full transition-all`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha Inicio</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.startDate}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha Fin</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.endDate || 'No definida'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Presupuesto</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatBudget(selectedProject.budget)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categoría</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.category}</p>
                  </div>
                </div>

                {/* Equipo */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Equipo ({selectedProject.team.length})</h4>
                  {selectedProject.team.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay miembros asignados</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.team.map(member => (
                        <div key={member.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hitos */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hitos ({selectedProject.milestones.length})</h4>
                  {selectedProject.milestones.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay hitos definidos</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.milestones.map(milestone => (
                        <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === 'COMPLETED' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                              : milestone.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                          }`}>
                            {milestone.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha límite: {milestone.dueDate}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            milestone.status === 'COMPLETED'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : milestone.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {milestone.status === 'COMPLETED' ? 'Completado' : milestone.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-xl transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
