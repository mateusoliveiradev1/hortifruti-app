
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ColaboradorForm } from "./colaborador-form"
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2,
  Crown,
  AlertCircle
} from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface ColaboradorCardProps {
  colaborador: any
  onUpdate: () => void
}

export function ColaboradorCard({ colaborador, onUpdate }: ColaboradorCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/colaboradores/${colaborador.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao desativar colaborador")
      }

      toast({
        title: "Colaborador desativado",
        description: `${colaborador.nome} foi desativado com sucesso.`,
      })

      onUpdate()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao desativar colaborador",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={`relative ${!colaborador.ativo ? "opacity-60" : ""}`}>
      {colaborador.cargo === "lider" && (
        <div className="absolute top-2 right-2">
          <Crown className="h-4 w-4 text-yellow-500" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {getInitials(colaborador.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{colaborador.nome}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={colaborador.cargo === "lider" ? "default" : "secondary"}>
                {colaborador.cargo === "lider" ? "Líder" : "Repositor"}
              </Badge>
              {!colaborador.ativo && (
                <Badge variant="destructive">Inativo</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {colaborador.email}
          </div>
          
          {colaborador.telefone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {colaborador.telefone}
            </div>
          )}

          {colaborador.horarioFixo && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {colaborador.horarioInicio} - {colaborador.horarioFim}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {colaborador.trabalhaDomingo 
              ? `Domingos ${colaborador.padraoFolgaDomingo}`
              : "Não trabalha domingos"
            }
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Editar Colaborador</DialogTitle>
              </DialogHeader>
              <ColaboradorForm
                colaborador={colaborador}
                onSuccess={() => {
                  setIsEditing(false)
                  onUpdate()
                }}
                onCancel={() => setIsEditing(false)}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1" />
                Desativar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Confirmar desativação
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja desativar <strong>{colaborador.nome}</strong>?
                  Esta ação não pode ser desfeita e o colaborador será removido das escalas futuras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Desativando..." : "Desativar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
