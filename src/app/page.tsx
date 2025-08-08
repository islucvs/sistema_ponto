'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Dados from '@/types/dados'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function TableDemo() {
  const [dados, setDados] = useState<Dados[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
            
            const sum = results.data.reduce((acc, row) => {
              return acc + parseFloat(row.Amount || '0')
            }, 0)
            setTotal(sum)
          },
          error: (error) => {
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
    <Table>
      <TableCaption>Listagem</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">CPF</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead className="text-right">Lotação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dados.map((dados) => (
          <TableRow key={dados.CPF}>
            <TableCell className="font-medium">{dados.CPF}</TableCell>
            <TableCell>{dados.Nome}</TableCell>
            <TableCell>{dados.Cargo}</TableCell>
            <TableCell className="text-right">${dados.Lotação}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">${total.toFixed(2)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

function SelectSeparator() {
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
      <Input placeholder="Nome..." className="w-[500px]" />
      <div className="flex flex-wrap gap-2 md:flex-row">
      <Button>Pesquisar</Button>
    </div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="space-y-8 pt-10 pl-10 pr-10">
      <SelectSeparator />
      <TableDemo />
    </div>
  )
}