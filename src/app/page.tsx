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
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
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