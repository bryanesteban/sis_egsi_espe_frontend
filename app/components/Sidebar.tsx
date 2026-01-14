'use client';

import { useState } from 'react';
import { 
  Home, 
  Shield, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  ClipboardCheck,
  FolderOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Eye,
  CheckSquare,
  UserCircle,
  Edit3,
  Calendar,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/app/store/hooks';

type UserRole = 'ADMIN' | 'USER' | 'VIEWER' | 'APPROVER' | 'EDITOR';

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  roles: UserRole[]; // Roles que pueden ver este item
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: Home, href: '/home', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Ver Procesos', icon: Eye, href: '/ver-procesos', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Gestión de Procesos', icon: FolderOpen, href: '/procesos', roles: ['ADMIN'] },
  { name: 'Gestión de Fases', icon: Layers, href: '/fases', roles: ['ADMIN'] },
  { name: 'Cuestionarios', icon: ClipboardCheck, href: '/cuestionarios', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Políticas', icon: Shield, href: '/politicas', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Documentos', icon: FileText, href: '/documentos', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Cronograma', icon: Calendar, href: '/cronograma', roles: ['ADMIN', 'USER', 'VIEWER', 'APPROVER'] },
  { name: 'Editor', icon: Edit3, href: '/editor', roles: ['ADMIN', 'USER', 'EDITOR'] },
  { name: 'Evaluaciones', icon: ClipboardCheck, href: '/evaluaciones', roles: ['ADMIN', 'USER', 'APPROVER'] },
  { name: 'Riesgos', icon: AlertCircle, href: '/riesgos', badge: 3, roles: ['ADMIN', 'USER', 'APPROVER'] },
  { name: 'Proyectos', icon: FolderOpen, href: '/proyectos', roles: ['ADMIN', 'USER'] },
  { name: 'Reportes', icon: BarChart3, href: '/reportes', roles: ['ADMIN', 'VIEWER', 'APPROVER'] },
  // Pantallas específicas por rol
  { name: 'Panel de Visualización', icon: Eye, href: '/visualizador', roles: ['ADMIN', 'VIEWER'] },
  { name: 'Panel de Aprobaciones', icon: CheckSquare, href: '/aprobador', roles: ['ADMIN', 'APPROVER'] },
  { name: 'Mi Espacio', icon: UserCircle, href: '/mi-espacio', roles: ['ADMIN', 'USER'] },
  // Solo admin
  { name: 'Usuarios', icon: Users, href: '/usuarios', roles: ['ADMIN'] },
  { name: 'Configuración', icon: Settings, href: '/configuracion', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  
  // Obtener el rol del usuario, por defecto USER si no está definido
  const userRole = (user?.rolename?.toUpperCase() as UserRole) || 'USER';
  
  // Filtrar items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg flex items-center justify-center transition-colors"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transition-all duration-300 z-40
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">SIEGSI</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                  </div>
                </div>
              )}
              
              {/* Collapse Button - Desktop only */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                  Sistema EGSI ESPE
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Versión 1.0.0
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
