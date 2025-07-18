
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

    const config = await prisma.configuracaoWhatsApp.findFirst()

    if (!config) {
      // Criar configuração padrão se não existir
      const novaConfig = await prisma.configuracaoWhatsApp.create({
        data: {
          instanceId: '',
          token: '',
          ativo: false,
          envioAutomatico: true,
          diaEnvio: 0, // Domingo
          horarioEnvio: '18:00'
        }
      })
      return NextResponse.json(novaConfig)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Erro ao buscar configuração WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { instanceId, token, ativo, envioAutomatico, diaEnvio, horarioEnvio } = await request.json()

    const config = await prisma.configuracaoWhatsApp.findFirst()

    if (!config) {
      const novaConfig = await prisma.configuracaoWhatsApp.create({
        data: {
          instanceId: instanceId || '',
          token: token || '',
          ativo: ativo || false,
          envioAutomatico: envioAutomatico !== false,
          diaEnvio: diaEnvio || 0,
          horarioEnvio: horarioEnvio || '18:00'
        }
      })
      return NextResponse.json(novaConfig)
    } else {
      const configAtualizada = await prisma.configuracaoWhatsApp.update({
        where: { id: config.id },
        data: {
          instanceId: instanceId || config.instanceId,
          token: token || config.token,
          ativo: ativo !== undefined ? ativo : config.ativo,
          envioAutomatico: envioAutomatico !== undefined ? envioAutomatico : config.envioAutomatico,
          diaEnvio: diaEnvio !== undefined ? diaEnvio : config.diaEnvio,
          horarioEnvio: horarioEnvio || config.horarioEnvio
        }
      })
      return NextResponse.json(configAtualizada)
    }
  } catch (error) {
    console.error("Erro ao atualizar configuração WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
