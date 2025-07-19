import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize: Faltou email ou senha.");
          return null;
        }

        const colaborador = await prisma.colaborador.findUnique({
          where: { email: credentials.email },
        });

        if (!colaborador) {
          console.log(
            `Authorize: Colaborador com email ${credentials.email} não encontrado.`
          );
          return null;
        }

        if (!colaborador.senha) {
          console.log(
            `Authorize: Colaborador ${credentials.email} não tem senha no banco.`
          );
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          colaborador.senha
        );

        if (!isPasswordValid) {
          console.log(`Authorize: Senha inválida para ${credentials.email}.`);
          return null;
        }

        console.log(`Authorize: Sucesso para ${credentials.email}.`);
        return {
          id: colaborador.id,
          email: colaborador.email,
          name: colaborador.nome,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
