export interface Dados {
  CPF: string;
  Matrícula: string;
  Nome: string;
  Cargo: string;
  Lotação: string;
  Dia?: string;
  Entrada?: string;
  Saída?: string;
  CargaHoraria?: string;
  [key: string]: string | undefined;
}

export default Dados;