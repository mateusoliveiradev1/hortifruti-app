
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

    const escala = await prisma.escalaMensal.findUnique({
      where: { id: params.id },
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

    if (!escala) {
      return NextResponse.json(
        { error: "Escala não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(escala)
  } catch (error) {
    console.error("Erro ao buscar escala:", error)
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

    // Verificar se a escala existe
    const escala = await prisma.escalaMensal.findUnique({
      where: { id: params.id }
    })

    if (!escala) {
      return NextResponse.json(
        { error: "Escala não encontrada" },
        { status: 404 }
      )
    }

    // Deletar turnos primeiro (devido às relações)
    await prisma.turno.deleteMany({
      where: { escalaMensalId: params.id }
    })

    // Deletar relações com colaboradores
    await prisma.escalaColaborador.deleteMany({
      where: { escalaMensalId: params.id }
    })

    // Deletar a escala
    await prisma.escalaMensal.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Escala deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar escala:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
