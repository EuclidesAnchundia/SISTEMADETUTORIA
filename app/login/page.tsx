"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { useSystem } from "../contexts/SystemContext"
import { Mail, Lock, LogIn, GraduationCap } from "lucide-react"
import { useToast } from "../components/ui/toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const { validateEmailDomain, getUserByEmail } = useSystem()
  const router = useRouter()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      addToast({
        type: "error",
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos.",
      })
      setLoading(false)
      return
    }

    const validDomains = ["@uleam.edu.ec", "@live.uleam.edu.ec", "@coordtit.uleam.edu.ec", "@admin.uleam.edu.ec"]
    const isValidDomain = validDomains.some((domain) => email.endsWith(domain))

    if (!isValidDomain) {
      addToast({
        type: "error",
        title: "Correo inválido",
        description: "Debes ingresar un correo institucional válido de la ULEAM.",
      })
      setLoading(false)
      return
    }

    const success = await login(email, password)

    if (success) {
      addToast({
        type: "success",
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      })
      router.push("/dashboard")
    } else {
      // Verificar si el usuario existe pero la contraseña es incorrecta
      const userExists = getUserByEmail(email)
      if (userExists) {
        addToast({
          type: "error",
          title: "Contraseña incorrecta",
          description: "La contraseña ingresada no es correcta.",
        })
      } else {
        addToast({
          type: "error",
          title: "Usuario no encontrado",
          description: "No existe un usuario registrado con este correo electrónico.",
        })
      }
    }

    setLoading(false)
  }

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
            <LogIn className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta institucional</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Correo Institucional
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/recover" className="text-red-600 hover:text-red-700 text-sm">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-red-600 hover:text-red-700 font-medium">
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
