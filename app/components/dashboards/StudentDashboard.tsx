"use client"

import type React from "react"
import { useState } from "react"
import { useSystem } from "../../contexts/SystemContext"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../ui/toast"
import DashboardLayout from "../Layout/DashboardLayout"
import { BookOpen, Calendar, FileText, User, Upload, Send, Edit, Trash2, Save, X } from "lucide-react"

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("tema")
  const { user, updateProfile } = useAuth()
  const { addToast } = useToast()
  const {
    saveTema,
    getThemeByStudent,
    saveTutoria,
    tutorias,
    saveArchivo,
    getFilesByStudent,
    getAssignedTutor,
    generateId,
    deleteArchivo,
    updateTema,
  } = useSystem()

  const [tema, setTema] = useState({
    titulo: "",
    descripcion: "",
  })

  const [tutoriaForm, setTutoriaForm] = useState({
    fecha: "",
    hora: "",
    asunto: "",
    descripcion: "",
  })

  const [editingTheme, setEditingTheme] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    nombres: user?.nombres || "",
    apellidos: user?.apellidos || "",
    password: "",
    confirmPassword: "",
    facultad: user?.facultad || "",
    carrera: user?.carrera || "",
  })

  const currentTheme = getThemeByStudent(user?.email || "")
  const assignedTutor = getAssignedTutor(user?.email || "")
  const studentTutorias = tutorias.filter((t) => t.estudianteEmail === user?.email)
  const studentFiles = getFilesByStudent(user?.email || "")

  const handleThemeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tema.titulo || !tema.descripcion) {
      addToast({
        type: "error",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos del tema.",
      })
      return
    }

    const themeData = {
      id: generateId(),
      estudianteEmail: user?.email || "",
      titulo: tema.titulo,
      descripcion: tema.descripcion,
      fechaRegistro: new Date().toISOString(),
      aprobado: false,
    }

    saveTema(themeData)
    addToast({
      type: "success",
      title: "Tema registrado",
      description: "Tu propuesta de tema ha sido enviada correctamente.",
    })
    setTema({ titulo: "", descripcion: "" })
  }

  const handleThemeEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTheme) return

    const success = updateTema(currentTheme.id, {
      titulo: tema.titulo,
      descripcion: tema.descripcion,
    })

    if (success) {
      addToast({
        type: "success",
        title: "Tema actualizado",
        description: "Tu tema ha sido actualizado correctamente.",
      })
      setEditingTheme(false)
      setTema({ titulo: "", descripcion: "" })
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
      carrera: profileForm.carrera,
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

  const handleTutoriaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignedTutor) {
      addToast({
        type: "warning",
        title: "Sin tutor asignado",
        description: "Debes tener un tutor asignado para solicitar tutorías.",
      })
      return
    }

    if (!tutoriaForm.fecha || !tutoriaForm.hora || !tutoriaForm.asunto) {
      addToast({
        type: "error",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
      })
      return
    }

    const tutoriaData = {
      id: generateId(),
      estudianteEmail: user?.email || "",
      tutorEmail: assignedTutor.email,
      fecha: tutoriaForm.fecha,
      hora: tutoriaForm.hora,
      asunto: tutoriaForm.asunto,
      descripcion: tutoriaForm.descripcion,
      estado: "pendiente" as const,
      fechaSolicitud: new Date().toISOString(),
    }

    saveTutoria(tutoriaData)
    addToast({
      type: "success",
      title: "Tutoría solicitada",
      description: `Tu solicitud de tutoría "${tutoriaForm.asunto}" ha sido enviada.`,
    })
    setTutoriaForm({ fecha: "", hora: "", asunto: "", descripcion: "" })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      addToast({
        type: "error",
        title: "Formato inválido",
        description: "Solo se permiten archivos PDF.",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: "error",
        title: "Archivo muy grande",
        description: "El archivo no puede superar los 10MB.",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const fileData = {
        id: generateId(),
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        contenido: reader.result as string,
        estudianteEmail: user?.email || "",
        fechaSubida: new Date().toISOString(),
      }

      saveArchivo(fileData)
      addToast({
        type: "success",
        title: "Archivo subido",
        description: `El archivo "${file.name}" se ha subido correctamente.`,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)) {
      const success = deleteArchivo(fileId)
      if (success) {
        addToast({
          type: "success",
          title: "Archivo eliminado",
          description: `El archivo "${fileName}" ha sido eliminado.`,
        })
      }
    }
  }

  const sidebar = (
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => setActiveSection("tema")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "tema" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <BookOpen size={20} />
          Mi Tema
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("tutorias")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "tutorias" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Calendar size={20} />
          Tutorías
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("archivos")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "archivos" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FileText size={20} />
          Mis Archivos
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("perfil")}
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

  const renderContent = () => {
    switch (activeSection) {
      case "tema":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Propuesta de Tema</h2>

            {currentTheme ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tu Tema Actual</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentTheme.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {currentTheme.aprobado ? "Aprobado" : "Pendiente"}
                    </span>
                    {!currentTheme.aprobado && (
                      <button
                        onClick={() => {
                          setEditingTheme(true)
                          setTema({
                            titulo: currentTheme.titulo,
                            descripcion: currentTheme.descripcion,
                          })
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                    )}
                  </div>
                </div>

                {editingTheme ? (
                  <form onSubmit={handleThemeEdit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Título del Tema *</label>
                      <input
                        type="text"
                        value={tema.titulo}
                        onChange={(e) => setTema({ ...tema, titulo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Tema *</label>
                      <textarea
                        value={tema.descripcion}
                        onChange={(e) => setTema({ ...tema, descripcion: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
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
                        onClick={() => {
                          setEditingTheme(false)
                          setTema({ titulo: "", descripcion: "" })
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Título:</h4>
                      <p className="text-gray-700">{currentTheme.titulo}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Descripción:</h4>
                      <p className="text-gray-700">{currentTheme.descripcion}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Proponer Nuevo Tema</h3>
                <form onSubmit={handleThemeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título del Tema *</label>
                    <input
                      type="text"
                      value={tema.titulo}
                      onChange={(e) => setTema({ ...tema, titulo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Tema *</label>
                    <textarea
                      value={tema.descripcion}
                      onChange={(e) => setTema({ ...tema, descripcion: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Enviar Propuesta
                  </button>
                </form>
              </div>
            )}
          </div>
        )

      case "tutorias":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Tutorías</h2>

            {assignedTutor && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Solicitar Nueva Tutoría</h3>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tu tutor asignado:</strong> {assignedTutor.nombres} {assignedTutor.apellidos}
                  </p>
                </div>
                <form onSubmit={handleTutoriaSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                      <input
                        type="date"
                        value={tutoriaForm.fecha}
                        onChange={(e) => setTutoriaForm({ ...tutoriaForm, fecha: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                      <input
                        type="time"
                        value={tutoriaForm.hora}
                        onChange={(e) => setTutoriaForm({ ...tutoriaForm, hora: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asunto *</label>
                    <input
                      type="text"
                      value={tutoriaForm.asunto}
                      onChange={(e) => setTutoriaForm({ ...tutoriaForm, asunto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={tutoriaForm.descripcion}
                      onChange={(e) => setTutoriaForm({ ...tutoriaForm, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Solicitar Tutoría
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Tutorías</h3>
              {studentTutorias.length === 0 ? (
                <p className="text-gray-500">No tienes tutorías registradas.</p>
              ) : (
                <div className="space-y-3">
                  {studentTutorias.map((tutoria) => (
                    <div key={tutoria.id} className="border border-gray-200 rounded-lg p-4">
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
                      <p className="text-sm text-gray-600 mb-2">
                        {tutoria.fecha} a las {tutoria.hora}
                      </p>
                      {tutoria.descripcion && <p className="text-sm text-gray-700 mb-2">{tutoria.descripcion}</p>}
                      {tutoria.observaciones && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Observaciones:</strong> {tutoria.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "archivos":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Archivos</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Nuevo Archivo</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-4">Selecciona un archivo PDF para subir</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-500 mt-2">Máximo 10MB, solo archivos PDF</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Archivos</h3>
              {studentFiles.length === 0 ? (
                <p className="text-gray-500">No has subido archivos aún.</p>
              ) : (
                <div className="space-y-3">
                  {studentFiles.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{archivo.nombre}</h4>
                        <p className="text-sm text-gray-500">
                          Subido el {new Date(archivo.fechaSubida).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500">{(archivo.tamaño / 1024 / 1024).toFixed(2)} MB</div>
                        <button
                          onClick={() => handleDeleteFile(archivo.id, archivo.nombre)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar archivo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

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
                      carrera: user?.carrera || "",
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carrera</label>
                    <input
                      type="text"
                      value={profileForm.carrera}
                      onChange={(e) => setProfileForm({ ...profileForm, carrera: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700">Carrera</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.carrera}</p>
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
        activeSection === "tema"
          ? "Mi Tema"
          : activeSection === "tutorias"
            ? "Tutorías"
            : activeSection === "archivos"
              ? "Mis Archivos"
              : "Mi Perfil"
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}
