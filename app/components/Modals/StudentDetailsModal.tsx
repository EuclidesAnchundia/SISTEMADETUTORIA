"use client"

import { useState } from "react"
import {
  X,
  User,
  BookOpen,
  FileText,
  MessageSquare,
  GraduationCap,
  Download,
  Check,
  XIcon,
  Clock,
  Send,
} from "lucide-react"
import { useSystem } from "../../contexts/SystemContext"
import { useAuth } from "../../contexts/AuthContext"

interface StudentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  student: any
}

export default function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  const { user } = useAuth()
  const {
    tutorias,
    temas,
    archivos,
    updateTutoria,
    updateTema,
    createNotification,
    getFilesByStudent,
    getThemeByStudent,
  } = useSystem()

  const [activeTab, setActiveTab] = useState("resumen")
  const [message, setMessage] = useState("")
  const [themeObservations, setThemeObservations] = useState("")
  const [tutoriaObservations, setTutoriaObservations] = useState("")

  if (!isOpen || !student) return null

  const studentTutorias = tutorias.filter((t) => t.estudianteEmail === student.email)
  const studentTheme = getThemeByStudent(student.email)
  const studentFiles = getFilesByStudent(student.email)

  const handleApproveTheme = () => {
    if (studentTheme) {
      updateTema(studentTheme.id, { aprobado: true })
      createNotification(
        student.email,
        "TEMA_APROBADO",
        `Tu tema "${studentTheme.titulo}" ha sido aprobado por tu tutor`,
        { observaciones: themeObservations },
      )
      setThemeObservations("")
    }
  }

  const handleRejectTheme = () => {
    if (studentTheme && themeObservations.trim()) {
      updateTema(studentTheme.id, { aprobado: false })
      createNotification(student.email, "TEMA_RECHAZADO", `Tu tema "${studentTheme.titulo}" necesita revisión`, {
        observaciones: themeObservations,
      })
      setThemeObservations("")
    }
  }

  const handleTutoriaAction = (tutoriaId: string, action: string) => {
    const tutoria = studentTutorias.find((t) => t.id === tutoriaId)
    if (!tutoria) return

    if (action === "aceptar") {
      updateTutoria(tutoriaId, { estado: "aceptada" })
    } else if (action === "rechazar" && tutoriaObservations.trim()) {
      updateTutoria(tutoriaId, {
        estado: "rechazada",
        motivoRechazo: tutoriaObservations,
      })
    } else if (action === "completar") {
      updateTutoria(tutoriaId, {
        estado: "completada",
        observaciones: tutoriaObservations,
      })
    }
    setTutoriaObservations("")
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      createNotification(student.email, "MENSAJE_TUTOR", `Mensaje de tu tutor: ${message}`, {
        tutor: `${user?.nombres} ${user?.apellidos}`,
      })
      setMessage("")
    }
  }

  const downloadFile = (archivo: any) => {
    const link = document.createElement("a")
    link.href = archivo.contenido
    link.download = archivo.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const tabs = [
    { id: "resumen", label: "Resumen", icon: User },
    { id: "tema", label: "Tema", icon: GraduationCap },
    { id: "tutorias", label: "Tutorías", icon: BookOpen },
    { id: "archivos", label: "Archivos", icon: FileText },
    { id: "indicaciones", label: "Indicaciones", icon: MessageSquare },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {student.nombres} {student.apellidos}
                </h2>
                <p className="text-red-100">{student.carrera}</p>
                <p className="text-red-200 text-sm">{student.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "resumen" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Tutorías</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {studentTutorias.filter((t) => t.estado === "completada").length}/{studentTutorias.length}
                  </p>
                  <p className="text-sm text-blue-700">Completadas</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Archivos</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{studentFiles.length}</p>
                  <p className="text-sm text-purple-700">Subidos</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Tema</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {studentTheme ? (studentTheme.aprobado ? "Aprobado" : "Pendiente") : "Sin tema"}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {studentTutorias.slice(0, 3).map((tutoria) => (
                    <div key={tutoria.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{tutoria.asunto}</p>
                        <p className="text-xs text-gray-500">
                          {tutoria.fecha} - {tutoria.hora}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tutoria.estado === "completada"
                            ? "bg-green-100 text-green-800"
                            : tutoria.estado === "aceptada"
                              ? "bg-blue-100 text-blue-800"
                              : tutoria.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tutoria.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tema" && (
            <div className="space-y-6">
              {studentTheme ? (
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tema Propuesto</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          studentTheme.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {studentTheme.aprobado ? "Aprobado" : "Pendiente de revisión"}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{studentTheme.titulo}</h4>
                    <p className="text-gray-700 mb-4">{studentTheme.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      Registrado el: {new Date(studentTheme.fechaRegistro).toLocaleDateString()}
                    </p>
                  </div>

                  {!studentTheme.aprobado && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Gestionar Tema</h4>
                      <textarea
                        value={themeObservations}
                        onChange={(e) => setThemeObservations(e.target.value)}
                        placeholder="Observaciones (opcional para aprobar, requerido para rechazar)"
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={handleApproveTheme}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Aprobar Tema
                        </button>
                        <button
                          onClick={handleRejectTheme}
                          disabled={!themeObservations.trim()}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                          Rechazar Tema
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin tema registrado</h3>
                  <p className="text-gray-500">El estudiante aún no ha registrado un tema de titulación.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tutorias" && (
            <div className="space-y-4">
              {studentTutorias.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin tutorías registradas</h3>
                  <p className="text-gray-500">El estudiante aún no ha solicitado tutorías.</p>
                </div>
              ) : (
                studentTutorias.map((tutoria) => (
                  <div key={tutoria.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{tutoria.asunto}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tutoria.estado === "completada"
                            ? "bg-green-100 text-green-800"
                            : tutoria.estado === "aceptada"
                              ? "bg-blue-100 text-blue-800"
                              : tutoria.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tutoria.estado}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{tutoria.descripcion}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>📅 {tutoria.fecha}</span>
                      <span>🕐 {tutoria.hora}</span>
                    </div>

                    {tutoria.estado === "pendiente" && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <textarea
                          value={tutoriaObservations}
                          onChange={(e) => setTutoriaObservations(e.target.value)}
                          placeholder="Observaciones (requerido para rechazar)"
                          className="w-full p-2 border border-gray-300 rounded mb-3 text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTutoriaAction(tutoria.id, "aceptar")}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            <Check className="h-3 w-3" />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleTutoriaAction(tutoria.id, "rechazar")}
                            disabled={!tutoriaObservations.trim()}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            <XIcon className="h-3 w-3" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    )}

                    {tutoria.estado === "aceptada" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <textarea
                          value={tutoriaObservations}
                          onChange={(e) => setTutoriaObservations(e.target.value)}
                          placeholder="Observaciones de la tutoría completada"
                          className="w-full p-2 border border-gray-300 rounded mb-3 text-sm"
                          rows={2}
                        />
                        <button
                          onClick={() => handleTutoriaAction(tutoria.id, "completar")}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          Marcar como Completada
                        </button>
                      </div>
                    )}

                    {tutoria.observaciones && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Observaciones:</strong> {tutoria.observaciones}
                        </p>
                      </div>
                    )}

                    {tutoria.motivoRechazo && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Motivo de rechazo:</strong> {tutoria.motivoRechazo}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "archivos" && (
            <div className="space-y-4">
              {studentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin archivos subidos</h3>
                  <p className="text-gray-500">El estudiante aún no ha subido archivos.</p>
                </div>
              ) : (
                studentFiles.map((archivo) => (
                  <div key={archivo.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{archivo.nombre}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(archivo.tamaño)} • Subido el{" "}
                            {new Date(archivo.fechaSubida).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(archivo)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "indicaciones" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Enviar Indicaciones</h4>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tus indicaciones para el estudiante..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="mt-3 flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Enviar Indicaciones
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para las indicaciones</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sé específico y constructivo en tus comentarios</li>
                  <li>• Proporciona ejemplos cuando sea posible</li>
                  <li>• Establece plazos claros para las correcciones</li>
                  <li>• Reconoce los avances y logros del estudiante</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
