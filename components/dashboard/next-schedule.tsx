
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Users, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const nextSchedules = [
  {
    id: 1,
    colaborador: "Amanda Costa",
    data: new Date(2025, 7, 18), // 18 de agosto
    horario: "10:00 - 19:20",
    tipo: "normal",
  },
  {
    id: 2,
    colaborador: "Bruno Silva",
    data: new Date(2025, 7, 18), // 18 de agosto
    horario: "07:00 - 15:20",
    tipo: "normal",
  },
  {
    id: 3,
    colaborador: "Ala Santos",
    data: new Date(2025, 7, 18), // 18 de agosto
    horario: "12:00 - 20:20",
    tipo: "normal",
  },
  {
    id: 4,
    colaborador: "Moisés Oliveira",
    data: new Date(2025, 7, 17), // 17 de agosto (domingo)
    horario: "07:00 - 13:00",
    tipo: "domingo",
  },
]

export function NextSchedule() {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Escalas
        </CardTitle>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Enviar WhatsApp
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {nextSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {schedule.colaborador}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(schedule.data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {schedule.horario}
                  </div>
                  <Badge 
                    variant={schedule.tipo === "domingo" ? "secondary" : "default"}
                    className="mt-1"
                  >
                    {schedule.tipo === "domingo" ? "Domingo" : "Normal"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
