
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.historicoWhatsApp.deleteMany()
  await prisma.turno.deleteMany()
  await prisma.escalaColaborador.deleteMany()
  await prisma.escalaMensal.deleteMany()
  await prisma.colaborador.deleteMany()
  await prisma.feriado.deleteMany()
  await prisma.configuracaoWhatsApp.deleteMany()
  await prisma.regraEscala.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário admin (Mateus)
  const hashedPasswordMateus = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Mateus Silva',
      email: 'mateus@hortifruti.com',
      hashedPassword: hashedPasswordMateus,
    },
  })

  // Criar usuário de teste (obrigatório para testes)
  const hashedPasswordTest = await bcrypt.hash('johndoe123', 12)
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      hashedPassword: hashedPasswordTest,
    },
  })

  console.log('✅ Usuários criados')

  // Criar colaboradores
  const colaboradores = [
    {
      nome: 'Ala Santos',
      email: 'ala@hortifruti.com',
      cargo: 'repositor',
      telefone: '(11) 98765-4321',
      horarioFixo: false,
      trabalhaDomingo: true,
      padraoFolgaDomingo: '2x2',
    },
    {
      nome: 'Bruno Silva',
      email: 'bruno@hortifruti.com', 
      cargo: 'repositor',
      telefone: '(11) 98765-4322',
      horarioFixo: false,
      trabalhaDomingo: true,
      padraoFolgaDomingo: '2x2',
    },
    {
      nome: 'Moisés Oliveira',
      email: 'moises@hortifruti.com',
      cargo: 'repositor',
      telefone: '(11) 98765-4323',
      horarioFixo: false,
      trabalhaDomingo: true,
      padraoFolgaDomingo: '2x2',
    },
    {
      nome: 'Amanda Costa',
      email: 'amanda@hortifruti.com',
      cargo: 'repositor',
      telefone: '(11) 98765-4324',
      horarioFixo: true,
      horarioInicio: '10:00',
      horarioFim: '19:20',
      trabalhaDomingo: true,
      padraoFolgaDomingo: '1x1', // Amanda trabalha 1 domingo sim/1 não
    },
    {
      nome: 'Mateus Silva',
      email: 'mateus.lider@hortifruti.com',
      cargo: 'lider',
      telefone: '(11) 98765-4325',
      horarioFixo: false,
      trabalhaDomingo: false, // Líderes não trabalham domingos
      padraoFolgaDomingo: '0x0',
    },
    {
      nome: 'Edmar Souza',
      email: 'edmar@hortifruti.com',
      cargo: 'lider',
      telefone: '(11) 98765-4326',
      horarioFixo: false,
      trabalhaDomingo: false, // Líderes não trabalham domingos
      padraoFolgaDomingo: '0x0',
    },
  ]

  for (const colaborador of colaboradores) {
    await prisma.colaborador.create({
      data: colaborador,
    })
  }

  console.log('✅ Colaboradores criados')

  // Criar configuração inicial do WhatsApp
  await prisma.configuracaoWhatsApp.create({
    data: {
      instanceId: '',
      token: '',
      ativo: false,
      envioAutomatico: true,
      diaEnvio: 0, // Domingo
      horarioEnvio: '18:00',
    },
  })

  console.log('✅ Configuração WhatsApp criada')

  // Criar regras de escala
  const regras = [
    {
      nome: 'Horário Semanal',
      tipo: 'horario',
      configuracao: JSON.stringify({
        inicio: '07:00',
        fim: '21:00',
        jornadaBase: '7h20min',
        horasExtrasMax: '2h',
        horariosPossiveis: ['07:00', '08:00', '10:00', '11:00', '12:00']
      }),
    },
    {
      nome: 'Horário Domingo/Feriado',
      tipo: 'horario',
      configuracao: JSON.stringify({
        inicio: '07:00',
        fim: '13:00',
        jornadaBase: '6h',
        temAlmoco: false,
        colaboradoresMax: 2
      }),
    },
    {
      nome: 'Intervalo Almoço',
      tipo: 'intervalo',
      configuracao: JSON.stringify({
        duracao: '2h',
        naoComputado: true,
        minimoNoSetor: 2,
        horariosPossiveis: ['11:00-13:00', '12:00-14:00', '13:00-15:00']
      }),
    },
    {
      nome: 'Descanso Entre Jornadas',
      tipo: 'intervalo',
      configuracao: JSON.stringify({
        minimoDescanso: '11h',
        maximoTrabalhoDireto: '6h'
      }),
    },
    {
      nome: 'Folgas Rotativas',
      tipo: 'folga',
      configuracao: JSON.stringify({
        tipo: 'rotativa',
        diasPreferidos: ['terca', 'quinta'],
        maximoDiasContinuos: 6
      }),
    },
    {
      nome: 'Regra Amanda',
      tipo: 'domingo',
      configuracao: JSON.stringify({
        padrao: '1x1',
        mantemFolgaSemanal: true,
        colaborador: 'Amanda Costa'
      }),
    },
    {
      nome: 'Regra Homens',
      tipo: 'domingo',
      configuracao: JSON.stringify({
        padrao: '2x2',
        perdeFolgaSemanal: true,
        seAplicaA: ['repositor-masculino']
      }),
    },
  ]

  for (const regra of regras) {
    await prisma.regraEscala.create({
      data: regra,
    })
  }

  console.log('✅ Regras de escala criadas')

  // Criar alguns feriados de exemplo para 2025
  const feriados2025 = [
    {
      data: new Date('2025-01-01'),
      nome: 'Confraternização Universal',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-04-21'),
      nome: 'Tiradentes',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-05-01'),
      nome: 'Dia do Trabalhador',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-07-09'),
      nome: 'Revolução Constitucionalista',
      tipo: 'estadual',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-09-07'),
      nome: 'Independência do Brasil',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-10-12'),
      nome: 'Nossa Senhora Aparecida',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-11-02'),
      nome: 'Finados',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-11-15'),
      nome: 'Proclamação da República',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
    {
      data: new Date('2025-12-25'),
      nome: 'Natal',
      tipo: 'nacional',
      nivel: 'obrigatorio',
    },
  ]

  for (const feriado of feriados2025) {
    await prisma.feriado.create({
      data: feriado,
    })
  }

  console.log('✅ Feriados criados')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
