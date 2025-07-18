// scripts/cadastrar-regras.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const regrasParaCadastrar = [
  {
    nome: "Turno Padrão Semana",
    tipo: "semana",
    configuracao: {
      horarioInicio: "07:00",
      horarioFim: "15:20",
      temAlmoco: true,
      cargos: [
        { cargo: "lider", quantidade: 2 },
        { cargo: "repositor", quantidade: 3 },
      ],
    },
    ativo: true,
  },
  {
    nome: "Turno Domingo/Feriado",
    tipo: "domingo_feriado",
    configuracao: {
      horarioInicio: "07:00",
      horarioFim: "13:00",
      temAlmoco: false,
      cargos: [{ cargo: "repositor", quantidade: 2 }],
    },
    ativo: true,
  },
  {
    nome: "Folga Semanal",
    tipo: "folga",
    configuracao: { diasPreferencia: [2, 4] },
    ativo: true,
  },
];

async function main() {
  console.log("Iniciando cadastro de regras com script JavaScript puro...");

  for (const regra of regrasParaCadastrar) {
    await prisma.regraEscala.upsert({
      where: { tipo: regra.tipo },
      update: { ...regra },
      create: { ...regra },
    });
    console.log(`- Regra "${regra.nome}" processada com sucesso.`);
  }

  console.log("\nSUCESSO! As regras foram cadastradas no banco de dados.");
}

main()
  .catch((e) => {
    console.error("Ocorreu um erro ao executar o script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
