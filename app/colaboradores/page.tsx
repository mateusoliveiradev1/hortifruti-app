
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ColaboradorCard } from "@/components/colaboradores/colaborador-card"
import { ColaboradorForm } from "@/components/colaboradores/colaborador-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Crown,
  User,
  AlertCircle
} from "lucide-react"
import { motion } from "framer-motion"

export default function ColaboradoresPage() {
  const { data: session } = useSession()
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCargo, setFilterCargo] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    fetchColaboradores()
  }, [])

  const fetchColaboradores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/colaboradores")
      
      if (!response.ok) {
        throw new Error("Erro ao carregar colaboradores")
      }

      const data = await response.json()
      setColaboradores(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredColaboradores = colaboradores.filter((colaborador: any) => {
    const matchesSearch = colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colaborador.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCargo = filterCargo === "all" || colaborador.cargo === filterCargo
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "ativo" && colaborador.ativo) ||
                         (filterStatus === "inativo" && !colaborador.ativo)
    
    return matchesSearch && matchesCargo && matchesStatus
  })

  const stats = {
    total: colaboradores.length,
    ativos: colaboradores.filter((c: any) => c.ativo).length,
    lideres: colaboradores.filter((c: any) => c.cargo === "lider" && c.ativo).length,
    repositores: colaboradores.filter((c: any) => c.cargo === "repositor" && c.ativo).length,
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
                      <Users className="h-8 w-8" />
                      Colaboradores
                    </h1>
                    <p className="mt-2 text-gray-600">
                      Gerencie os colaboradores do setor Hortifrúti
                    </p>
                  </div>
                  
                  <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Colaborador
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Novo Colaborador</DialogTitle>
                      </DialogHeader>
                      <ColaboradorForm
                        onSuccess={() => {
                          setIsAddingNew(false)
                          fetchColaboradores()
                        }}
                        onCancel={() => setIsAddingNew(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Ativos</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.ativos}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Crown className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Líderes</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.lideres}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Repositores</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.repositores}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-6"
            >
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={filterCargo === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterCargo("all")}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filterCargo === "lider" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterCargo("lider")}
                    >
                      Líderes
                    </Button>
                    <Button
                      variant={filterCargo === "repositor" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterCargo("repositor")}
                    >
                      Repositores
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("all")}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filterStatus === "ativo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("ativo")}
                    >
                      Ativos
                    </Button>
                    <Button
                      variant={filterStatus === "inativo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("inativo")}
                    >
                      Inativos
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Colaboradores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColaboradores.map((colaborador: any, index: number) => (
                <motion.div
                  key={colaborador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <ColaboradorCard
                    colaborador={colaborador}
                    onUpdate={fetchColaboradores}
                  />
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredColaboradores.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum colaborador encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterCargo !== "all" || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece adicionando um novo colaborador"}
                </p>
                {!searchTerm && filterCargo === "all" && filterStatus === "all" && (
                  <Button onClick={() => setIsAddingNew(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Colaborador
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
