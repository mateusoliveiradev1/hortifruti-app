
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const colaboradores = await prisma.colaborador.findMany({
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(colaboradores)
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error)
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

    const data = await request.json()
    const {
      nome,
      email,
      cargo,
      telefone,
      horarioFixo,
      horarioInicio,
      horarioFim,
      trabalhaDomingo,
      padraoFolgaDomingo,
      ativo
    } = data

    if (!nome || !email || !cargo) {
      return NextResponse.json(
        { error: "Nome, email e cargo são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingColaborador = await prisma.colaborador.findUnique({
      where: { email }
    })

    if (existingColaborador) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    const colaborador = await prisma.colaborador.create({
      data: {
        nome,
        email,
        cargo,
        telefone,
        horarioFixo: horarioFixo || false,
        horarioInicio,
        horarioFim,
        trabalhaDomingo: trabalhaDomingo !== false,
        padraoFolgaDomingo: padraoFolgaDomingo || "2x2",
        ativo: ativo !== false
      }
    })

    return NextResponse.json(colaborador, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar colaborador:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
