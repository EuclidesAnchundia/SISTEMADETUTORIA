"use client"
import { useState } from "react"
import type React from "react"

import { useSystem } from "../../contexts/SystemContext"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../ui/toast"
import DashboardLayout from "../Layout/DashboardLayout"
import {
  Calendar,
  Users,
  User,
  Check,
  X,
  Star,
  Edit,
  Save,
  ArrowLeft,
  BookOpen,
  FileText,
  Send,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  GraduationCap,
} from "lucide-react"

export default function TutorDashboard() {
  const [activeSection, setActiveSection] = useState("tutorias")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentDetailTab, setStudentDetailTab] = useState("resumen")
  const { user, updateProfile } = useAuth()
  const { addToast } = useToast()
  const {
    tutorias,
    updateTutoria,
    getAssignedStudents,
    archivos,
    createNotification,
    temas,
    getTemaByStudent,
    updateTema,
  } = useSystem()

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    nombres: user?.nombres || "",
    apellidos: user?.apellidos || "",
    password: "",
    confirmPassword: "",
    facultad: user?.facultad || "",
    especialidad: user?.especialidad || "",
  })

  // Estados para gestión de tutorías
  const [tutoriaActions, setTutoriaActions] = useState<{
    [key: string]: { showActions: boolean; observaciones: string; showComplete: boolean; calificacion: string }
  }>({})

  // Estados para gestión de temas
  const [themeActions, setThemeActions] = useState<{
    [key: string]: { showRejectForm: boolean; observaciones: string }
  }>({})

  const [messageForm, setMessageForm] = useState({ mensaje: "" })

  const tutorTutorias = tutorias.filter((t) => t.tutorEmail === user?.email)
  const assignedStudents = getAssignedStudents(user?.email || "")
  const studentFiles = archivos.filter((a) => assignedStudents.some((student) => student.email === a.estudianteEmail))

  const handleTutoriaAction = (tutoriaId: string, action: "aceptar" | "rechazar", observaciones?: string) => {
    const newState = action === "aceptar" ? "aceptada" : "rechazada"
    const success = updateTutoria(tutoriaId, {
      estado: newState,
      observaciones: observaciones || "",
    })

    if (success) {
      addToast({
        type: action === "aceptar" ? "success" : "warning",
        title: `Tutoría ${action === "aceptar" ? "aceptada" : "rechazada"}`,
        description: `La tutoría ha sido ${action === "aceptar" ? "aceptada" : "rechazada"} correctamente.`,
      })

      // Reset form state
      setTutoriaActions((prev) => ({
        ...prev,
        [tutoriaId]: { showActions: false, observaciones: "", showComplete: false, calificacion: "" },
      }))
    } else {
      addToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar la tutoría.",
      })
    }
  }

  const handleCompleteTutoria = (tutoriaId: string, calificacion: string, observaciones: string) => {
    const success = updateTutoria(tutoriaId, {
      estado: "completada",
      calificacion,
      observaciones,
    })

    if (success) {
      addToast({
        type: "success",
        title: "Tutoría completada",
        description: "La tutoría ha sido marcada como completada.",
      })

      // Reset form state
      setTutoriaActions((prev) => ({
        ...prev,
        [tutoriaId]: { showActions: false, observaciones: "", showComplete: false, calificacion: "" },
      }))
    }
  }

  const handleThemeAction = (themeId: string, action: "aprobar" | "rechazar", observaciones?: string) => {
    const success = updateTema(themeId, {
      aprobado: action === "aprobar",
      comentarios: observaciones || "", // Change from 'observaciones' to 'comentarios'
    })

    if (success) {
      const theme = temas.find((t) => t.id === themeId)

      // Crear notificación para el estudiante
      if (theme && selectedStudent) {
        createNotification(
          selectedStudent.email,
          action === "aprobar" ? "TEMA_APROBADO" : "TEMA_RECHAZADO",
          `Tu tema "${theme.titulo}" ha sido ${action === "aprobar" ? "aprobado" : "rechazado"}${
            observaciones ? `. Observaciones: ${observaciones}` : ""
          }`,
        )
      }

      addToast({
        type: action === "aprobar" ? "success" : "warning",
        title: `Tema ${action === "aprobar" ? "aprobado" : "rechazado"}`,
        description: `El tema ha sido ${action === "aprobar" ? "aprobado" : "rechazado"} correctamente.`,
      })

      // Reset form state
      setThemeActions((prev) => ({
        ...prev,
        [themeId]: { showRejectForm: false, observaciones: "" },
      }))
    }
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      addToast({
        type: "error",
        title: "Error de contraseña",
        description: "Las contraseñas no coinciden.",
      })
      return
    }

    const updateData: any = {
      nombres: profileForm.nombres,
      apellidos: profileForm.apellidos,
      facultad: profileForm.facultad,
      especialidad: profileForm.especialidad,
    }

    if (profileForm.password) {
      updateData.password = profileForm.password
    }

    const success = updateProfile(updateData)
    if (success) {
      addToast({
        type: "success",
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })
      setEditingProfile(false)
      setProfileForm({ ...profileForm, password: "", confirmPassword: "" })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !messageForm.mensaje) {
      addToast({
        type: "error",
        title: "Campo requerido",
        description: "Escribe un mensaje.",
      })
      return
    }

    createNotification(selectedStudent.email, "MENSAJE_TUTOR", `Mensaje de tu tutor: ${messageForm.mensaje}`)

    addToast({
      type: "success",
      title: "Mensaje enviado",
      description: "El mensaje ha sido enviado al estudiante.",
    })

    setMessageForm({ mensaje: "" })
  }

  const handleDownloadFile = (archivo: any) => {
    try {
      const link = document.createElement("a")
      link.href = archivo.contenido
      link.download = archivo.nombre
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addToast({
        type: "success",
        title: "Descarga iniciada",
        description: `Descargando ${archivo.nombre}`,
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Error de descarga",
        description: "No se pudo descargar el archivo.",
      })
    }
  }

  const updateTutoriaAction = (tutoriaId: string, updates: Partial<(typeof tutoriaActions)[string]>) => {
    setTutoriaActions((prev) => ({
      ...prev,
      [tutoriaId]: { ...prev[tutoriaId], ...updates },
    }))
  }

  const updateThemeAction = (themeId: string, updates: Partial<(typeof themeActions)[string]>) => {
    setThemeActions((prev) => ({
      ...prev,
      [themeId]: { ...prev[themeId], ...updates },
    }))
  }

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student)
    setStudentDetailTab("resumen")
  }

  const handleBackToStudents = () => {
    setSelectedStudent(null)
    setStudentDetailTab("resumen")
  }

  const sidebar = (
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => {
            setActiveSection("tutorias")
            setSelectedStudent(null)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "tutorias" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Calendar size={20} />
          Mis Tutorías
        </button>
      </li>
      <li>
        <button
          onClick={() => {
            setActiveSection("estudiantes")
            setSelectedStudent(null)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "estudiantes" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users size={20} />
          Mis Estudiantes
        </button>
      </li>
      <li>
        <button
          onClick={() => {
            setActiveSection("perfil")
            setSelectedStudent(null)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "perfil" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <User size={20} />
          Mi Perfil
        </button>
      </li>
    </ul>
  )

  const renderStudentDetails = () => {
    if (!selectedStudent) return null

    const studentTheme = getTemaByStudent(selectedStudent.email)
    const studentTutorias = tutorias.filter((t) => t.estudianteEmail === selectedStudent.email)
    const studentArchivos = archivos.filter((f) => f.estudianteEmail === selectedStudent.email)

    const completedTutorias = studentTutorias.filter((t) => t.estado === "completada")
    const pendingTutorias = studentTutorias.filter((t) => t.estado === "pendiente")

    const tabs = [
      { id: "resumen", label: "Resumen", icon: User },
      { id: "tema", label: "Tema", icon: BookOpen },
      { id: "tutorias", label: "Tutorías", icon: Calendar },
      { id: "archivos", label: "Archivos", icon: FileText },
      { id: "indicaciones", label: "Indicaciones", icon: Send },
    ]

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToStudents}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Mis Estudiantes
          </button>
        </div>

        {/* Student Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {selectedStudent.nombres} {selectedStudent.apellidos}
              </h2>
              <p className="text-red-100 text-sm">{selectedStudent.carrera}</p>
              <p className="text-red-200 text-sm">{selectedStudent.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setStudentDetailTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    studentDetailTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {studentDetailTab === "resumen" && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-red-600" size={20} />
                  Información del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm text-gray-500">Carrera</p>
                      <p className="font-medium text-gray-900">{selectedStudent.carrera}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentTutorias.length}</div>
                  <div className="text-sm text-blue-800">Total Tutorías</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTutorias.length}</div>
                  <div className="text-sm text-green-800">Completadas</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingTutorias.length}</div>
                  <div className="text-sm text-yellow-800">Pendientes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{studentArchivos.length}</div>
                  <div className="text-sm text-purple-800">Archivos</div>
                </div>
              </div>

              {/* Quick Theme Status */}
              {studentTheme && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Estado del Tema</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{studentTheme.titulo}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        studentTheme.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {studentTheme.aprobado ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {studentDetailTab === "tema" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="mr-2 text-red-600" size={20} />
                Tema de Titulación
              </h3>

              {studentTheme ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 text-lg">{studentTheme.titulo}</h4>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                          studentTheme.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {studentTheme.aprobado ? "Aprobado" : "Pendiente"}
                      </span>
                    </div>

                    <p className="text-gray-700">{studentTheme.descripcion}</p>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      Registrado: {new Date(studentTheme.fechaRegistro).toLocaleDateString()}
                    </div>

                    {/* Theme Action Buttons */}
                    {!studentTheme.aprobado && !studentTheme.fechaRevision && (
                      <div className="space-y-3 pt-4 border-t">
                        {!themeActions[studentTheme.id]?.showRejectForm ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleThemeAction(studentTheme.id, "aprobar")}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Aprobar Tema
                            </button>
                            <button
                              onClick={() => updateThemeAction(studentTheme.id, { showRejectForm: true })}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Rechazar Tema
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-red-50 rounded-lg">
                            <textarea
                              placeholder="Motivo del rechazo y sugerencias para el estudiante..."
                              value={themeActions[studentTheme.id]?.observaciones || ""}
                              onChange={(e) => updateThemeAction(studentTheme.id, { observaciones: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
                              rows={4}
                              required
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const obs = themeActions[studentTheme.id]?.observaciones
                                  if (obs?.trim()) {
                                    handleThemeAction(studentTheme.id, "rechazar", obs)
                                  }
                                }}
                                disabled={!themeActions[studentTheme.id]?.observaciones?.trim()}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                              >
                                Confirmar Rechazo
                              </button>
                              <button
                                onClick={() =>
                                  updateThemeAction(studentTheme.id, { showRejectForm: false, observaciones: "" })
                                }
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {studentTheme.observaciones && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Observaciones:</strong> {studentTheme.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Este estudiante aún no ha propuesto un tema</p>
                </div>
              )}
            </div>
          )}

          {studentDetailTab === "tutorias" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="mr-2 text-red-600" size={20} />
                Gestión de Tutorías ({studentTutorias.length})
              </h3>

              {studentTutorias.length > 0 ? (
                <div className="space-y-4">
                  {studentTutorias
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .map((tutoria) => {
                      const actionState = tutoriaActions[tutoria.id] || {
                        showActions: false,
                        observaciones: "",
                        showComplete: false,
                        calificacion: "",
                      }

                      return (
                        <div key={tutoria.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">{tutoria.asunto}</h4>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                tutoria.estado === "aceptada"
                                  ? "bg-green-100 text-green-800"
                                  : tutoria.estado === "rechazada"
                                    ? "bg-red-100 text-red-800"
                                    : tutoria.estado === "completada"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tutoria.estado}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock size={14} className="mr-1" />
                            {tutoria.fecha} a las {tutoria.hora}
                          </div>

                          {tutoria.descripcion && <p className="text-sm text-gray-700 mb-3">{tutoria.descripcion}</p>}

                          {/* Action buttons based on status */}
                          {tutoria.estado === "pendiente" && (
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() => handleTutoriaAction(tutoria.id, "aceptar")}
                                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                              >
                                <Check size={14} />
                                Aceptar
                              </button>
                              <button
                                onClick={() => updateTutoriaAction(tutoria.id, { showActions: true })}
                                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                              >
                                <X size={14} />
                                Rechazar
                              </button>
                            </div>
                          )}

                          {tutoria.estado === "aceptada" && (
                            <button
                              onClick={() => updateTutoriaAction(tutoria.id, { showComplete: true })}
                              className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 mb-3"
                            >
                              Marcar como Completada
                            </button>
                          )}

                          {/* Reject form */}
                          {actionState.showActions && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <textarea
                                placeholder="Motivo del rechazo (opcional)"
                                value={actionState.observaciones}
                                onChange={(e) => updateTutoriaAction(tutoria.id, { observaciones: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleTutoriaAction(tutoria.id, "rechazar", actionState.observaciones)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                  Confirmar Rechazo
                                </button>
                                <button
                                  onClick={() =>
                                    updateTutoriaAction(tutoria.id, { showActions: false, observaciones: "" })
                                  }
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Complete form */}
                          {actionState.showComplete && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <div className="space-y-2 mb-2">
                                <select
                                  value={actionState.calificacion}
                                  onChange={(e) => updateTutoriaAction(tutoria.id, { calificacion: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">Seleccionar calificación</option>
                                  <option value="Excelente">Excelente</option>
                                  <option value="Muy Bueno">Muy Bueno</option>
                                  <option value="Bueno">Bueno</option>
                                  <option value="Regular">Regular</option>
                                </select>
                                <textarea
                                  placeholder="Observaciones finales"
                                  value={actionState.observaciones}
                                  onChange={(e) => updateTutoriaAction(tutoria.id, { observaciones: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (actionState.calificacion) {
                                      handleCompleteTutoria(
                                        tutoria.id,
                                        actionState.calificacion,
                                        actionState.observaciones,
                                      )
                                    }
                                  }}
                                  disabled={!actionState.calificacion}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Completar
                                </button>
                                <button
                                  onClick={() =>
                                    updateTutoriaAction(tutoria.id, {
                                      showComplete: false,
                                      calificacion: "",
                                      observaciones: "",
                                    })
                                  }
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Display existing observations and ratings */}
                          {tutoria.observaciones && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">
                                <strong>Observaciones:</strong> {tutoria.observaciones}
                              </p>
                            </div>
                          )}

                          {tutoria.calificacion && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Calificación:</strong> {tutoria.calificacion}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No hay tutorías registradas</p>
                </div>
              )}
            </div>
          )}

          {studentDetailTab === "archivos" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="mr-2 text-red-600" size={20} />
                Archivos Subidos ({studentArchivos.length})
              </h3>

              {studentArchivos.length > 0 ? (
                <div className="space-y-3">
                  {studentArchivos
                    .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
                    .map((archivo) => (
                      <div
                        key={archivo.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={24} />
                          <div>
                            <p className="font-medium text-gray-900">{archivo.nombre}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(archivo.fechaSubida).toLocaleDateString()} •{" "}
                              {(archivo.tamaño / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(archivo)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No hay archivos subidos</p>
                </div>
              )}
            </div>
          )}

          {studentDetailTab === "indicaciones" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Send className="mr-2 text-red-600" size={20} />
                Enviar Indicaciones
              </h3>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje para {selectedStudent.nombres} {selectedStudent.apellidos}
                    </label>
                    <textarea
                      value={messageForm.mensaje}
                      onChange={(e) => setMessageForm({ mensaje: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Escribe tus indicaciones aquí..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderStudentsList = () => {
    const getStudentStats = (studentEmail: string) => {
      const studentTutorias = tutorias.filter((t) => t.estudianteEmail === studentEmail)
      const studentTheme = getTemaByStudent(studentEmail)
      const studentFiles = archivos.filter((a) => a.estudianteEmail === studentEmail)

      return {
        totalTutorias: studentTutorias.length,
        completedTutorias: studentTutorias.filter((t) => t.estado === "completada").length,
        pendingTutorias: studentTutorias.filter((t) => t.estado === "pendiente").length,
        hasTheme: !!studentTheme,
        themeApproved: studentTheme?.aprobado || false,
        totalFiles: studentFiles.length,
      }
    }

    const getProgressColor = (stats: any) => {
      if (stats.themeApproved && stats.completedTutorias > 0) return "from-green-500 to-green-600"
      if (stats.hasTheme && stats.totalTutorias > 0) return "from-yellow-500 to-yellow-600"
      return "from-red-500 to-red-600"
    }

    const getProgressText = (stats: any) => {
      if (stats.themeApproved && stats.completedTutorias > 0) return "En progreso avanzado"
      if (stats.hasTheme && stats.totalTutorias > 0) return "En desarrollo"
      return "Iniciando proceso"
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Estudiantes</h1>
              <p className="text-gray-600">Gestiona a todos tus estudiantes asignados desde aquí</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Estudiantes</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{assignedStudents.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Temas Aprobados</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {assignedStudents.filter((s) => temas.find((t) => t.estudianteEmail === s.email)?.aprobado).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Tutorías Pendientes</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {tutorias.filter((t) => t.tutorEmail === user?.email && t.estado === "pendiente").length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total Archivos</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {assignedStudents.reduce((total, student) => {
                  return total + archivos.filter((a) => a.estudianteEmail === student.email).length
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedStudents.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes estudiantes asignados</h3>
              <p className="text-gray-500">
                Los estudiantes asignados aparecerán aquí cuando el coordinador los asigne.
              </p>
            </div>
          ) : (
            assignedStudents.map((student) => {
              const stats = getStudentStats(student.email)
              return (
                <div key={student.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Student Header */}
                  <div className={`bg-gradient-to-r ${getProgressColor(stats)} p-4 rounded-t-lg`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">
                          {student.nombres} {student.apellidos}
                        </h3>
                        <p className="text-sm opacity-90">{student.carrera}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                        {getProgressText(stats)}
                      </span>
                    </div>
                  </div>

                  {/* Student Stats */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Tutorías</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {stats.completedTutorias}/{stats.totalTutorias}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-gray-600">Archivos</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{stats.totalFiles}</p>
                      </div>
                    </div>

                    {/* Theme Status */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Tema de Titulación</span>
                      </div>
                      {stats.hasTheme ? (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            stats.themeApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {stats.themeApproved ? "Aprobado" : "Pendiente de revisión"}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Sin tema registrado
                        </span>
                      )}
                    </div>

                    {/* Pending Actions */}
                    {stats.pendingTutorias > 0 && (
                      <div className="mb-4 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {stats.pendingTutorias} tutoría{stats.pendingTutorias > 1 ? "s" : ""} pendiente
                          {stats.pendingTutorias > 1 ? "s" : ""}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleStudentSelect(student)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Gestionar Estudiante
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "tutorias":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Tutorías</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pendientes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tutorTutorias.filter((t) => t.estado === "pendiente").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Aceptadas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tutorTutorias.filter((t) => t.estado === "aceptada").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completadas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tutorTutorias.filter((t) => t.estado === "completada").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Solicitudes de Tutoría</h3>
              {tutorTutorias.length === 0 ? (
                <p className="text-gray-500">No tienes tutorías asignadas.</p>
              ) : (
                <div className="space-y-4">
                  {tutorTutorias.map((tutoria) => (
                    <TutoriaCard
                      key={tutoria.id}
                      tutoria={tutoria}
                      onAction={handleTutoriaAction}
                      onComplete={handleCompleteTutoria}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "estudiantes":
        return selectedStudent ? renderStudentDetails() : renderStudentsList()

      case "perfil":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              <button
                onClick={() => {
                  setEditingProfile(!editingProfile)
                  if (!editingProfile) {
                    setProfileForm({
                      nombres: user?.nombres || "",
                      apellidos: user?.apellidos || "",
                      password: "",
                      confirmPassword: "",
                      facultad: user?.facultad || "",
                      especialidad: user?.especialidad || "",
                    })
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit size={16} />
                {editingProfile ? "Cancelar" : "Editar Perfil"}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              {editingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                      <input
                        type="text"
                        value={profileForm.nombres}
                        onChange={(e) => setProfileForm({ ...profileForm, nombres: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                      <input
                        type="text"
                        value={profileForm.apellidos}
                        onChange={(e) => setProfileForm({ ...profileForm, apellidos: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (No editable)</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facultad</label>
                    <select
                      value={profileForm.facultad}
                      onChange={(e) => setProfileForm({ ...profileForm, facultad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Seleccionar facultad...</option>
                      <option value="Facultad Ciencias Sociales, Derecho y Bienestar">
                        Facultad Ciencias Sociales, Derecho y Bienestar
                      </option>
                      <option value="Facultad de Educación, Turismo, Artes y Humanidades">
                        Facultad de Educación, Turismo, Artes y Humanidades
                      </option>
                      <option value="Facultad de Ciencias Administrativas, Contables y Comerciales">
                        Facultad de Ciencias Administrativas, Contables y Comerciales
                      </option>
                      <option value="Facultad de Ciencias de la Salud">Facultad de Ciencias de la Salud</option>
                      <option value="Facultad de Ingeniería, Industria y Arquitectura">
                        Facultad de Ingeniería, Industria y Arquitectura
                      </option>
                      <option value="Facultad de Ciencias de la Vida y Tecnologías">
                        Facultad de Ciencias de la Vida y Tecnologías
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                    <input
                      type="text"
                      value={profileForm.especialidad}
                      onChange={(e) => setProfileForm({ ...profileForm, especialidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña (opcional)
                      </label>
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.nombres}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.apellidos}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{user?.rol}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Facultad</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.facultad}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.especialidad}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout
      sidebar={sidebar}
      title={
        activeSection === "tutorias"
          ? "Mis Tutorías"
          : activeSection === "estudiantes"
            ? selectedStudent
              ? `${selectedStudent.nombres} ${selectedStudent.apellidos}`
              : "Mis Estudiantes"
            : "Mi Perfil"
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}

// Componente para cada tutoría
function TutoriaCard({
  tutoria,
  onAction,
  onComplete,
}: {
  tutoria: any
  onAction: (id: string, action: "aceptar" | "rechazar", observaciones?: string) => void
  onComplete: (id: string, calificacion: string, observaciones: string) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [calificacion, setCalificacion] = useState("")
  const [showComplete, setShowComplete] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{tutoria.asunto}</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tutoria.estado === "aceptada"
              ? "bg-green-100 text-green-800"
              : tutoria.estado === "rechazada"
                ? "bg-red-100 text-red-800"
                : tutoria.estado === "completada"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {tutoria.estado}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-2">Estudiante: {tutoria.estudianteEmail}</p>
      <p className="text-sm text-gray-600 mb-2">
        Fecha: {tutoria.fecha} a las {tutoria.hora}
      </p>

      {tutoria.descripcion && <p className="text-sm text-gray-700 mb-3">{tutoria.descripcion}</p>}

      {tutoria.estado === "pendiente" && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction(tutoria.id, "aceptar")}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <Check size={14} />
            Aceptar
          </button>
          <button
            onClick={() => setShowActions(true)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
          >
            <X size={14} />
            Rechazar
          </button>
        </div>
      )}

      {tutoria.estado === "aceptada" && (
        <button
          onClick={() => setShowComplete(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Marcar como Completada
        </button>
      )}

      {showActions && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <textarea
            placeholder="Motivo del rechazo (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                onAction(tutoria.id, "rechazar", observaciones)
                setShowActions(false)
                setObservaciones("")
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Confirmar Rechazo
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showComplete && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <div className="space-y-2">
            <select
              value={calificacion}
              onChange={(e) => setCalificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Seleccionar calificación</option>
              <option value="Excelente">Excelente</option>
              <option value="Muy Bueno">Muy Bueno</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
            </select>
            <textarea
              placeholder="Observaciones finales"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={2}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                if (calificacion) {
                  onComplete(tutoria.id, calificacion, observaciones)
                  setShowComplete(false)
                  setCalificacion("")
                  setObservaciones("")
                }
              }}
              disabled={!calificacion}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Completar
            </button>
            <button
              onClick={() => setShowComplete(false)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tutoria.observaciones && (
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>Observaciones:</strong> {tutoria.observaciones}
          </p>
        </div>
      )}

      {tutoria.calificacion && (
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Calificación:</strong> {tutoria.calificacion}
          </p>
        </div>
      )}
    </div>
  )
}
