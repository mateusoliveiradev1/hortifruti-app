import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { ScheduleGenerator } from "@/lib/schedule-generator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { mes, ano, forcar = false } = await request.json();

    if (!mes || !ano) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const mesInt = parseInt(mes);
    const anoInt = parseInt(ano);

    // Verificar se já existe escala para este mês/ano
    const escalaExistente = await prisma.escalaMensal.findUnique({
      where: {
        mes_ano: {
          mes: mesInt,
          ano: anoInt,
        },
      },
    });

    if (escalaExistente && !forcar) {
      return NextResponse.json(
        {
          error:
            "Já existe uma escala para este período. Use 'forcar: true' para sobrescrever.",
        },
        { status: 400 }
      );
    }

    // Se forçar, deletar a escala existente
    if (escalaExistente && forcar) {
      await prisma.escalaMensal.delete({ where: { id: escalaExistente.id } });
      // O Prisma em cascata (onDelete: Cascade) cuidará de deletar turnos e EscalaColaborador
    }

    // --- PREPARAÇÃO DOS DADOS PARA O GERADOR ---

    // 1. Buscar colaboradores ativos
    const colaboradores = await prisma.colaborador.findMany({
      where: { ativo: true },
    });

    if (colaboradores.length === 0) {
      return NextResponse.json(
        { error: "Nenhum colaborador ativo encontrado" },
        { status: 400 }
      );
    }

    // 2. Buscar feriados do ano
    const inicioAno = new Date(anoInt, 0, 1);
    const fimAno = new Date(anoInt, 11, 31);
    const feriados = await prisma.feriado.findMany({
      where: {
        data: {
          gte: inicioAno,
          lte: fimAno,
        },
      },
    });

    // 3. ALTERAÇÃO: Buscar as regras ativas do banco
    const regras = await prisma.regraEscala.findMany({
      where: { ativo: true },
    });

    if (regras.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhuma regra de escala ativa encontrada. Configure as regras antes de gerar.",
        },
        { status: 400 }
      );
    }

    // --- GERAÇÃO DA ESCALA ---

    console.log("Invocando o ScheduleGenerator...");
    const generator = new ScheduleGenerator({
      mes: mesInt,
      ano: anoInt,
      colaboradores: colaboradores,
      feriados: feriados,
      regras: regras, // Passando as regras para o motor
    });

    const turnosParaCriar = generator.gerarEscala();
    console.log(
      `${turnosParaCriar.length} turnos gerados. Salvando no banco...`
    );

    // --- SALVAMENTO OTIMIZADO NO BANCO DE DADOS ---

    const escala = await prisma.escalaMensal.create({
      data: {
        mes: mesInt,
        ano: anoInt,
        status: "ativa",
        // Criar as relações com os colaboradores de forma aninhada
        colaboradores: {
          create: colaboradores.map((colab) => ({
            colaboradorId: colab.id,
          })),
        },
      },
    });

    // ALTERAÇÃO: Salvar todos os turnos de uma vez (MUITO mais rápido!)
    if (turnosParaCriar.length > 0) {
      await prisma.turno.createMany({
        data: turnosParaCriar.map((turno) => ({
          ...turno,
          escalaMensalId: escala.id,
        })),
      });
    }

    console.log(
      "Escala e turnos salvos com sucesso. Buscando resultado completo..."
    );

    // --- RETORNO PARA O FRONT-END ---

    const escalaCompleta = await prisma.escalaMensal.findUnique({
      where: { id: escala.id },
      include: {
        colaboradores: {
          include: {
            colaborador: true,
          },
        },
        turnos: {
          include: {
            colaborador: true,
          },
          orderBy: {
            data: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Escala gerada com sucesso",
        escala: escalaCompleta,
        estatisticas: {
          totalTurnos: turnosParaCriar.length,
          colaboradoresEnvolvidos: colaboradores.length,
          feriadosConsiderados: feriados.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro GERAL ao gerar escala:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return NextResponse.json(
      { error: "Erro interno do servidor: " + errorMessage },
      { status: 500 }
    );
  }
}
