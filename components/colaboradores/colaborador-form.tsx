
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColaboradorFormProps {
  colaborador?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function ColaboradorForm({ colaborador, onSuccess, onCancel }: ColaboradorFormProps) {
  const [formData, setFormData] = useState({
    nome: colaborador?.nome || "",
    email: colaborador?.email || "",
    cargo: colaborador?.cargo || "",
    telefone: colaborador?.telefone || "",
    horarioFixo: colaborador?.horarioFixo || false,
    horarioInicio: colaborador?.horarioInicio || "",
    horarioFim: colaborador?.horarioFim || "",
    trabalhaDomingo: colaborador?.trabalhaDomingo !== false,
    padraoFolgaDomingo: colaborador?.padraoFolgaDomingo || "2x2",
    ativo: colaborador?.ativo !== false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = colaborador 
        ? `/api/colaboradores/${colaborador.id}`
        : `/api/colaboradores`

      const method = colaborador ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar colaborador")
      }

      const result = await response.json()
      
      toast({
        title: colaborador ? "Colaborador atualizado!" : "Colaborador criado!",
        description: `${formData.nome} foi ${colaborador ? "atualizado" : "criado"} com sucesso.`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/colaboradores")
      }

    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {colaborador ? "Editar Colaborador" : "Novo Colaborador"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) => handleInputChange("cargo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repositor">Repositor</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="horarioFixo"
                checked={formData.horarioFixo}
                onCheckedChange={(checked) => handleInputChange("horarioFixo", checked)}
              />
              <Label htmlFor="horarioFixo">Horário Fixo</Label>
            </div>

            {formData.horarioFixo && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horarioInicio">Horário Início</Label>
                  <Input
                    id="horarioInicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={(e) => handleInputChange("horarioInicio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horarioFim">Horário Fim</Label>
                  <Input
                    id="horarioFim"
                    type="time"
                    value={formData.horarioFim}
                    onChange={(e) => handleInputChange("horarioFim", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="trabalhaDomingo"
                checked={formData.trabalhaDomingo}
                onCheckedChange={(checked) => handleInputChange("trabalhaDomingo", checked)}
              />
              <Label htmlFor="trabalhaDomingo">Trabalha aos Domingos</Label>
            </div>

            {formData.trabalhaDomingo && (
              <div>
                <Label htmlFor="padraoFolgaDomingo">Padrão de Folga nos Domingos</Label>
                <Select
                  value={formData.padraoFolgaDomingo}
                  onValueChange={(value) => handleInputChange("padraoFolgaDomingo", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x1">1x1 (Amanda)</SelectItem>
                    <SelectItem value="2x2">2x2 (Repositores)</SelectItem>
                    <SelectItem value="0x0">Nunca (Líderes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange("ativo", checked)}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
