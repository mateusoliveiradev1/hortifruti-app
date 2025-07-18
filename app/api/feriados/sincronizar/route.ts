
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { HolidaysService } from "@/lib/holidays-service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { ano } = await request.json()

    if (!ano) {
      return NextResponse.json(
        { error: "Ano é obrigatório" },
        { status: 400 }
      )
    }

    const holidaysService = new HolidaysService()
    const result = await holidaysService.sincronizarFeriados(parseInt(ano))

    if (result.success) {
      return NextResponse.json({
        message: "Feriados sincronizados com sucesso",
        count: result.count,
        errors: result.errors
      })
    } else {
      return NextResponse.json({
        error: "Erro ao sincronizar feriados",
        errors: result.errors
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao sincronizar feriados:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    )
  }
}
