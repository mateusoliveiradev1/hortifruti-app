
interface HolidayAPI {
  name: string
  url: string
  type: 'nacional' | 'estadual' | 'municipal'
  active: boolean
}

interface HolidayData {
  date: string
  name: string
  type: string
  level: string
}

export class HolidaysService {
  private apis: HolidayAPI[] = [
    {
      name: 'Brasil API',
      url: 'https://brasilapi.com.br/api/feriados/v1/',
      type: 'nacional',
      active: true
    },
    {
      name: 'API Holidays Brasil - Nacional',
      url: 'https://rodriguesfas.github.io/holidays/national.json',
      type: 'nacional',
      active: true
    },
    {
      name: 'API Holidays Brasil - SP',
      url: 'https://rodriguesfas.github.io/holidays/state/SP.json',
      type: 'estadual',
      active: true
    }
  ]

  public async buscarFeriados(ano: number): Promise<HolidayData[]> {
    const feriados: HolidayData[] = []
    
    // Buscar feriados nacionais
    const feriadosNacionais = await this.buscarFeriadosNacionais(ano)
    feriados.push(...feriadosNacionais)
    
    // Buscar feriados estaduais de SP
    const feriadosEstaduais = await this.buscarFeriadosEstaduais(ano)
    feriados.push(...feriadosEstaduais)
    
    // Remover duplicatas
    const feriadosUnicos = this.removerDuplicatas(feriados)
    
    return feriadosUnicos
  }

  private async buscarFeriadosNacionais(ano: number): Promise<HolidayData[]> {
    const feriados: HolidayData[] = []
    
    try {
      // Tentar Brasil API primeiro
      const feriadosBrasilAPI = await this.buscarBrasilAPI(ano)
      if (feriadosBrasilAPI.length > 0) {
        feriados.push(...feriadosBrasilAPI)
      } else {
        // Fallback para API Holidays Brasil
        const feriadosBackup = await this.buscarAPIHolidaysBrasil('national', ano)
        feriados.push(...feriadosBackup)
      }
    } catch (error) {
      console.error('Erro ao buscar feriados nacionais:', error)
      
      // Fallback para feriados fixos conhecidos
      const feriadosFixos = this.getFeriadosFixosNacionais(ano)
      feriados.push(...feriadosFixos)
    }
    
    return feriados
  }

  private async buscarFeriadosEstaduais(ano: number): Promise<HolidayData[]> {
    const feriados: HolidayData[] = []
    
    try {
      // Buscar feriados estaduais de SP
      const feriadosEstaduaisSP = await this.buscarAPIHolidaysBrasil('state/SP', ano)
      feriados.push(...feriadosEstaduaisSP)
    } catch (error) {
      console.error('Erro ao buscar feriados estaduais:', error)
      
      // Fallback para feriados fixos de SP
      const feriadosFixosSP = this.getFeriadosFixosEstaduais(ano)
      feriados.push(...feriadosFixosSP)
    }
    
    return feriados
  }

