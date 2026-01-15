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
  Eye,
  Download
} from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';
import { phaseApprovalAPI, PhaseApprovalDTO, egsiPhasesAPI, egsiAnswersAPI } from '@/lib/api';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AprobadorPage() {
  const dispatch = useAppDispatch();
  const [approvals, setApprovals] = useState<PhaseApprovalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<PhaseApprovalDTO | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

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

  // Función para extraer texto limpio de contenido BlockNote JSON
  const extractTextFromBlockNote = (jsonString: string): string => {
    try {
      const blocks = JSON.parse(jsonString);
      if (!Array.isArray(blocks)) return jsonString;
      
      const extractText = (content: any[]): string => {
        if (!Array.isArray(content)) return '';
        return content.map(item => {
          if (item.type === 'text') {
            return item.text || '';
          }
          if (item.content) {
            return extractText(item.content);
          }
          return '';
        }).join('');
      };
      
      const textParts: string[] = [];
      blocks.forEach(block => {
        if (block.content) {
          const text = extractText(block.content);
          if (text.trim()) {
            if (block.type === 'bulletListItem') {
              textParts.push(`• ${text}`);
            } else if (block.type === 'numberedListItem') {
              textParts.push(`- ${text}`);
            } else {
              textParts.push(text);
            }
          }
        }
      });
      
      return textParts.join('\n') || 'Sin contenido';
    } catch {
      return jsonString.replace(/<[^>]*>/g, '').trim() || jsonString;
    }
  };

  // Generar PDF de la fase pendiente de aprobación
  const handleDownloadPdf = async (approval: PhaseApprovalDTO) => {
    try {
      setGeneratingPdf(approval.idApproval);
      
      // Obtener datos de la fase
      const phaseData = await egsiPhasesAPI.getById(approval.idPhase);
      
      // Obtener respuestas de la fase
      const answersResponse = await egsiAnswersAPI.getAnswersMap(approval.idProcess, approval.idPhase);
      
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // === HEADER ===
      doc.setFontSize(18);
      doc.setTextColor(124, 58, 237);
      doc.text('INFORME DE FASE - REVISIÓN', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('Sistema de Gestión EGSI - ESPE', pageWidth / 2, 28, { align: 'center' });
      
      // === INFORMACIÓN DEL PROCESO ===
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      let yPos = 40;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Proceso:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(approval.processName || 'N/A', 50, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Fase:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fase ${approval.phaseOrder}: ${approval.phaseTitle}`, 50, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Solicitante:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(approval.requestedBy || 'N/A', 50, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha solicitud:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(approval.requestedAt), 50, yPos);
      
      if (approval.comments) {
        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Comentarios:', 14, yPos);
        doc.setFont('helvetica', 'normal');
        const commLines = doc.splitTextToSize(approval.comments, pageWidth - 65);
        doc.text(commLines, 50, yPos);
        yPos += (commLines.length * 5);
      }
      
      // Línea separadora
      yPos += 10;
      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      
      // === CONTENIDO DE LA FASE ===
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(124, 58, 237);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTENIDO DE LA FASE', 14, yPos);
      
      if (phaseData.description) {
        yPos += 8;
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.setFont('helvetica', 'normal');
        const phaseDescLines = doc.splitTextToSize(phaseData.description, pageWidth - 28);
        doc.text(phaseDescLines, 14, yPos);
        yPos += (phaseDescLines.length * 5);
      }
      
      // Iterar por secciones
      const sortedSections = [...phaseData.sections].sort((a, b) => a.order - b.order);
      
      sortedSections.forEach((section, sectionIdx) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sectionIdx + 1}. ${section.title}`, 14, yPos);
        
        if (section.description) {
          yPos += 6;
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          const secDescLines = doc.splitTextToSize(section.description, pageWidth - 28);
          doc.text(secDescLines, 14, yPos);
          yPos += (secDescLines.length * 4);
        }
        
        const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order);
        
        sortedQuestions.forEach((question) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          yPos += 8;
          
          // Pregunta
          doc.setFillColor(243, 244, 246);
          const questionText = question.title + (question.required ? ' *' : '');
          const questionLines = doc.splitTextToSize(questionText, pageWidth - 32);
          const questionHeight = questionLines.length * 5 + 6;
          doc.roundedRect(14, yPos - 4, pageWidth - 28, questionHeight, 1, 1, 'F');
          
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'bold');
          doc.text(questionLines, 16, yPos);
          
          yPos += questionHeight;
          
          // Respuesta
          const answerValue = answersResponse[question.idQuestion];
          
          if (answerValue) {
            // Parsear tableConfig si es string
            let tableConfig = question.tableConfig;
            if (typeof tableConfig === 'string') {
              try {
                tableConfig = JSON.parse(tableConfig);
              } catch {
                tableConfig = null;
              }
            }
            
            if (question.inputType === 'TABLA' && tableConfig) {
              try {
                const tableData = JSON.parse(answerValue);
                if (Array.isArray(tableData) && tableData.length > 0) {
                  const columns = (tableConfig as any).columns || [];
                  const tableHead = [columns.map((c: any) => c.header)];
                  const tableBody = tableData;
                  
                  if (yPos > 200) {
                    doc.addPage();
                    yPos = 20;
                  }
                  
                  doc.setFontSize(9);
                  doc.setTextColor(0, 0, 0);
                  doc.setFont('helvetica', 'normal');
                  doc.text(`Datos de la tabla (${tableBody.length} registros):`, 16, yPos);
                  yPos += 4;
                  
                  autoTable(doc, {
                    startY: yPos,
                    head: tableHead,
                    body: tableBody,
                    margin: { left: 16, right: 16 },
                    headStyles: {
                      fillColor: [79, 70, 229],
                      textColor: [255, 255, 255],
                      fontStyle: 'bold',
                      fontSize: 8,
                    },
                    bodyStyles: { fontSize: 8 },
                    alternateRowStyles: { fillColor: [249, 250, 251] },
                    tableWidth: 'auto',
                  });
                  
                  yPos = (doc as any).lastAutoTable.finalY + 5;
                } else {
                  doc.setFontSize(9);
                  doc.setTextColor(100, 100, 100);
                  doc.setFont('helvetica', 'italic');
                  doc.text('Tabla vacía', 16, yPos);
                  yPos += 5;
                }
              } catch {
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.text(answerValue, 16, yPos);
                yPos += 5;
              }
            } else {
              let cleanText = answerValue;
              if (cleanText.startsWith('[') && cleanText.includes('"type"')) {
                cleanText = extractTextFromBlockNote(cleanText);
              } else {
                cleanText = cleanText.replace(/<[^>]*>/g, '').trim();
              }
              
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'normal');
              const answerLines = doc.splitTextToSize(cleanText || 'Sin respuesta', pageWidth - 32);
              doc.text(answerLines, 16, yPos);
              yPos += (answerLines.length * 4) + 3;
            }
          } else {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');
            doc.text('Sin respuesta', 16, yPos);
            yPos += 5;
          }
        });
      });
      
      // === FOOTER ===
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.text(
          `Página ${i} de ${pageCount} - SIEGSI - Documento de Revisión`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
        
        doc.text(
          `Generado: ${new Date().toLocaleDateString('es-EC', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          pageWidth / 2,
          footerY + 4,
          { align: 'center' }
        );
      }
      
      const fileName = `Fase_${approval.phaseOrder}_${approval.phaseTitle.replace(/\s+/g, '_')}_Revision.pdf`;
      doc.save(fileName);
      
      dispatch(showToast({ 
        message: 'PDF generado correctamente', 
        type: 'success' 
      }));
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      dispatch(showToast({ 
        message: 'Error al generar el PDF', 
        type: 'error' 
      }));
    } finally {
      setGeneratingPdf(null);
    }
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
                          <button
                            onClick={() => handleDownloadPdf(approval)}
                            disabled={generatingPdf === approval.idApproval}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            title="Descargar PDF de la fase"
                          >
                            {generatingPdf === approval.idApproval ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            PDF
                          </button>
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
