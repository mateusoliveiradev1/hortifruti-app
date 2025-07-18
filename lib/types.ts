
export interface Colaborador {
  id: string
  nome: string
  email: string
  cargo: string
  ativo: boolean
  horarioFixo: boolean
  horarioInicio?: string
  horarioFim?: string
  trabalhaDomingo: boolean
  padraoFolgaDomingo: string
  telefone?: string
  createdAt: Date
  updatedAt: Date
}

export interface EscalaMensal {
  id: string
  mes: number
  ano: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Turno {
  id: string
  data: Date
  horarioInicio: string
  horarioFim: string
  tipoTurno: string
  temAlmoco: boolean
  inicioAlmoco?: string
  fimAlmoco?: string
  colaboradorId: string
  escalaMensalId: string
  createdAt: Date
  updatedAt: Date
}

export interface Feriado {
  id: string
  data: Date
  nome: string
  tipo: string
  nivel: string
  createdAt: Date
  updatedAt: Date
}

export interface ConfiguracaoWhatsApp {
  id: string
  instanceId?: string
  token?: string
  ativo: boolean
  envioAutomatico: boolean
  diaEnvio: number
  horarioEnvio: string
  createdAt: Date
  updatedAt: Date
}

export interface HistoricoWhatsApp {
  id: string
  colaboradorId: string
  dataEnvio: Date
  tipoEnvio: string
  status: string
  mensagem?: string
  resposta?: string
  createdAt: Date
  updatedAt: Date
}
