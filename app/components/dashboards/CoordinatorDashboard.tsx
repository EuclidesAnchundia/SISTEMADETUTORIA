"use client"
import { useState } from "react"
import type React from "react"

import { useSystem } from "../../contexts/SystemContext"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../ui/toast"
import DashboardLayout from "../Layout/DashboardLayout"
import { Users, UserCheck, BarChart3, FileText, Search, Edit, Save, X, Trash2, Download } from "lucide-react"

export default function CoordinatorDashboard() {
  const [activeSection, setActiveSection] = useState("asignaciones")
  const { user, updateProfile } = useAuth()
  const { addToast } = useToast()
  const { users, saveAsignacion, asignaciones, tutorias, temas, generateId, deleteAsignacion, getThemeByStudent } =
    useSystem()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedTutor, setSelectedTutor] = useState("")
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    nombres: user?.nombres || "",
    apellidos: user?.apellidos || "",
    password: "",
    confirmPassword: "",
    facultad: user?.facultad || "",
  })

  // Filtrar usuarios por facultad del coordinador
  const facultyUsers = users.filter((u) => u.facultad === user?.facultad)
  const students = facultyUsers.filter((u) => u.rol === "estudiante")
  const tutors = facultyUsers.filter((u) => u.rol === "tutor")

  const filteredStudents = students.filter(
    (student) =>
      `${student.nombres} ${student.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssignTutor = () => {
    if (!selectedStudent || !selectedTutor) {
      addToast({
        type: "error",
        title: "Selección requerida",
        description: "Debes seleccionar un estudiante y un tutor.",
      })
      return
    }

    // Verificar si ya existe asignación
    const existingAssignment = asignaciones.find((a) => a.estudianteEmail === selectedStudent)
    if (existingAssignment) {
      addToast({
        type: "warning",
        title: "Ya asignado",
        description: "Este estudiante ya tiene un tutor asignado.",
      })
      return
    }

    const assignment = {
      id: generateId(),
      estudianteEmail: selectedStudent,
      tutorEmail: selectedTutor,
      coordinadorEmail: user?.email || "",
      fechaAsignacion: new Date().toISOString(),
    }

    saveAsignacion(assignment)

    const student = students.find((s) => s.email === selectedStudent)
    const tutor = tutors.find((t) => t.email === selectedTutor)

    addToast({
      type: "success",
      title: "Asignación exitosa",
      description: `${student?.nombres} ${student?.apellidos} ha sido asignado a ${tutor?.nombres} ${tutor?.apellidos}`,
    })

    setSelectedStudent("")
    setSelectedTutor("")
  }

  const handleDeleteAssignment = (assignmentId: string, studentName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la asignación de ${studentName}?`)) {
      const success = deleteAsignacion(assignmentId)
      if (success) {
        addToast({
          type: "success",
          title: "Asignación eliminada",
          description: `La asignación de ${studentName} ha sido eliminada.`,
        })
      } else {
        addToast({
          type: "error",
          title: "Error",
          description: "No se pudo eliminar la asignación.",
        })
      }
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

  const getAssignedTutor = (studentEmail: string) => {
    const assignment = asignaciones.find((a) => a.estudianteEmail === studentEmail)
    return assignment ? tutors.find((t) => t.email === assignment.tutorEmail) : null
  }

  const getStudentStats = () => {
    const totalStudents = students.length
    const assignedStudents = students.filter((s) => getAssignedTutor(s.email)).length
    const studentsWithThemes = students.filter((s) => temas.some((t) => t.estudianteEmail === s.email)).length
    const activeTutorias = tutorias.filter(
      (t) => students.some((s) => s.email === t.estudianteEmail) && t.estado !== "completada",
    ).length

    return {
      totalStudents,
      assignedStudents,
      studentsWithThemes,
      activeTutorias,
    }
  }

  const stats = getStudentStats()

  const handleDownloadReport = async () => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF()

      // Configurar fuente y título
      doc.setFontSize(20)
      doc.text("Reporte de Tutorías - ULEAM", 20, 20)

      doc.setFontSize(14)
      doc.text(`Facultad: ${user?.facultad}`, 20, 35)
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 45)

      // Estadísticas generales
      doc.setFontSize(16)
      doc.text("Estadísticas Generales", 20, 65)

      doc.setFontSize(12)
      doc.text(`Total de Estudiantes: ${stats.totalStudents}`, 20, 80)
      doc.text(`Estudiantes con Tutor: ${stats.assignedStudents}`, 20, 90)
      doc.text(`Estudiantes con Tema: ${stats.studentsWithThemes}`, 20, 100)
      doc.text(`Tutorías Activas: ${stats.activeTutorias}`, 20, 110)

      // Lista de estudiantes
      doc.setFontSize(16)
      doc.text("Detalle de Estudiantes", 20, 130)

      let yPosition = 145
      doc.setFontSize(10)

      students.forEach((student, index) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        const assignedTutor = getAssignedTutor(student.email)
        const studentTheme = temas.find((t) => t.estudianteEmail === student.email)
        const studentTutorias = tutorias.filter((t) => t.estudianteEmail === student.email)

        doc.text(`${index + 1}. ${student.nombres} ${student.apellidos}`, 20, yPosition)
        doc.text(`   Email: ${student.email}`, 20, yPosition + 8)
        doc.text(`   Carrera: ${student.carrera}`, 20, yPosition + 16)
        doc.text(
          `   Tutor: ${assignedTutor ? `${assignedTutor.nombres} ${assignedTutor.apellidos}` : "Sin asignar"}`,
          20,
          yPosition + 24,
        )
        doc.text(`   Tema: ${studentTheme?.titulo || "Sin tema"}`, 20, yPosition + 32)
        doc.text(`   Tutorías: ${studentTutorias.length}`, 20, yPosition + 40)

        yPosition += 50
      })

      // Progreso por tutor
      if (tutors.length > 0) {
        doc.addPage()
        doc.setFontSize(16)
        doc.text("Progreso por Tutor", 20, 20)

        yPosition = 35
        doc.setFontSize(10)

        tutors.forEach((tutor, index) => {
          const assignedStudents = students.filter((s) => {
            const assignment = asignaciones.find((a) => a.estudianteEmail === s.email)
            return assignment?.tutorEmail === tutor.email
          })
          const tutorTutorias = tutorias.filter((t) => t.tutorEmail === tutor.email)
          const completedTutorias = tutorTutorias.filter((t) => t.estado === "completada")

          doc.text(`${index + 1}. ${tutor.nombres} ${tutor.apellidos}`, 20, yPosition)
          doc.text(`   Especialidad: ${tutor.especialidad}`, 20, yPosition + 8)
          doc.text(`   Estudiantes asignados: ${assignedStudents.length}`, 20, yPosition + 16)
          doc.text(`   Tutorías completadas: ${completedTutorias.length}/${tutorTutorias.length}`, 20, yPosition + 24)

          yPosition += 35

          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
        })
      }

      // Descargar el PDF
      const fileName = `reporte_${user?.facultad?.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      addToast({
        type: "success",
        title: "Reporte descargado",
        description: "El reporte PDF ha sido descargado correctamente.",
      })
    } catch (error) {
      console.error("Error generando PDF:", error)
      addToast({
        type: "error",
        title: "Error",
        description: "No se pudo generar el reporte PDF.",
      })
    }
  }

  const sidebar = (
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => setActiveSection("asignaciones")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "asignaciones" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <UserCheck size={20} />
          Asignaciones
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("estudiantes")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "estudiantes" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users size={20} />
          Estudiantes
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("reportes")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "reportes" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <BarChart3 size={20} />
          Reportes
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("temas")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "temas" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FileText size={20} />
          Temas
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("perfil")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "perfil" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users size={20} />
          Mi Perfil
        </button>
      </li>
    </ul>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "asignaciones":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Asignación de Tutores</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Asignación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Estudiante</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccionar estudiante...</option>
                    {students
                      .filter((s) => !getAssignedTutor(s.email))
                      .map((student) => (
                        <option key={student.id} value={student.email}>
                          {student.nombres} {student.apellidos} - {student.carrera}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Tutor</label>
                  <select
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccionar tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.email}>
                        {tutor.nombres} {tutor.apellidos} - {tutor.especialidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAssignTutor}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Asignar Tutor
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asignaciones Actuales</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutor Asignado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tema
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Asignación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => {
                      const assignedTutor = getAssignedTutor(student.email)
                      const assignment = asignaciones.find((a) => a.estudianteEmail === student.email)
                      const studentTheme = getThemeByStudent(student.email)
                      return (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.nombres} {student.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">{student.carrera}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignedTutor ? `${assignedTutor.nombres} ${assignedTutor.apellidos}` : "Sin asignar"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {studentTheme ? (
                              <div className="text-sm">
                                <div
                                  className="font-medium text-gray-900 truncate max-w-xs"
                                  title={studentTheme.titulo}
                                >
                                  {studentTheme.titulo.length > 30
                                    ? `${studentTheme.titulo.substring(0, 30)}...`
                                    : studentTheme.titulo}
                                </div>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    studentTheme.aprobado
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {studentTheme.aprobado ? "Aprobado" : "Pendiente"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Sin tema</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assignment ? new Date(assignment.fechaAsignacion).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                assignedTutor ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {assignedTutor ? "Asignado" : "Pendiente"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {assignment && (
                              <button
                                onClick={() =>
                                  handleDeleteAssignment(assignment.id, `${student.nombres} ${student.apellidos}`)
                                }
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case "estudiantes":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar estudiantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const assignedTutor = getAssignedTutor(student.email)
                  const studentTheme = temas.find((t) => t.estudianteEmail === student.email)
                  const studentTutorias = tutorias.filter((t) => t.estudianteEmail === student.email)

                  return (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">
                        {student.nombres} {student.apellidos}
                      </h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-sm text-gray-600">{student.carrera}</p>

                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Tutor:</span>
                          <span className={assignedTutor ? "text-green-600" : "text-red-600"}>
                            {assignedTutor ? "Asignado" : "Sin asignar"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Tema:</span>
                          <span className={studentTheme ? "text-green-600" : "text-red-600"}>
                            {studentTheme ? "Propuesto" : "Sin tema"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Tutorías:</span>
                          <span className="text-blue-600">{studentTutorias.length}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case "reportes":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
              <button
                onClick={handleDownloadReport}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={16} />
                Descargar Reporte PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Estudiantes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Con Tutor</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.assignedStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Con Tema</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.studentsWithThemes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tutorías Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeTutorias}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso por Tutor</h3>
              <div className="space-y-3">
                {tutors.map((tutor) => {
                  const assignedStudents = students.filter((s) => {
                    const assignment = asignaciones.find((a) => a.estudianteEmail === s.email)
                    return assignment?.tutorEmail === tutor.email
                  })
                  const tutorTutorias = tutorias.filter((t) => t.tutorEmail === tutor.email)
                  const completedTutorias = tutorTutorias.filter((t) => t.estado === "completada")

                  return (
                    <div
                      key={tutor.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {tutor.nombres} {tutor.apellidos}
                        </h4>
                        <p className="text-sm text-gray-600">{tutor.especialidad}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{assignedStudents.length} estudiantes</p>
                        <p className="text-xs text-gray-500">
                          {completedTutorias.length}/{tutorTutorias.length} tutorías completadas
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case "temas":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Temas de Titulación</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Temas Propuestos</h3>
              {temas.filter((t) => students.some((s) => s.email === t.estudianteEmail)).length === 0 ? (
                <p className="text-gray-500">No hay temas propuestos en tu facultad.</p>
              ) : (
                <div className="space-y-4">
                  {temas
                    .filter((t) => students.some((s) => s.email === t.estudianteEmail))
                    .map((tema) => {
                      const student = students.find((s) => s.email === tema.estudianteEmail)
                      const assignedTutor = getAssignedTutor(tema.estudianteEmail)
                      return (
                        <div key={tema.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{tema.titulo}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tema.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tema.aprobado ? "Aprobado" : "Pendiente"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Estudiante: {student?.nombres} {student?.apellidos}
                          </p>
                          {assignedTutor && (
                            <p className="text-sm text-gray-600 mb-2">
                              Tutor asignado: {assignedTutor.nombres} {assignedTutor.apellidos}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 mb-2">{tema.descripcion}</p>
                          <p className="text-xs text-gray-500">
                            Registrado: {new Date(tema.fechaRegistro).toLocaleDateString()}
                          </p>
                        </div>
                      )
                    })}
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
        activeSection === "asignaciones"
          ? "Asignaciones"
          : activeSection === "estudiantes"
            ? "Estudiantes"
            : activeSection === "reportes"
              ? "Reportes"
              : activeSection === "temas"
                ? "Temas"
                : "Mi Perfil"
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}
