import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

interface WorkerData {
  CPF: string;
  Nome: string;
  Cargo: string;
  Lotação: string;
  Matrícula: string;
  [key: string]: string; // For dynamic day fields
}

export const exportAllWorkerDetailsToPDF = async (
  month: string, 
  year: string, 
  fileName: string = 'detalhes-funcionarios.pdf'
) => {
  try {
    // Fetch the specific CSV file based on month and year
    const filename = `/data/dados_${month}_${year}.csv`;
    const response = await fetch(filename);
    
    if (!response.ok) {
      throw new Error(`Arquivo não encontrado para ${month}/${year}`);
    }
    
    const csvData = await response.text();
    
    // Parse the CSV data
    const workersData = await new Promise<WorkerData[]>((resolve, reject) => {
      Papa.parse<WorkerData>(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(results.errors[0].message));
          } else {
            resolve(results.data);
          }
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });

    // Create PDF
    const doc = new jsPDF();
    let currentY = 15;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Process each worker
    for (const [index, worker] of workersData.entries()) {
      if (index > 0 && currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 15;
      }

      // Worker header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Detalhes do Funcionário`, margin, currentY);
      currentY += 10;

      // Worker basic info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Nome: ${worker.Nome || ''}`, margin, currentY);
      currentY += 6;
      doc.text(`Cargo: ${worker.Cargo || ''}`, margin, currentY);
      currentY += 6;
      doc.text(`Lotação: ${worker.Lotação || ''}`, margin, currentY);
      currentY += 6;
      doc.text(`Matrícula: ${worker.Matrícula || ''}`, margin, currentY);
      currentY += 6;
      doc.text(`CPF: ${worker.CPF || ''}`, margin, currentY);
      currentY += 10;

      // Prepare day data
      const dayData = [];
      for (let day = 1; day <= 31; day++) {
        const entradaKey = `Dia${day}_Entrada`;
        const saidaKey = `Dia${day}_Saida`;
        const cargaHoraria = worker.CargaHoraria || '-';

        dayData.push([
          day.toString(),
          worker[entradaKey] || '-',
          worker[saidaKey] || '-',
          cargaHoraria
        ]);
      }

      // Add days table
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Registro de Pontos por Dia', margin, currentY);
      currentY += 8;

      autoTable(doc,{
        startY: currentY,
        head: [['Dia', 'Entrada', 'Saída', 'Carga Horária']],
        body: dayData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { horizontal: margin },
        tableWidth: 'auto'
      });

      // Add separator between workers (except last one)
      if (index < workersData.length - 1) {
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = 15;
        } else {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
          currentY += 20;
        }
      }
    }

    // Add footer with generation info
    doc.addPage();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin, 20);
    doc.text(`Total de funcionários: ${workersData.length}`, margin, 30);
    doc.text(`Período: ${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`, margin, 40);

    // Save PDF
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar detalhes:', error);
    throw error;
  }
};