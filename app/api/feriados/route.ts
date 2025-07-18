
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
    const ano = searchParams.get('ano')
    const mes = searchParams.get('mes')
    const tipo = searchParams.get('tipo')

    let whereClause: any = {}

    if (ano) {
      const anoInt = parseInt(ano)
      whereClause.data = {
        gte: new Date(anoInt, 0, 1),
        lte: new Date(anoInt, 11, 31)
      }
    }

    if (mes && ano) {
      const mesInt = parseInt(mes)
      const anoInt = parseInt(ano)
      whereClause.data = {
        gte: new Date(anoInt, mesInt - 1, 1),
        lte: new Date(anoInt, mesInt, 0)
      }
    }

    if (tipo) {
      whereClause.tipo = tipo
    }

    const feriados = await prisma.feriado.findMany({
      where: whereClause,
      orderBy: {
        data: 'asc'
      }
    })

    return NextResponse.json(feriados)
  } catch (error) {
    console.error("Erro ao buscar feriados:", error)
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

    const { data, nome, tipo, nivel } = await request.json()

    if (!data || !nome || !tipo || !nivel) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    const feriado = await prisma.feriado.create({
      data: {
        data: new Date(data),
        nome,
        tipo,
        nivel
      }
    })

    return NextResponse.json(feriado, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar feriado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
