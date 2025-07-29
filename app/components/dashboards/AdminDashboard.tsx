"use client"

import type React from "react"
import { useState } from "react"
import { useSystem } from "../../contexts/SystemContext"
import { useAuth } from "../../contexts/AuthContext"
import DashboardLayout from "../Layout/DashboardLayout"
import { Users, BarChart3, Settings, Trash2, UserPlus, Search, AlertTriangle, Edit } from "lucide-react"
import { useToast } from "../../components/ui/toast"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("usuarios")
  const {
    users,
    deleteUser,
    saveUser,
    generateId,
    resetSystem,
    getSystemStats,
    getUserByEmail,
    updateUser,
    createUser,
    assignTutorToStudent,
  } = useSystem()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "estudiante" as "estudiante" | "tutor" | "coordinador" | "administrador",
    facultad: "",
    carrera: "",
    especialidad: "",
  })

  const stats = getSystemStats()
  const filteredUsers = users.filter(
    (u) =>
      u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const { addToast } = useToast()

  const handleDeleteUser = (email: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      const success = deleteUser(email)
      if (success) {
        addToast({
          type: "success",
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente.",
        })
      } else {
        addToast({
          type: "error",
          title: "Error",
          description: "No se pudo eliminar el usuario.",
        })
      }
    }
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()

    if (getUserByEmail(newUser.email)) {
      addToast({
        type: "error",
        title: "Usuario existente",
        description: "Ya existe un usuario con este correo electrónico.",
      })
      return
    }

    const userData = {
      id: generateId(),
      ...newUser,
      preguntaSeguridad: "mascota",
      respuestaSeguridad: "admin",
      fechaRegistro: new Date().toISOString(),
    }

    const success = createUser(userData)
    if (success) {
      addToast({
        type: "success",
        title: "Usuario creado",
        description: `Usuario ${newUser.nombres} ${newUser.apellidos} creado correctamente.`,
      })

      setNewUser({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        rol: "estudiante",
        facultad: "",
        carrera: "",
        especialidad: "",
      })
      setShowCreateForm(false)
    }
  }

  const [editingUser, setEditingUser] = useState<any>(null)
  const [editUserForm, setEditUserForm] = useState({
    nombres: "",
    apellidos: "",
    password: "",
    facultad: "",
    carrera: "",
    especialidad: "",
  })

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setEditUserForm({
      nombres: user.nombres,
      apellidos: user.apellidos,
      password: "",
      facultad: user.facultad || "",
      carrera: user.carrera || "",
      especialidad: user.especialidad || "",
    })
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()

    const updateData: any = {
      nombres: editUserForm.nombres,
      apellidos: editUserForm.apellidos,
      facultad: editUserForm.facultad,
    }

    if (editUserForm.password) {
      updateData.password = editUserForm.password
    }

    if (editingUser.rol === "estudiante") {
      updateData.carrera = editUserForm.carrera
    } else if (editingUser.rol === "tutor") {
      updateData.especialidad = editUserForm.especialidad
    }

    const success = updateUser(editingUser.email, updateData)
    if (success) {
      addToast({
        type: "success",
        title: "Usuario actualizado",
        description: `Usuario ${editUserForm.nombres} ${editUserForm.apellidos} actualizado correctamente.`,
      })
      setEditingUser(null)
      setEditUserForm({
        nombres: "",
        apellidos: "",
        password: "",
        facultad: "",
        carrera: "",
        especialidad: "",
      })
    } else {
      addToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el usuario.",
      })
    }
  }

  const handleResetSystem = () => {
    if (window.confirm("¿Estás seguro de que quieres reiniciar todo el sistema? Esta acción no se puede deshacer.")) {
      if (window.confirm("CONFIRMACIÓN FINAL: Se eliminarán TODOS los datos del sistema.")) {
        resetSystem()
        addToast({
          type: "warning",
          title: "Sistema reiniciado",
          description: "Todos los datos del sistema han sido eliminados.",
          duration: 8000,
        })
      }
    }
  }

  // Asignaciones
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedTutor, setSelectedTutor] = useState("")
  const students = users.filter((u) => u.rol === "estudiante")
  const tutors = users.filter((u) => u.rol === "tutor")

  const handleAssignTutor = () => {
    if (!selectedStudent || !selectedTutor) {
      addToast({
        type: "error",
        title: "Selección requerida",
        description: "Debes seleccionar un estudiante y un tutor.",
      })
      return
    }

    const success = assignTutorToStudent(selectedStudent, selectedTutor)
    if (success) {
      const student = students.find((s) => s.id === selectedStudent)
      const tutor = tutors.find((t) => t.id === selectedTutor)

      addToast({
        type: "success",
        title: "Asignación exitosa",
        description: `${student?.nombres} ${student?.apellidos} ha sido asignado a ${tutor?.nombres} ${tutor?.apellidos}`,
      })

      setSelectedStudent("")
      setSelectedTutor("")
    }
  }

  const sidebar = (
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => setActiveSection("usuarios")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "usuarios" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users size={20} />
          Gestión de Usuarios
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("asignaciones")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "asignaciones" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <UserPlus size={20} />
          Asignaciones
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("estadisticas")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "estadisticas" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <BarChart3 size={20} />
          Estadísticas
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveSection("configuracion")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
            activeSection === "configuracion" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Settings size={20} />
          Configuración
        </button>
      </li>
    </ul>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "usuarios":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Crear Usuario
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facultad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((usuario) => (
                      <tr key={usuario.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombres} {usuario.apellidos}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              usuario.rol === "administrador"
                                ? "bg-purple-100 text-purple-800"
                                : usuario.rol === "coordinador"
                                  ? "bg-blue-100 text-blue-800"
                                  : usuario.rol === "tutor"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.facultad || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(usuario)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Edit size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usuario.email)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              disabled={usuario.email === user?.email}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create User Modal */}
            {showCreateForm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                  <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateForm(false)}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleCreateUser} className="bg-white px-4 pt-5 pb-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Nombres"
                            value={newUser.nombres}
                            onChange={(e) => setNewUser({ ...newUser, nombres: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Apellidos"
                            value={newUser.apellidos}
                            onChange={(e) => setNewUser({ ...newUser, apellidos: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                        <select
                          value={newUser.rol}
                          onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="estudiante">Estudiante</option>
                          <option value="tutor">Tutor</option>
                          <option value="coordinador">Coordinador</option>
                          <option value="administrador">Administrador</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Facultad"
                          value={newUser.facultad}
                          onChange={(e) => setNewUser({ ...newUser, facultad: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {newUser.rol === "estudiante" && (
                          <input
                            type="text"
                            placeholder="Carrera"
                            value={newUser.carrera}
                            onChange={(e) => setNewUser({ ...newUser, carrera: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        )}
                        {(newUser.rol === "tutor" || newUser.rol === "coordinador") && (
                          <input
                            type="text"
                            placeholder="Especialidad"
                            value={newUser.especialidad}
                            onChange={(e) => setNewUser({ ...newUser, especialidad: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        )}
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                          Crear Usuario
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                  <div className="fixed inset-0 transition-opacity" onClick={() => setEditingUser(null)}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleUpdateUser} className="bg-white px-4 pt-5 pb-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Usuario</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Nombres"
                            value={editUserForm.nombres}
                            onChange={(e) => setEditUserForm({ ...editUserForm, nombres: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Apellidos"
                            value={editUserForm.apellidos}
                            onChange={(e) => setEditUserForm({ ...editUserForm, apellidos: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        </div>
                        <input
                          type="email"
                          value={editingUser.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                        <input
                          type="password"
                          placeholder="Nueva contraseña (opcional)"
                          value={editUserForm.password}
                          onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <select
                          value={editUserForm.facultad}
                          onChange={(e) => setEditUserForm({ ...editUserForm, facultad: e.target.value })}
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
                        {editingUser.rol === "estudiante" && (
                          <input
                            type="text"
                            placeholder="Carrera"
                            value={editUserForm.carrera}
                            onChange={(e) => setEditUserForm({ ...editUserForm, carrera: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        )}
                        {editingUser.rol === "tutor" && (
                          <input
                            type="text"
                            placeholder="Especialidad"
                            value={editUserForm.especialidad}
                            onChange={(e) => setEditUserForm({ ...editUserForm, especialidad: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                        )}
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                          Actualizar Usuario
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "asignaciones":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Asignación Global de Tutores</h2>

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
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nombres} {student.apellidos} - {student.carrera} ({student.facultad})
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
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.nombres} {tutor.apellidos} - {tutor.especialidad} ({tutor.facultad})
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
          </div>
        )

      case "estadisticas":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Sistema</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tutores</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTutors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Coordinadores</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalCoordinators}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tutorías</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{stats.totalTutorias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completadas:</span>
                    <span className="font-semibold text-green-600">{stats.completedTutorias}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contenido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temas:</span>
                    <span className="font-semibold">{stats.totalThemes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Archivos:</span>
                    <span className="font-semibold">{stats.totalFiles}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad por Facultad</h3>
                <div className="space-y-2">
                  {Object.entries(stats.facultiesActivity).map(([facultad, count]) => (
                    <div key={facultad} className="flex justify-between">
                      <span className="text-gray-600 text-sm">{facultad}:</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "configuracion":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reiniciar Sistema</h3>
                  <p className="text-gray-600 mb-4">
                    Esta acción eliminará todos los datos del sistema incluyendo usuarios, tutorías, temas, archivos y
                    notificaciones. Esta acción no se puede deshacer.
                  </p>
                  <button
                    onClick={handleResetSystem}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Reiniciar Sistema
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Versión:</span>
                  <span className="ml-2 font-semibold">1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="ml-2 font-semibold">2024</span>
                </div>
                <div>
                  <span className="text-gray-600">Administrador:</span>
                  <span className="ml-2 font-semibold">
                    {user?.nombres} {user?.apellidos}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-semibold">{user?.email}</span>
                </div>
              </div>
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
        activeSection === "usuarios"
          ? "Gestión de Usuarios"
          : activeSection === "asignaciones"
            ? "Asignaciones"
            : activeSection === "estadisticas"
              ? "Estadísticas"
              : "Configuración"
      }
    >
      {renderContent()}
    </DashboardLayout>
  )
}
