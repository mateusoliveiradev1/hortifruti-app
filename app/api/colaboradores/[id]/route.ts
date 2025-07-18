
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: { id: params.id },
      include: {
        turnos: {
          orderBy: { data: 'desc' },
          take: 10
        }
      }
    })

    if (!colaborador) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(colaborador)
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o colaborador existe
    const existing = await prisma.colaborador.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o email já está em uso por outro colaborador
    const existingEmail = await prisma.colaborador.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    const colaborador = await prisma.colaborador.update({
      where: { id: params.id },
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

    return NextResponse.json(colaborador)
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o colaborador existe
    const existing = await prisma.colaborador.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      )
    }

    // Ao invés de deletar, desativar o colaborador
    const colaborador = await prisma.colaborador.update({
      where: { id: params.id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: "Colaborador desativado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar colaborador:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
