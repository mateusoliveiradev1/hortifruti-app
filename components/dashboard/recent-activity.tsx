
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Calendar, Users, MessageSquare } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "escala",
    title: "Escala de Agosto gerada",
    description: "Escala mensal criada automaticamente",
    time: "2 horas atrás",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    type: "whatsapp",
    title: "Escalas enviadas via WhatsApp",
    description: "6 mensagens enviadas para colaboradores",
    time: "1 dia atrás",
    icon: MessageSquare,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    type: "colaborador",
    title: "Amanda - Folga alterada",
    description: "Folga movida de terça para quinta",
    time: "2 dias atrás",
    icon: Users,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 4,
    type: "sistema",
    title: "Backup realizado",
    description: "Backup automático dos dados",
    time: "3 dias atrás",
    icon: Clock,
    color: "bg-gray-100 text-gray-600",
  },
]

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
