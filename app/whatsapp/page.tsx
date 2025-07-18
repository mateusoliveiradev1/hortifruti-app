
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Settings, 
  Send, 
  TestTube,
  History,
  RefreshCw,
  Check,
  X,
  Clock,
  User,
  AlertCircle,
  Info
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function WhatsAppPage() {
  const { data: session } = useSession()
  const [config, setConfig] = useState({
    instanceId: '',
    token: '',
    ativo: false,
    envioAutomatico: true,
    diaEnvio: 0,
    horarioEnvio: '18:00'
  })
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [testingConnection, setTestingConnection] = useState(false)
  const [sendingMessages, setSendingMessages] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
    fetchHistorico()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/whatsapp/config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error)
    }
  }

  const fetchHistorico = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/whatsapp/historico")
      if (response.ok) {
        const data = await response.json()
        setHistorico(data)
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch("/api/whatsapp/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Configuração salva",
          description: "As configurações do WhatsApp foram atualizadas com sucesso.",
        })
      } else {
        throw new Error("Erro ao salvar configuração")
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configuração",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleTestConnection = async () => {
    if (!config.instanceId || !config.token) {
      toast({
        title: "Configuração incompleta",
        description: "Instance ID e Token são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/whatsapp/testar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceId: config.instanceId,
          token: config.token
        }),
      })

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        toast({
          title: "Conexão testada com sucesso!",
          description: data.message,
        })
      } else {
        toast({
          title: "Falha na conexão",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message
      })
      toast({
        title: "Erro no teste de conexão",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSendMessages = async (tipo = 'escala') => {
    if (!config.ativo && !confirm("WhatsApp está desativado. Deseja enviar mesmo assim?")) {
      return
    }

    setSendingMessages(true)
    
    try {
      const response = await fetch("/api/whatsapp/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: tipo,
          forceEnvio: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Mensagens enviadas!",
          description: `${data.estatisticas.enviados} mensagens enviadas com sucesso, ${data.estatisticas.erros} erros.`,
        })
        fetchHistorico()
      } else {
        throw new Error(data.error || "Erro ao enviar mensagens")
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagens",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSendingMessages(false)
    }
  }

  const getDiaSemana = (dia: number) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return dias[dia]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Check className="h-4 w-4 text-green-500" />
      case 'erro':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
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
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-8 w-8" />
                  WhatsApp
                </h1>
                <p className="mt-2 text-gray-600">
                  Configure o envio automático de escalas via WhatsApp
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuração */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="instanceId">Instance ID</Label>
                      <Input
                        id="instanceId"
                        placeholder="Digite o Instance ID do UltraMsg"
                        value={config.instanceId}
                        onChange={(e) => setConfig(prev => ({ ...prev, instanceId: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="token">Token</Label>
                      <Input
                        id="token"
                        type="password"
                        placeholder="Digite o Token do UltraMsg"
                        value={config.token}
                        onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={config.ativo}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ativo: checked }))}
                      />
                      <Label htmlFor="ativo">Ativar WhatsApp</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="envioAutomatico"
                        checked={config.envioAutomatico}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, envioAutomatico: checked }))}
                      />
                      <Label htmlFor="envioAutomatico">Envio Automático</Label>
                    </div>

                    <div>
                      <Label htmlFor="diaEnvio">Dia da Semana para Envio</Label>
                      <Select
                        value={config.diaEnvio.toString()}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, diaEnvio: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 7 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {getDiaSemana(i)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="horarioEnvio">Horário do Envio</Label>
                      <Input
                        id="horarioEnvio"
                        type="time"
                        value={config.horarioEnvio}
                        onChange={(e) => setConfig(prev => ({ ...prev, horarioEnvio: e.target.value }))}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleSaveConfig} className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Salvar Configuração
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                      >
                        {testingConnection ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {testResult && (
                      <Alert variant={testResult.success ? "default" : "destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{testResult.message}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Ações */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Ações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full" 
                      onClick={() => handleSendMessages('escala')}
                      disabled={sendingMessages}
                    >
                      {sendingMessages ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Escalas Semanais
                        </>
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleSendMessages('lembrete')}
                      disabled={sendingMessages}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar Lembretes
                    </Button>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        O UltraMsg permite 10 mensagens gratuitas por dia. Configure com cuidado.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Histórico */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-fit">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Histórico de Envios
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchHistorico}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                      ) : historico.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum envio registrado
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {historico.map((item: any) => (
                            <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(item.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.colaborador?.nome}
                                  </p>
                                  <Badge variant={item.tipoEnvio === 'automatico' ? 'default' : 'secondary'}>
                                    {item.tipoEnvio}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(item.dataEnvio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {item.mensagem}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
