
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Plus, 
  Eye, 
  Trash2, 
  Download,
  RefreshCw,
  Clock,
  Users,
  AlertCircle,
  Check,
  X
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function EscalasPage() {
  const { data: session } = useSession()
  const [escalas, setEscalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedEscala, setSelectedEscala] = useState(null)
  const [generateForm, setGenerateForm] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    forcar: false
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchEscalas()
  }, [])

  const fetchEscalas = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/escalas")
      
      if (!response.ok) {
        throw new Error("Erro ao carregar escalas")
      }

      const data = await response.json()
      setEscalas(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateEscala = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/escalas/gerar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar escala")
      }

      toast({
        title: "Escala gerada com sucesso!",
        description: `Escala de ${generateForm.mes}/${generateForm.ano} criada com ${data.estatisticas.totalTurnos} turnos.`,
      })

      setShowGenerateDialog(false)
      fetchEscalas()
    } catch (error: any) {
      toast({
        title: "Erro ao gerar escala",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteEscala = async (escalaId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta escala?")) {
      return
    }

    try {
      const response = await fetch(`/api/escalas/${escalaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar escala")
      }

      toast({
        title: "Escala deletada",
        description: "A escala foi removida com sucesso.",
      })

      fetchEscalas()
    } catch (error: any) {
      toast({
        title: "Erro ao deletar escala",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[mes - 1]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-72">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-8 w-8" />
                      Escalas Mensais
                    </h1>
                    <p className="mt-2 text-gray-600">
                      Gerencie as escalas mensais do setor Hortifrúti
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchEscalas}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                    
                    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Gerar Nova Escala
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gerar Nova Escala</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="mes">Mês</Label>
                              <Select
                                value={generateForm.mes.toString()}
                                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, mes: parseInt(value) }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                      {getMesNome(i + 1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="ano">Ano</Label>
                              <Input
                                id="ano"
                                type="number"
                                value={generateForm.ano}
                                onChange={(e) => setGenerateForm(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                                min="2024"
                                max="2030"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="forcar"
                              checked={generateForm.forcar}
                              onChange={(e) => setGenerateForm(prev => ({ ...prev, forcar: e.target.checked }))}
                            />
                            <Label htmlFor="forcar" className="text-sm">
                              Forçar geração (sobrescrever escala existente)
                            </Label>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleGenerateEscala} disabled={isGenerating}>
                              {isGenerating ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Gerar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Escalas Grid */}
            <div className="grid gap-6">
              {escalas.map((escala: any, index: number) => (
                <motion.div
                  key={escala.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {getMesNome(escala.mes)} {escala.ano}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              Criada em {format(new Date(escala.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={escala.status === 'ativa' ? 'default' : 'secondary'}>
                            {escala.status === 'ativa' ? 'Ativa' : 'Arquivada'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{escala.colaboradores?.length || 0} colaboradores</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{escala.turnos?.length || 0} turnos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {escala.turnos?.filter((t: any) => t.tipoTurno === 'domingo').length || 0} domingos
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteEscala(escala.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {escalas.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma escala encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece gerando sua primeira escala mensal
                </p>
                <Button onClick={() => setShowGenerateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Primeira Escala
                </Button>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
