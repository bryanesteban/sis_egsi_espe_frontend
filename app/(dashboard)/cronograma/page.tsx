'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Save, FileDown } from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Fase = 'DEFINICIÓN' | 'PLANEACIÓN' | 'EJECUCIÓN' | 'SEGUIMIENTO' | 'MEJORA';

interface HitoControl {
  id: string;
  codigo: string;
  fase: Fase;
  descripcion: string;
  fechaComprometida: string;
  fechaEstimada: string;
  avanceFisico: number;
}

const cronogramaData: HitoControl[] = [
  // DEFINICIÓN
  {
    id: '1',
    codigo: '0.1',
    fase: 'DEFINICIÓN',
    descripcion: 'Perfil de Proyecto EGSI v3, documentado y aprobado',
    fechaComprometida: '1/1/2024',
    fechaEstimada: '5/1/2024',
    avanceFisico: 2.00,
  },
  // PLANEACIÓN
  {
    id: '2',
    codigo: '0.2',
    fase: 'PLANEACIÓN',
    descripcion: 'Definición del Alcance, documentado y aprobado',
    fechaComprometida: '15/2/2024',
    fechaEstimada: '15/2/2024',
    avanceFisico: 6.00,
  },
  {
    id: '3',
    codigo: '0.3',
    fase: 'PLANEACIÓN',
    descripcion: 'Plan de Comunicación y Sensibilización, documentado y aprobado',
    fechaComprometida: '28/2/2024',
    fechaEstimada: '28/2/2024',
    avanceFisico: 4.00,
  },
  {
    id: '4',
    codigo: '0.4',
    fase: 'PLANEACIÓN',
    descripcion: 'Plan de evaluación Interna, documentado y aprobado',
    fechaComprometida: '5/3/2024',
    fechaEstimada: '5/3/2024',
    avanceFisico: 4.00,
  },
  {
    id: '5',
    codigo: '0.5',
    fase: 'PLANEACIÓN',
    descripcion: 'Política de Seguridad de la información (alto nivel), documentado y aprobado',
    fechaComprometida: '15/3/2024',
    fechaEstimada: '15/3/2024',
    avanceFisico: 7.00,
  },
  {
    id: '6',
    codigo: '0.6',
    fase: 'PLANEACIÓN',
    descripcion: 'Metodología de evaluación y tratamiento del riesgo, documentado y aprobado',
    fechaComprometida: '31/3/2024',
    fechaEstimada: '31/3/2024',
    avanceFisico: 10.00,
  },
  {
    id: '7',
    codigo: '0.7',
    fase: 'PLANEACIÓN',
    descripcion: 'Informe de la Evaluación de los Riesgos, documentado y aprobado',
    fechaComprometida: '31/5/2024',
    fechaEstimada: '31/5/2024',
    avanceFisico: 12.00,
  },
  {
    id: '8',
    codigo: '0.8',
    fase: 'PLANEACIÓN',
    descripcion: 'Declaración de Aplicabilidad (SoA), documentado y aprobado',
    fechaComprometida: '10/6/2024',
    fechaEstimada: '10/6/2024',
    avanceFisico: 2.00,
  },
  {
    id: '9',
    codigo: '0.9',
    fase: 'PLANEACIÓN',
    descripcion: 'Plan de Tratamiento de los riesgos, documentado y aprobado',
    fechaComprometida: '15/6/2024',
    fechaEstimada: '15/6/2024',
    avanceFisico: 3.00,
  },
  // EJECUCIÓN
  {
    id: '10',
    codigo: '1.1',
    fase: 'EJECUCIÓN',
    descripcion: 'Políticas de seguridad de la información (específicas), documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '11',
    codigo: '1.2',
    fase: 'EJECUCIÓN',
    descripcion: 'Roles y Responsabilidades de Seguridad de la Información, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '12',
    codigo: '1.3',
    fase: 'EJECUCIÓN',
    descripcion: 'Separación de Funciones, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '13',
    codigo: '1.4',
    fase: 'EJECUCIÓN',
    descripcion: 'Responsabilidades de la dirección, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '14',
    codigo: '1.5',
    fase: 'EJECUCIÓN',
    descripcion: 'Contacto con las autoridades, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '15',
    codigo: '1.6',
    fase: 'EJECUCIÓN',
    descripcion: 'Contacto con grupos de interés especial, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '16',
    codigo: '1.7',
    fase: 'EJECUCIÓN',
    descripcion: 'Inteligencia de amenazas, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '17',
    codigo: '1.8',
    fase: 'EJECUCIÓN',
    descripcion: 'Seguridad de la información en la Gestión de proyectos, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '18',
    codigo: '1.9',
    fase: 'EJECUCIÓN',
    descripcion: 'Inventario de información y otros activos asociados, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '19',
    codigo: '1.10',
    fase: 'EJECUCIÓN',
    descripcion: 'Uso aceptable de la información y otros activos asociados, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '20',
    codigo: '1.11',
    fase: 'EJECUCIÓN',
    descripcion: 'Devolución de activos, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '21',
    codigo: '1.12',
    fase: 'EJECUCIÓN',
    descripcion: 'Clasificación de la información, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
  {
    id: '22',
    codigo: '1.13',
    fase: 'EJECUCIÓN',
    descripcion: 'Etiquetado de la información, documentado e implementado',
    fechaComprometida: '16/06/2024 - 31/10/2024',
    fechaEstimada: '16/06/2024 - 31/10/2024',
    avanceFisico: 0.43,
  },
];

const faseColors: Record<Fase, { bg: string; text: string; border: string }> = {
  'DEFINICIÓN': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-l-blue-500' },
  'PLANEACIÓN': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-l-purple-500' },
  'EJECUCIÓN': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-l-green-500' },
  'SEGUIMIENTO': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-l-orange-500' },
  'MEJORA': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-l-red-500' },
};

export default function CronogramaPage() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<HitoControl[]>(cronogramaData);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (id: string, field: keyof HitoControl, value: string | number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular guardado en backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      dispatch(showToast({ message: 'Cronograma guardado correctamente', type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: 'Error al guardar el cronograma', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Título del documento
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175); // Azul
    doc.text('Cronograma de Ejecución - Actividades', 14, 20);
    
    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Seguimiento de hitos de control del proyecto EGSI v3', 14, 28);
    
    // Fecha de generación
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-EC', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 34);

    // Calcular estadísticas
    const totalAvance = data.reduce((sum, item) => sum + item.avanceFisico, 0);
    const promedioAvance = (totalAvance / data.length).toFixed(2);
    const completados = data.filter(item => item.avanceFisico >= 10).length;

    // Resumen
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Hitos: ${data.length}  |  Completados (>10%): ${completados}  |  Promedio Avance: ${promedioAvance}%  |  Avance Total: ${totalAvance.toFixed(2)}%`, 14, 42);

    // Preparar datos para la tabla
    const tableData = data.map(item => [
      `${item.fase}: ${item.codigo} - ${item.descripcion}`,
      item.fechaComprometida,
      item.fechaEstimada,
      `${item.avanceFisico.toFixed(2)}%`
    ]);

    // Generar tabla
    autoTable(doc, {
      startY: 48,
      head: [['Hitos de Control', 'Fecha Comprometida', 'Fecha Estimada', '% Avance Físico']],
      body: tableData,
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 45, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      didParseCell: (hookData) => {
        // Colorear el avance según el valor
        if (hookData.section === 'body' && hookData.column.index === 3) {
          const avance = parseFloat(hookData.cell.raw as string);
          if (avance >= 10) {
            hookData.cell.styles.textColor = [22, 163, 74]; // Verde
          } else if (avance >= 1) {
            hookData.cell.styles.textColor = [202, 138, 4]; // Amarillo
          } else {
            hookData.cell.styles.textColor = [156, 163, 175]; // Gris
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} - SIEGSI - Sistema de Gestión de Seguridad de la Información`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Descargar PDF
    doc.save(`Cronograma_EGSI_${new Date().toISOString().split('T')[0]}.pdf`);
    dispatch(showToast({ message: 'PDF exportado correctamente', type: 'success' }));
  };

  const getAvanceColor = (avance: number) => {
    if (avance >= 10) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (avance >= 5) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (avance >= 1) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  };

  const getAvanceIcon = (avance: number) => {
    if (avance >= 10) return <CheckCircle className="w-4 h-4" />;
    if (avance >= 1) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'VIEWER', 'APPROVER']}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Cronograma de Ejecución - Actividades
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Seguimiento de hitos de control del proyecto EGSI v3
            </p>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Exportar PDF */}
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </button>

            {/* Guardar */}
            <button 
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider w-1/2">
                    Hitos de control
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Fecha comprometida
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Fecha estimada
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    % de avance físico
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, index) => {
                  const colors = faseColors[item.fase];
                  const isFirstOfFase = index === 0 || data[index - 1].fase !== item.fase;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 ${colors.border}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          {isFirstOfFase && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${colors.bg} ${colors.text} mb-1 w-fit`}>
                              {item.fase}
                            </span>
                          )}
                          <span className="text-sm text-gray-900 dark:text-white">
                            <span className={`font-semibold ${colors.text}`}>{item.fase}: {item.codigo}</span>
                            {' '}{item.descripcion}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          value={item.fechaComprometida}
                          onChange={(e) => handleFieldChange(item.id, 'fechaComprometida', e.target.value)}
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 font-medium bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-1 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          value={item.fechaEstimada}
                          onChange={(e) => handleFieldChange(item.id, 'fechaEstimada', e.target.value)}
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 font-medium bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-1 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${getAvanceColor(item.avanceFisico)}`}>
                            {getAvanceIcon(item.avanceFisico)}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.avanceFisico}
                            onChange={(e) => handleFieldChange(item.id, 'avanceFisico', parseFloat(e.target.value) || 0)}
                            className={`w-20 text-center text-sm font-semibold bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-2 py-1 transition-colors ${getAvanceColor(item.avanceFisico)}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
