
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { WhatsAppService } from "@/lib/whatsapp-service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { instanceId, token } = await request.json()

    if (!instanceId || !token) {
      return NextResponse.json(
        { error: "Instance ID e Token são obrigatórios" },
        { status: 400 }
      )
    }

    const whatsappService = new WhatsAppService(instanceId, token)
    const resultado = await whatsappService.testarConexao()

    return NextResponse.json({
      success: resultado.success,
      message: resultado.message,
      testado_em: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro no teste WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    )
  }
}
