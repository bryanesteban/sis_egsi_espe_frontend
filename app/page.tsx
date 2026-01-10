'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from './store/hooks';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-3xl font-bold text-white">S</span>
        </div>
      </div>
    </div>
  );
}
