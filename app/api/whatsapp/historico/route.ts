
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
    const colaboradorId = searchParams.get('colaboradorId')
    const limite = parseInt(searchParams.get('limite') || '50')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (colaboradorId) {
      whereClause.colaboradorId = colaboradorId
    }

    if (status) {
      whereClause.status = status
    }

    const historico = await prisma.historicoWhatsApp.findMany({
      where: whereClause,
      include: {
        colaborador: {
          select: {
            nome: true,
            telefone: true
          }
        }
      },
      orderBy: {
        dataEnvio: 'desc'
      },
      take: limite
    })

    return NextResponse.json(historico)
  } catch (error) {
    console.error("Erro ao buscar histórico WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
