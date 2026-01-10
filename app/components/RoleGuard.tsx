'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import { ShieldAlert, Loader2 } from 'lucide-react';

type UserRole = 'ADMIN' | 'USER' | 'VIEWER' | 'APPROVER';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackUrl = '/home' }: RoleGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const userRole = (user?.rolename?.toUpperCase() as UserRole) || 'USER';
  const hasAccess = allowedRoles.includes(userRole);

  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      dispatch(showToast({ 
        message: 'No tienes permisos para acceder a esta sección', 
        type: 'error' 
      }));
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, hasAccess, router, dispatch, fallbackUrl]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Acceso Denegado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