  private async buscarBrasilAPI(ano: number): Promise<HolidayData[]> {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`, {
      headers: {
        'User-Agent': 'Sistema-Escalas-Hortifruti/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Brasil API erro: ${response.status}`)
    }
    
    const data = await response.json()
    
    return data.map((item: any) => ({
      date: item.date,
      name: item.name,
      type: 'nacional',
      level: 'obrigatorio'
    }))
  }

  private async buscarAPIHolidaysBrasil(endpoint: string, ano: number): Promise<HolidayData[]> {
    const response = await fetch(`https://rodriguesfas.github.io/holidays/${endpoint}.json`, {
      headers: {
        'User-Agent': 'Sistema-Escalas-Hortifruti/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API Holidays Brasil erro: ${response.status}`)
    }
    
    const data = await response.json()
    
    return data.map((item: any) => {
      let date = item.date
      
      // Processar datas variáveis
      if (item.variableDates && item.variableDates[ano.toString()]) {
        date = item.variableDates[ano.toString()]
      }
      
      // Converter formato de data se necessário
      if (date && !date.includes('-')) {
        // Formato dd/mm para yyyy-mm-dd
        const [dia, mes] = date.split('/')
        date = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
      }
      
      return {
        date: date,
        name: item.title || item.name,
        type: endpoint.includes('state') ? 'estadual' : 'nacional',
        level: item.type === 'facultativo' ? 'facultativo' : 'obrigatorio'
      }
    }).filter((item: HolidayData) => item.date) // Filtrar itens sem data
  }

  private getFeriadosFixosNacionais(ano: number): HolidayData[] {
    const feriados: HolidayData[] = [
      {
        date: `${ano}-01-01`,
        name: 'Confraternização Universal',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-04-21`,
        name: 'Tiradentes',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-05-01`,
        name: 'Dia do Trabalhador',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-09-07`,
        name: 'Independência do Brasil',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-10-12`,
        name: 'Nossa Senhora Aparecida',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-11-02`,
        name: 'Finados',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-11-15`,
        name: 'Proclamação da República',
        type: 'nacional',
        level: 'obrigatorio'
      },
      {
        date: `${ano}-12-25`,
        name: 'Natal',
        type: 'nacional',
        level: 'obrigatorio'
      }
    ]
    
    // Adicionar feriados móveis calculados
    const feriadosMoveis = this.calcularFeriadosMoveis(ano)
    feriados.push(...feriadosMoveis)
    
    return feriados
  }

  private getFeriadosFixosEstaduais(ano: number): HolidayData[] {
    return [
      {
        date: `${ano}-07-09`,
        name: 'Revolução Constitucionalista',
        type: 'estadual',
        level: 'obrigatorio'
      }
    ]
  }

  private calcularFeriadosMoveis(ano: number): HolidayData[] {
    const feriados: HolidayData[] = []
    
    // Calcular Páscoa
    const pascoa = this.calcularPascoa(ano)
    
    // Sexta-feira Santa (2 dias antes da Páscoa)
    const sextaFeiraSanta = new Date(pascoa)
    sextaFeiraSanta.setDate(pascoa.getDate() - 2)
    
    feriados.push({
      date: this.formatarData(sextaFeiraSanta),
      name: 'Sexta-feira Santa',
      type: 'nacional',
      level: 'obrigatorio'
    })
    
    // Carnaval (47 dias antes da Páscoa)
    const carnaval = new Date(pascoa)
    carnaval.setDate(pascoa.getDate() - 47)
    
    feriados.push({
      date: this.formatarData(carnaval),
      name: 'Carnaval',
      type: 'nacional',
      level: 'facultativo'
    })
    
    // Corpus Christi (60 dias após a Páscoa)
    const corpusChristi = new Date(pascoa)
    corpusChristi.setDate(pascoa.getDate() + 60)
    
    feriados.push({
      date: this.formatarData(corpusChristi),
      name: 'Corpus Christi',
      type: 'nacional',
      level: 'facultativo'
    })
    
    return feriados
  }

  private calcularPascoa(ano: number): Date {
    // Algoritmo para calcular a Páscoa
    const a = ano % 19
    const b = Math.floor(ano / 100)
    const c = ano % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const n = Math.floor((h + l - 7 * m + 114) / 31)
    const p = (h + l - 7 * m + 114) % 31
    
    return new Date(ano, n - 1, p + 1)
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear()
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const dia = data.getDate().toString().padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  private removerDuplicatas(feriados: HolidayData[]): HolidayData[] {
    const feriadosUnicos = new Map<string, HolidayData>()
    
    feriados.forEach(feriado => {
      const key = `${feriado.date}-${feriado.type}`
      if (!feriadosUnicos.has(key)) {
        feriadosUnicos.set(key, feriado)
      }
    })
    
    return Array.from(feriadosUnicos.values())
  }

  public async sincronizarFeriados(ano: number): Promise<{ success: boolean; count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0
    
    try {
      const feriados = await this.buscarFeriados(ano)
      
      // Importar prisma dinamicamente
      const { prisma } = await import('@/lib/db')
      
      // Deletar feriados existentes do ano
      await prisma.feriado.deleteMany({
        where: {
          data: {
            gte: new Date(ano, 0, 1),
            lte: new Date(ano, 11, 31)
          }
        }
      })
      
      // Inserir novos feriados
      for (const feriado of feriados) {
        if (feriado.date) {
          try {
            await prisma.feriado.create({
              data: {
                data: new Date(feriado.date),
                nome: feriado.name,
                tipo: feriado.type,
                nivel: feriado.level
              }
            })
            count++
          } catch (error) {
            errors.push(`Erro ao inserir feriado ${feriado.name}: ${(error as Error).message}`)
          }
        }
      }
      
      return { success: true, count, errors }
    } catch (error) {
      errors.push(`Erro geral: ${(error as Error).message}`)
      return { success: false, count, errors }
    }
  }
}
