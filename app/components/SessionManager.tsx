'use client';

import { useSessionManager } from '../hooks/useSessionManager';
import SessionTimeoutModal from './SessionTimeoutModal';

export default function SessionManager() {
  const { showModal, countdown, handleRenew, handleLogout } = useSessionManager();

  return (
    <SessionTimeoutModal
      isOpen={showModal}
      countdown={countdown}
      onRenew={handleRenew}
      onLogout={handleLogout}
    />
  );
}
