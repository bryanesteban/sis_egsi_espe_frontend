'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  User, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown,
  Loader2,
  RefreshCw,
  Layers,
  MessageSquare,
  Eye
} from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';
import { phaseApprovalAPI, PhaseApprovalDTO } from '@/lib/api';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import Link from 'next/link';

export default function AprobadorPage() {
  const dispatch = useAppDispatch();
  const [approvals, setApprovals] = useState<PhaseApprovalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<PhaseApprovalDTO | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Cargar aprobaciones
  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await phaseApprovalAPI.getPending();
      setApprovals(response.approvals);
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      dispatch(showToast({ 
        message: 'Error al cargar las solicitudes', 
        type: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Aprobar solicitud
  const handleApprove = async (approval: PhaseApprovalDTO) => {
    try {
      setProcessing(approval.idApproval);
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const reviewedBy = user?.username || 'aprobador@espe.edu.ec';
      
      await phaseApprovalAPI.review({
        idApproval: approval.idApproval,
        action: 'APPROVED',
        reviewedBy,
      });
      
      dispatch(showToast({ 
        message: `Fase "${approval.phaseTitle}" aprobada correctamente. El proceso avanzará a la siguiente fase.`, 
        type: 'success' 
      }));
      
      fetchApprovals();
    } catch (err: any) {
      console.error('Error approving:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al aprobar la solicitud', 
        type: 'error' 
      }));
    } finally {
      setProcessing(null);
    }
  };

  // Rechazar solicitud
  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      dispatch(showToast({ 
        message: 'Debe proporcionar un motivo de rechazo', 
        type: 'error' 
      }));
      return;
    }
    
    try {
      setProcessing(selectedApproval.idApproval);
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const reviewedBy = user?.username || 'aprobador@espe.edu.ec';
      
      await phaseApprovalAPI.review({
        idApproval: selectedApproval.idApproval,
        action: 'REJECTED',
        reviewedBy,
        rejectionReason,
      });
      
      dispatch(showToast({ 
        message: `Fase "${selectedApproval.phaseTitle}" rechazada. El solicitante deberá realizar correcciones.`, 
        type: 'success' 
      }));
      
      setShowRejectModal(false);
      setSelectedApproval(null);
      setRejectionReason('');
      fetchApprovals();
    } catch (err: any) {
      console.error('Error rejecting:', err);
      dispatch(showToast({ 
        message: err.response?.data?.error || 'Error al rechazar la solicitud', 
        type: 'error' 
      }));
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (approval: PhaseApprovalDTO) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  // Filtrar aprobaciones
  const pendientes = approvals.filter(a => a.status === 'PENDING');
  const aprobadas = approvals.filter(a => a.status === 'APPROVED');
  const rechazadas = approvals.filter(a => a.status === 'REJECTED');

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-EC', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            Aprobada
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <XCircle className="w-3 h-3" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'APPROVER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              Panel de Aprobaciones de Fases
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona las solicitudes de aprobación de fases de los procesos EGSI
            </p>
          </div>
          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendientes.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{aprobadas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aprobadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rechazadas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rechazadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando solicitudes...</p>
          </div>
        ) : (
          <>
            {/* Solicitudes Pendientes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  Solicitudes Pendientes de Aprobación
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendientes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No hay solicitudes pendientes</p>
                    <p className="text-sm mt-1">Todas las fases están al día</p>
                  </div>
                ) : (
                  pendientes.map((approval) => (
                    <div key={approval.idApproval} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                              Fase {approval.phaseOrder}
                            </span>
                            {getStatusBadge(approval.status)}
                          </div>
                          
                          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                            {approval.phaseTitle}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Proceso: <span className="font-medium">{approval.processName}</span>
                          </p>
                          
                          {approval.comments && (
                            <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg mb-2">
                              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{approval.comments}</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {approval.requestedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(approval.requestedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/ver-procesos/${approval.idProcess}/fases/${approval.idPhase}?mode=review&approvalId=${approval.idApproval}`}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Fase
                          </Link>
                          <button
                            onClick={() => handleApprove(approval)}
                            disabled={processing === approval.idApproval}
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {processing === approval.idApproval ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ThumbsUp className="w-4 h-4" />
                            )}
                            Aprobar
                          </button>
                          <button
                            onClick={() => openRejectModal(approval)}
                            disabled={processing === approval.idApproval}
                            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Historial */}
            {(aprobadas.length > 0 || rechazadas.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Historial de Revisiones
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fase</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Proceso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Solicitante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revisor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[...aprobadas, ...rechazadas]
                        .sort((a, b) => new Date(b.reviewedAt || '').getTime() - new Date(a.reviewedAt || '').getTime())
                        .map((approval) => (
                          <tr key={approval.idApproval} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Fase {approval.phaseOrder}: {approval.phaseTitle}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {approval.processName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {approval.requestedBy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {approval.reviewedBy || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(approval.reviewedAt || '')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(approval.status)}
                              {approval.status === 'REJECTED' && approval.rejectionReason && (
                                <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={approval.rejectionReason}>
                                  {approval.rejectionReason}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Rechazo */}
        {showRejectModal && selectedApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rechazar Solicitud
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fase {selectedApproval.phaseOrder}: {selectedApproval.phaseTitle}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Por favor, proporcione un motivo de rechazo para que el solicitante pueda 
                realizar las correcciones necesarias.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo de Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: Faltan documentos de soporte, información incompleta..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedApproval(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing !== null || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-4 h-4" />
                      Confirmar Rechazo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
