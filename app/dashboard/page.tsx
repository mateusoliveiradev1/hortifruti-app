
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { NextSchedule } from "@/components/dashboard/next-schedule"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare,
  Plus,
  Settings
} from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalColaboradores: 6,
    escalaAtiva: "Agosto 2025",
    proximoEnvio: "Domingo, 18h",
    mensagensEnviadas: 24,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-72">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">
                  Bem-vindo, {session?.user?.name}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Gerencie as escalas do setor Hortifrúti de forma eficiente
                </p>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Colaboradores"
                value={stats.totalColaboradores}
                icon={Users}
                description="6 ativos no sistema"
              />
              <StatCard
                title="Escala Atual"
                value={stats.escalaAtiva}
                icon={Calendar}
                description="Gerada automaticamente"
              />
              <StatCard
                title="Próximo Envio"
                value={stats.proximoEnvio}
                icon={Clock}
                description="Envio automático WhatsApp"
              />
              <StatCard
                title="Mensagens Enviadas"
                value={stats.mensagensEnviadas}
                icon={MessageSquare}
                description="Este mês"
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Gerar Nova Escala
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Enviar WhatsApp
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gerenciar Colaboradores
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Button>
              </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
              <RecentActivity />
              <NextSchedule />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
