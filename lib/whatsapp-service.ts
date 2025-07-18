
interface WhatsAppMessage {
  to: string
  body: string
  priority?: number
}

interface WhatsAppResponse {
  sent: boolean
  message?: string
  error?: string
}

interface EscalaSemanal {
  colaborador: string
  telefone: string
  turnos: {
    data: string
    horario: string
    tipo: string
  }[]
}

export class WhatsAppService {
  private instanceId: string
  private token: string
  private baseUrl = 'https://api.ultramsg.com'

  constructor(instanceId: string, token: string) {
    this.instanceId = instanceId
    this.token = token
  }

  public async enviarMensagem(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      if (!this.instanceId || !this.token) {
        throw new Error('Instance ID e Token são obrigatórios')
      }

      const url = `${this.baseUrl}/${this.instanceId}/messages/chat`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: this.token,
          to: message.to,
          body: message.body,
          priority: (message.priority || 1).toString()
        })
      })

      const data = await response.json()

      if (response.ok && data.sent) {
        return {
          sent: true,
          message: 'Mensagem enviada com sucesso'
        }
      } else {
        return {
          sent: false,
          error: data.error || 'Erro ao enviar mensagem'
        }
      }
    } catch (error) {
      console.error('Erro no WhatsApp Service:', error)
      return {
        sent: false,
        error: (error as Error).message || 'Erro desconhecido'
      }
    }
  }

  public async verificarInstancia(): Promise<{ status: string; message: string }> {
    try {
      const url = `${this.baseUrl}/${this.instanceId}/instance/status`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      return {
        status: data.accountStatus || 'unknown',
        message: data.message || 'Status verificado'
      }
    } catch (error) {
      return {
        status: 'error',
        message: (error as Error).message || 'Erro ao verificar instância'
      }
    }
  }

  public gerarMensagemEscalaSemanal(escalaSemanal: EscalaSemanal): string {
    const { colaborador, turnos } = escalaSemanal
    
    let mensagem = `🗓️ *ESCALA SEMANAL - HORTIFRÚTI*\n\n`
    mensagem += `👋 Olá, ${colaborador}!\n\n`
    mensagem += `📅 *Sua escala para esta semana:*\n\n`

    if (turnos.length === 0) {
      mensagem += `🎉 *Parabéns! Você está de folga esta semana!*\n\n`
    } else {
      turnos.forEach((turno, index) => {
        const emoji = turno.tipo === 'domingo' ? '🔔' : turno.tipo === 'feriado' ? '🎉' : '📅'
        mensagem += `${emoji} *${turno.data}*\n`
        mensagem += `⏰ Horário: ${turno.horario}\n`
        if (turno.tipo === 'domingo') {
          mensagem += `📝 Tipo: Domingo (sem almoço)\n`
        } else if (turno.tipo === 'feriado') {
          mensagem += `📝 Tipo: Feriado (sem almoço)\n`
        }
        mensagem += `\n`
      })
    }

    mensagem += `─────────────────────────\n`
    mensagem += `📋 *LEMBRETES IMPORTANTES:*\n\n`
    mensagem += `• ⏰ Chegue pontualmente\n`
    mensagem += `• 🍽️ Almoço de 2h (não computado)\n`
    mensagem += `• 🚫 Máximo 6h diretas sem intervalo\n`
    mensagem += `• 📱 Qualquer dúvida, entre em contato\n\n`
    mensagem += `*Sistema de Escalas - Hortifrúti*\n`
    mensagem += `_Mensagem automática - Não responda_`

    return mensagem
  }

  public gerarMensagemLembrete(colaborador: string, proximoTurno: { data: string; horario: string }): string {
    const { data, horario } = proximoTurno
    
    let mensagem = `🔔 *LEMBRETE DE TURNO*\n\n`
    mensagem += `👋 Olá, ${colaborador}!\n\n`
    mensagem += `📅 *Lembrete do seu próximo turno:*\n\n`
    mensagem += `🗓️ Data: ${data}\n`
    mensagem += `⏰ Horário: ${horario}\n\n`
    mensagem += `📝 *Não se esqueça:*\n`
    mensagem += `• Chegar pontualmente\n`
    mensagem += `• Trazer uniforme completo\n`
    mensagem += `• Verificar escala atualizada\n\n`
    mensagem += `*Sistema de Escalas - Hortifrúti*\n`
    mensagem += `_Mensagem automática - Não responda_`

    return mensagem
  }

  public formatarTelefone(telefone: string): string {
    // Remover todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '')
    
    // Adicionar código do país se não tiver (Brasil = 55)
    if (numeroLimpo.length === 11 && numeroLimpo.startsWith('11')) {
      return `55${numeroLimpo}`
    } else if (numeroLimpo.length === 10) {
      return `5511${numeroLimpo}`
    } else if (numeroLimpo.length === 13 && numeroLimpo.startsWith('55')) {
      return numeroLimpo
    }
    
    // Formato padrão se não conseguir identificar
    return `55${numeroLimpo}`
  }

  public async enviarEscalaSemanal(escalaSemanal: EscalaSemanal): Promise<WhatsAppResponse> {
    const mensagem = this.gerarMensagemEscalaSemanal(escalaSemanal)
    const telefoneFormatado = this.formatarTelefone(escalaSemanal.telefone)
    
    return await this.enviarMensagem({
      to: telefoneFormatado,
      body: mensagem,
      priority: 1
    })
  }

  public async enviarLembrete(colaborador: string, telefone: string, proximoTurno: { data: string; horario: string }): Promise<WhatsAppResponse> {
    const mensagem = this.gerarMensagemLembrete(colaborador, proximoTurno)
    const telefoneFormatado = this.formatarTelefone(telefone)
    
    return await this.enviarMensagem({
      to: telefoneFormatado,
      body: mensagem,
      priority: 2
    })
  }

  public async testarConexao(): Promise<{ success: boolean; message: string }> {
    try {
      const status = await this.verificarInstancia()
      
      if (status.status === 'authenticated') {
        return {
          success: true,
          message: 'Conexão com WhatsApp estabelecida com sucesso'
        }
      } else {
        return {
          success: false,
          message: `Status da instância: ${status.status}. ${status.message}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na conexão: ${(error as Error).message}`
      }
    }
  }
}
