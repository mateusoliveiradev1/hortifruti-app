
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { WhatsAppService } from "@/lib/whatsapp-service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { colaboradorId, tipo = 'escala', forceEnvio = false } = await request.json()

    // Buscar configuração do WhatsApp
    const config = await prisma.configuracaoWhatsApp.findFirst()

    if (!config || !config.instanceId || !config.token) {
      return NextResponse.json(
        { error: "Configuração do WhatsApp não encontrada ou incompleta" },
        { status: 400 }
      )
    }

    if (!config.ativo && !forceEnvio) {
      return NextResponse.json(
        { error: "WhatsApp está desativado" },
        { status: 400 }
      )
    }

    // Inicializar serviço do WhatsApp
    const whatsappService = new WhatsAppService(config.instanceId, config.token)

    let colaboradores = []

    if (colaboradorId) {
      // Enviar para colaborador específico
      const colaborador = await prisma.colaborador.findUnique({
        where: { id: colaboradorId, ativo: true }
      })

      if (!colaborador) {
        return NextResponse.json(
          { error: "Colaborador não encontrado ou inativo" },
          { status: 404 }
        )
      }

      colaboradores = [colaborador]
    } else {
      // Enviar para todos os colaboradores ativos
      colaboradores = await prisma.colaborador.findMany({
        where: { ativo: true, telefone: { not: null } }
      })
    }

    const resultados = []

    for (const colaborador of colaboradores) {
      if (!colaborador.telefone) {
        resultados.push({
          colaborador: colaborador.nome,
          enviado: false,
          erro: "Telefone não cadastrado"
        })
        continue
      }

      try {
        let response: { sent: boolean; error?: string } = { sent: false, error: "Tipo de envio não reconhecido" }

        if (tipo === 'escala') {
          // Buscar escala semanal do colaborador
          const escalaSemanal = await buscarEscalaSemanal(colaborador.id)
          response = await whatsappService.enviarEscalaSemanal({
            colaborador: colaborador.nome,
            telefone: colaborador.telefone,
            turnos: escalaSemanal
          })
        } else if (tipo === 'lembrete') {
          // Buscar próximo turno do colaborador
          const proximoTurno = await buscarProximoTurno(colaborador.id)
          if (proximoTurno) {
            response = await whatsappService.enviarLembrete(
              colaborador.nome,
              colaborador.telefone,
              proximoTurno
            )
          } else {
            response = { sent: false, error: "Nenhum turno próximo encontrado" }
          }
        }

        // Salvar no histórico
        await prisma.historicoWhatsApp.create({
          data: {
            colaboradorId: colaborador.id,
            dataEnvio: new Date(),
            tipoEnvio: forceEnvio ? 'manual' : 'automatico',
            status: response.sent ? 'enviado' : 'erro',
            mensagem: response.sent ? 'Mensagem enviada com sucesso' : response.error,
            resposta: JSON.stringify(response)
          }
        })

        resultados.push({
          colaborador: colaborador.nome,
          enviado: response.sent,
          erro: response.error || null
        })

      } catch (error) {
        console.error(`Erro ao enviar para ${colaborador.nome}:`, error)
        
        // Salvar erro no histórico
        await prisma.historicoWhatsApp.create({
          data: {
            colaboradorId: colaborador.id,
            dataEnvio: new Date(),
            tipoEnvio: forceEnvio ? 'manual' : 'automatico',
            status: 'erro',
            mensagem: (error as Error).message,
            resposta: JSON.stringify({ error: (error as Error).message })
          }
        })

        resultados.push({
          colaborador: colaborador.nome,
          enviado: false,
          erro: (error as Error).message
        })
      }
    }

    const enviados = resultados.filter(r => r.enviado).length
    const erros = resultados.filter(r => !r.enviado).length

    return NextResponse.json({
      message: `Envio concluído: ${enviados} enviados, ${erros} erros`,
      resultados: resultados,
      estatisticas: {
        total: resultados.length,
        enviados: enviados,
        erros: erros
      }
    })

  } catch (error) {
    console.error("Erro no envio WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    )
  }
}

async function buscarEscalaSemanal(colaboradorId: string) {
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay()) // Domingo da semana atual
  
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 6) // Sábado da semana atual

  const turnos = await prisma.turno.findMany({
    where: {
      colaboradorId: colaboradorId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      }
    },
    orderBy: { data: 'asc' }
  })

  return turnos.map(turno => ({
    data: format(turno.data, "EEEE, dd/MM", { locale: ptBR }),
    horario: `${turno.horarioInicio} - ${turno.horarioFim}`,
    tipo: turno.tipoTurno
  }))
}

async function buscarProximoTurno(colaboradorId: string) {
  const hoje = new Date()
  
  const proximoTurno = await prisma.turno.findFirst({
    where: {
      colaboradorId: colaboradorId,
      data: {
        gt: hoje
      }
    },
    orderBy: { data: 'asc' }
  })

  if (!proximoTurno) return null

  return {
    data: format(proximoTurno.data, "EEEE, dd/MM", { locale: ptBR }),
    horario: `${proximoTurno.horarioInicio} - ${proximoTurno.horarioFim}`
  }
}
