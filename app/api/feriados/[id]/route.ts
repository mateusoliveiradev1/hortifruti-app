
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

    const feriado = await prisma.feriado.findUnique({
      where: { id: params.id }
    })

    if (!feriado) {
      return NextResponse.json(
        { error: "Feriado não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(feriado)
  } catch (error) {
    console.error("Erro ao buscar feriado:", error)
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

    const { data, nome, tipo, nivel } = await request.json()

    const feriado = await prisma.feriado.update({
      where: { id: params.id },
      data: {
        data: new Date(data),
        nome,
        tipo,
        nivel
      }
    })

    return NextResponse.json(feriado)
  } catch (error) {
    console.error("Erro ao atualizar feriado:", error)
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

    await prisma.feriado.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Feriado deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar feriado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
