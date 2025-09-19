'use client'

import React from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Dados from '@/types/dados'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { exportAllWorkerDetailsToPDF } from '@/lib/pdfExport'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image' // Add this import

const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const TableDemo: React.FC<{ 
  searchTerm: string;
  month: string;
  year: string;
}> = ({ searchTerm, month, year }) => {
  const [dados, setDados] = useState<Dados[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Dados | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const filename = `/data/dados_${month}_${year}.csv`;
        const response = await fetch(filename);
        
        if (!response.ok) throw new Error(`Referencia não calculada, atualize o arquivo de dados`);
        
        const csvData = await response.text();
        
        Papa.parse<Dados>(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              throw new Error(results.errors[0].message);
            }
            setDados(results.data);
          },
          error: (error: unknown) => {
            throw error;
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (month && year) {
      fetchData();
    } else {
      setLoading(false);
      setDados([]);
    }
  }, [month, year]);

  const filteredData = useMemo(() => {
    return dados.filter(item =>
      item.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.CPF?.includes(searchTerm)
    )
  }, [dados, searchTerm]);

  if (loading) return <div>Carregando dados...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const renderDayRows = (employee: Dados) => {
    const days = [];
    for (let day = 1; day <= 31; day++) {
      const entradaKey = `Dia${day}_Entrada`;
      const saidaKey = `Dia${day}_Saida`;
      
      days.push(
        <TableRow className='text-[2px]' key={`${employee.ID}-${day}`}>
          <TableCell>{day}</TableCell>
          <TableCell>{employee[entradaKey] || '-'}</TableCell>
          <TableCell>{employee[saidaKey] || '-'}</TableCell>
          <TableCell>{employee.CargaHoraria || '-'}</TableCell>
        </TableRow>
      );
    }
    return days;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">CPF</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-left">Vinculo</TableHead>
            <TableHead className="text-left">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.ID}>
              <TableCell className="font-medium">{item.CPF}</TableCell>
              <TableCell>{item.Nome}</TableCell>
              <TableCell>{item.Cargo}</TableCell>
              <TableCell className="text-left">{item.Lotação}</TableCell>
              <TableCell className="text-left">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="border-amber-50"
                      variant="outline" 
                      onClick={() => setSelectedRow(item)}
                    >
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[1005px] h-[600px] overflow-y-auto gap-1">
                    <DialogHeader className="h-100px">
                      <DialogTitle>Detalhes do Registro</DialogTitle>
                      <DialogDescription>
                        Informações completas deste funcionário
                      </DialogDescription>
                    </DialogHeader>
                    {selectedRow && (
                      <div className="grid gap-1 py-1">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="nome" className="text-right">
                            Nome
                          </Label>
                          <Input 
                            id="nome" 
                            defaultValue={selectedRow.Nome} 
                            className="col-span-3" 
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="cargo" className="text-right">
                            Cargo
                          </Label>
                          <Input 
                            id="cargo" 
                            defaultValue={selectedRow.Cargo} 
                            className="col-span-3" 
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="lotacao" className="text-right">
                            Lotação
                          </Label>
                          <Input 
                            id="lotacao" 
                            defaultValue={selectedRow.Lotação} 
                            className="col-span-3" 
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="matricula" className="text-right">
                            Matrícula
                          </Label>
                          <Input 
                            id="matricula" 
                            defaultValue={selectedRow.Matrícula} 
                            className="col-span-3" 
                            readOnly
                          />
                        </div>
                        <div className="items-center gap-4 w-full">
                          <Table className="bg-[#f3f3f3]">
                            <TableHeader className="sticky top-0 bg-[#f3f3f3] z-10">
                              <TableRow>
                                <TableHead>Dia</TableHead>
                                <TableHead>Entrada</TableHead>
                                <TableHead>Saída</TableHead>
                                <TableHead>Carga Horária</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {renderDayRows(selectedRow)}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button">Fechar</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

function SelectSeparator({ 
  onSearch, 
  onMonthChange,
  onYearChange,
  initialMonth,
  initialYear,
  onExportDetails // Remove onExportPDF since it's not used
}: { 
  onSearch: (term: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  initialMonth: string;
  initialYear: string;
  onExportDetails: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    onMonthChange(value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    onYearChange(value);
  };

  return (
    <div className='flex flex-row gap-4 items-center'>
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Mês</SelectLabel>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Ano</SelectLabel>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input 
        placeholder="Pesquise por Nome, Cargo ou CPF" 
        className="w-[500px]" 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onSearch(e.target.value);
        }}
      />
      
      <Button 
        onClick={onExportDetails} 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Download size={16} />
        Exportar PDF
      </Button>
    </div>
  );
}

export default function Page() {
  const now = new Date();
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear().toString();

  const [searchTerm, setSearchTerm] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!month || !year) {
      toast.error('Selecione mês e ano para exportar');
      return;
    }

    setIsExporting(true);
    try {
      await exportAllWorkerDetailsToPDF(
        month, 
        year, 
        `registros-ponto-${month}-${year}.pdf`
      );
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro ao exportar PDF. Verifique se o arquivo existe.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pt-10 pl-10 pr-10">
      <div className="justify-center flex h-[200px] bg-center bg-[#5200ff] bg-[url(/images/jaicos.jpeg)]">
        <p>Resumo de ponto</p>
        <Image 
          src="/images/logo_jaicos.jpg" 
          alt="Logo Jaicós" 
          width={75}
          height={75}
          className='z-1 rounded-b-2xl p-1 pointer-events-none bg-amber-300' 
        />
      </div>
      <SelectSeparator 
        onSearch={setSearchTerm}
        onMonthChange={setMonth}
        onYearChange={setYear}
        initialMonth={currentMonth}
        initialYear={currentYear}
        onExportDetails={handleExportPDF}
      />
      <TableDemo 
        searchTerm={searchTerm} 
        month={month}
        year={year}
      />
    </div>
  )
}