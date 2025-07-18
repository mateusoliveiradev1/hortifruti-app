
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')

    let whereClause = {}
    if (mes && ano) {
      whereClause = {
        mes: parseInt(mes),
        ano: parseInt(ano)
      }
    }

    const escalas = await prisma.escalaMensal.findMany({
      where: whereClause,
      include: {
        colaboradores: {
          include: {
            colaborador: true
          }
        },
        turnos: {
          include: {
            colaborador: true
          },
          orderBy: {
            data: 'asc'
          }
        }
      },
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ]
    })

    return NextResponse.json(escalas)
  } catch (error) {
    console.error("Erro ao buscar escalas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { mes, ano } = await request.json()

    if (!mes || !ano) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se já existe escala para este mês/ano
    const escalaExistente = await prisma.escalaMensal.findUnique({
      where: {
        mes_ano: {
          mes: parseInt(mes),
          ano: parseInt(ano)
        }
      }
    })

    if (escalaExistente) {
      return NextResponse.json(
        { error: "Já existe uma escala para este período" },
        { status: 400 }
      )
    }

    // Buscar colaboradores ativos
    const colaboradores = await prisma.colaborador.findMany({
      where: { ativo: true }
    })

    // Buscar feriados do ano
    const inicioAno = new Date(parseInt(ano), 0, 1)
    const fimAno = new Date(parseInt(ano), 11, 31)
    
    const feriados = await prisma.feriado.findMany({
      where: {
        data: {
          gte: inicioAno,
          lte: fimAno
        }
      }
    })

    // Importar e usar o gerador de escalas
    const { ScheduleGenerator } = await import('@/lib/schedule-generator')
    
    const generator = new ScheduleGenerator({
      mes: parseInt(mes),
      ano: parseInt(ano),
      colaboradores: colaboradores,
      feriados: feriados
    })

    const turnos = generator.gerarEscala()

    // Salvar no banco de dados
    const escala = await prisma.escalaMensal.create({
      data: {
        mes: parseInt(mes),
        ano: parseInt(ano),
        status: 'ativa'
      }
    })

    // Criar relações com colaboradores
    for (const colaborador of colaboradores) {
      await prisma.escalaColaborador.create({
        data: {
          colaboradorId: colaborador.id,
          escalaMensalId: escala.id
        }
      })
    }

    // Salvar turnos
    for (const turno of turnos) {
      await prisma.turno.create({
        data: {
          ...turno,
          escalaMensalId: escala.id
        }
      })
    }

    // Buscar a escala completa para retornar
    const escalaCompleta = await prisma.escalaMensal.findUnique({
      where: { id: escala.id },
      include: {
        colaboradores: {
          include: {
            colaborador: true
          }
        },
        turnos: {
          include: {
            colaborador: true
          },
          orderBy: {
            data: 'asc'
          }
        }
      }
    })

    return NextResponse.json(escalaCompleta, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar escala:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
