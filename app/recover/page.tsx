"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSystem } from "../contexts/SystemContext"
import { KeyRound, GraduationCap } from "lucide-react"

export default function RecoverPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { getUserByEmail, updateUser } = useSystem()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const foundUser = getUserByEmail(email)
    if (!foundUser) {
      setError("No se encontró un usuario con este correo electrónico.")
      return
    }

    setUser(foundUser)
    setStep(2)
  }

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (user.respuestaSeguridad.toLowerCase() !== securityAnswer.toLowerCase()) {
      setError("La respuesta de seguridad es incorrecta.")
      return
    }

    setStep(3)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    const updated = updateUser(user.email, { password: newPassword })
    if (updated) {
      setSuccess("Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.")
      setStep(4)
    } else {
      setError("Error al actualizar la contraseña.")
    }
  }

  const getSecurityQuestion = (pregunta: string) => {
    const questions = {
      mascota: "¿Cuál es el nombre de tu primera mascota?",
      ciudad: "¿En qué ciudad naciste?",
      escuela: "¿Cuál es el nombre de tu escuela primaria?",
    }
    return questions[pregunta as keyof typeof questions] || pregunta
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
            <KeyRound className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
            <p className="text-gray-600">Sigue los pasos para restablecer tu contraseña</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Institucional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Continuar
              </button>
            </form>
          )}

          {step === 2 && user && (
            <form onSubmit={handleSecuritySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pregunta de Seguridad</label>
                <p className="text-gray-900 mb-4">{getSecurityQuestion(user.preguntaSeguridad)}</p>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Tu respuesta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Verificar
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Actualizar Contraseña
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center">
              <Link
                href="/login"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors inline-block"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-red-600 hover:text-red-700 text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
