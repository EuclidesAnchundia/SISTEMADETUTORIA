"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSystem } from "../contexts/SystemContext"
import { UserPlus, GraduationCap } from "lucide-react"
import { useToast } from "../components/ui/toast"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    facultad: "",
    carrera: "",
    especialidad: "",
    preguntaSeguridad: "mascota",
    respuestaSeguridad: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { saveUser, validateEmailDomain, getUserByEmail, generateId } = useSystem()
  const router = useRouter()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validaciones con toasts
    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: "error",
        title: "Error de contraseña",
        description: "Las contraseñas no coinciden.",
      })
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      addToast({
        type: "warning",
        title: "Contraseña débil",
        description: "La contraseña debe tener al menos 8 caracteres.",
      })
      setLoading(false)
      return
    }

    const rol = validateEmailDomain(formData.email)
    if (!rol) {
      addToast({
        type: "error",
        title: "Correo inválido",
        description: "Debes usar un correo institucional válido de la ULEAM.",
      })
      setLoading(false)
      return
    }

    if (getUserByEmail(formData.email)) {
      addToast({
        type: "error",
        title: "Usuario existente",
        description: "Ya existe un usuario con este correo electrónico.",
      })
      setLoading(false)
      return
    }

    // Crear usuario
    const userData = {
      id: generateId(),
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      email: formData.email,
      password: formData.password,
      rol: rol as "estudiante" | "tutor" | "coordinador" | "administrador",
      facultad: rol === "administrador" ? "Sistema" : formData.facultad,
      carrera: rol === "estudiante" ? formData.carrera : undefined,
      especialidad: rol === "tutor" ? formData.especialidad : undefined,
      preguntaSeguridad: formData.preguntaSeguridad,
      respuestaSeguridad: formData.respuestaSeguridad,
      fechaRegistro: new Date().toISOString(),
    }

    saveUser(userData)

    addToast({
      type: "success",
      title: "¡Registro exitoso!",
      description: "Usuario registrado correctamente. Ahora puedes iniciar sesión.",
    })

    router.push("/login")
    setLoading(false)
  }

  const detectedRole = validateEmailDomain(formData.email)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <GraduationCap size={48} />
            <div>
              <h1 className="text-3xl font-bold">ULEAM</h1>
              <p className="text-red-100">Sistema de Tutorías de Titulación</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900">Registro</h2>
            <p className="text-gray-600">Crea tu cuenta institucional</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombres"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <input
              type="email"
              placeholder="Correo institucional"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />

            {detectedRole && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Rol detectado: <strong className="capitalize">{detectedRole}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Solo mostrar facultad si NO es administrador */}
            {detectedRole && detectedRole !== "administrador" && (
              <select
                value={formData.facultad}
                onChange={(e) => setFormData({ ...formData, facultad: e.target.value })}
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
            )}

            {detectedRole === "estudiante" && (
              <input
                type="text"
                placeholder="Carrera"
                value={formData.carrera}
                onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            )}

            {detectedRole === "tutor" && (
              <input
                type="text"
                placeholder="Especialidad"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            )}

            <select
              value={formData.preguntaSeguridad}
              onChange={(e) => setFormData({ ...formData, preguntaSeguridad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="mascota">¿Cuál es el nombre de tu primera mascota?</option>
              <option value="ciudad">¿En qué ciudad naciste?</option>
              <option value="escuela">¿Cuál es el nombre de tu escuela primaria?</option>
            </select>

            <input
              type="text"
              placeholder="Respuesta de seguridad"
              value={formData.respuestaSeguridad}
              onChange={(e) => setFormData({ ...formData, respuestaSeguridad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
