'use client'

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

function TableDemo({ searchTerm }: { searchTerm: string }) {
  const [dados, setDados] = useState<Dados[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<Dados | null>(null)

  const filteredData = useMemo(() => {
    return dados.filter(item =>
      item.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.CPF.includes(searchTerm)
    )
  }, [dados, searchTerm])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/dados.csv')
        if (!response.ok) throw new Error('Failed to fetch CSV')
        
        const csvData = await response.text()
        
        Papa.parse<Dados>(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              throw new Error(results.errors[0].message)
            }
            
            setDados(results.data)
          },
          error: (error: unknown) => {
            throw error
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Carregando dados</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">CPF</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-right">Vinculo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.CPF}>
              <TableCell className="font-medium">{item.CPF}</TableCell>
              <TableCell>{item.Nome}</TableCell>
              <TableCell>{item.Cargo}</TableCell>
              <TableCell className="text-right">{item.Lotação}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
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
                                <TableHead>Pontos</TableHead>
                                <TableHead>Carga Horária</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow key={item.CPF}>
                                <TableCell className="font-medium">
                                  { /*Array.from(Array(31).keys()).map(x => x + 1)*/ }
                                </TableCell>
                                <TableCell>{item.Entrada}</TableCell>
                                <TableCell>{item.Saída}</TableCell>
                                <TableCell>{item.CargaHoraria}</TableCell>                     
                              </TableRow>
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

function SelectSeparator({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className='flex flex-row gap-4'>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Mês</SelectLabel>
            <SelectItem value="janeiro">Janeiro</SelectItem>
            <SelectItem value="fevereiro">Fevereiro</SelectItem>
            <SelectItem value="março">Março</SelectItem>
            <SelectItem value="abril">Abril</SelectItem>
            <SelectItem value="maio">Maio</SelectItem>
            <SelectItem value="junho">Junho</SelectItem>
            <SelectItem value="julho">Julho</SelectItem>
            <SelectItem value="agosto">Agosto</SelectItem>
            <SelectItem value="setembro">Setembro</SelectItem>
            <SelectItem value="outubro">Outubro</SelectItem>
            <SelectItem value="novembro">Novembro</SelectItem>
            <SelectItem value="dezembro">Dezembro</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Ano</SelectLabel>
            <SelectItem value="2018">2018</SelectItem>
            <SelectItem value="2019">2019</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
            <SelectItem value="2021">2021</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input 
        placeholder="Pesquise por Nome, Cargo ou CPF" 
        className="w-[500px]" 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          onSearch(e.target.value)
        }}
      />
    </div>
  )
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8 pt-10 pl-10 pr-10">
      <SelectSeparator onSearch={setSearchTerm} />
      <TableDemo searchTerm={searchTerm} />
    </div>
  )
}