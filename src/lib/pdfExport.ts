import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlignCenter } from 'lucide-react';
import Papa from 'papaparse';

interface WorkerData {
  CPF: string;
  Nome: string;
  Cargo: string;
  Lotação: string;
  Matrícula: string;
  CargaHoraria?: string;
  [key: string]: string | undefined; // for dynamic fields
}

export const exportAllWorkerDetailsToPDF = async (
  month: string,
  year: string,
  fileName: string = 'detalhes-funcionarios.pdf'
) => {
  try {
    const filename = `/data/dados_${month}_${year}.csv`;
    const response = await fetch(filename);

    if (!response.ok) {
      throw new Error(`Arquivo não encontrado para ${month}/${year}`);
    }

    const csvData = await response.text();

    // Parse CSV into array of workers
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
        error: (error: any) => reject(error),
      });
    });

    const doc = new jsPDF();
    const margin = 15;

    workersData.forEach((worker, index) => {
      if (index > 0) doc.addPage(); // 👉 always start each worker on a fresh page

      let currentY = margin;

      // Header (fixed institution info)
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`PREFEITURA MUNICIPAL DE JAICÓS`, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(`CNPJ: 06.553.762/0001-00`, margin, currentY + 5);
      doc.text(
        `Endereço: Praca Ângelo Borges Leal Jaicós, s/n - Bairro: Serranópolis - CEP: 64575-000 - JAICÓS/PI`,
        margin,
        currentY + 10
      );
      currentY += 20;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const pageWidth = doc.internal.pageSize.width;
      const title = 'Apuração de Pontos';
      const textWidth = doc.getTextWidth(title);
      const centerX = (pageWidth - textWidth) / 2;

      doc.text(title, centerX, currentY);
      currentY += 6;

      // Worker info
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nome: ${worker.Nome || ''}`, margin, currentY);
      doc.text(`Cargo: ${worker.Cargo || ''}`, margin, currentY + 5);
      doc.text(`Lotação: ${worker.Lotação || ''}`, margin, currentY + 10);
      doc.text(`Matrícula: ${worker.Matrícula || ''}`, margin, currentY + 15);
      doc.text(`CPF: ${worker.CPF || ''}`, margin, currentY + 20);

      currentY += 25;
      
      // Days table
      // Prepare day data
      const dayData: string[][] = [];
      let totalMinutes = 0;

      for (let day = 1; day <= 31; day++) {
        const entradaKey = `Dia${day}_Entrada`;
        const saidaKey = `Dia${day}_Saida`;

        const entrada = worker[entradaKey] || "-";
        const saida = worker[saidaKey] || "-";

        let carga = "-";

        if (entrada !== "-" && saida !== "-") {
          try {
            // parse HH:mm format into minutes
            const [hIn, mIn] = entrada.split(":").map(Number);
            const [hOut, mOut] = saida.split(":").map(Number);

            const entradaMin = hIn * 60 + mIn;
            const saidaMin = hOut * 60 + mOut;
            const diff = saidaMin - entradaMin;

            if (diff > 0) {
              const h = Math.floor(diff / 60);
              const m = diff % 60;
              carga = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
              totalMinutes += diff;
            }
          } catch {
            carga = "-";
          }
        }

        dayData.push([
          day.toString(),
          entrada,
          saida,
          carga
        ]);
      }

      // Add total row
      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = totalMinutes % 60;
      const totalCarga = `${totalHours.toString().padStart(2, "0")}:${totalMins.toString().padStart(2, "0")}`;

      dayData.push([
        "TOTAL (em horas)",
        "-",
        "-",
        totalCarga
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Dia', 'Entrada', 'Saída', 'Carga Horária']],
        body: dayData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1, textColor: 0 },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
      });

      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setTextColor(0, 0, 0);
      doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, doc.internal.pageSize.getWidth() - margin - 180, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Página ${index + 1} de ${pageCount}`, doc.internal.pageSize.getWidth() - margin - 30, doc.internal.pageSize.getHeight() - 10);
    });

    // Final summary page
    doc.addPage();
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      margin,
      20
    );
    doc.text(`Total de funcionários: ${workersData.length}`, margin, 30);
    doc.text(`Período: ${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`, margin, 40);

    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Erro ao exportar detalhes:', error);
    throw error;
  }
};
