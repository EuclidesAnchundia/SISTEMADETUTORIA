"use client"

import Link from "next/link"
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  UserIcon as UserGraduate,
  ClapperboardIcon as ChalkboardTeacher,
  UserIcon as UserTie,
  GraduationCap,
} from "lucide-react"

export default function HomePage() {
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bienvenido al Sistema de Tutorías</h2>
            <p className="text-xl text-gray-600 mb-8">
              Plataforma integral para la gestión eficiente de tutorías de titulación
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-white text-red-600 border-2 border-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Características del Sistema</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Users className="mx-auto mb-4 text-red-600" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Gestión de Usuarios</h4>
                <p className="text-gray-600 text-sm">Registro automático por roles según correo institucional</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Calendar className="mx-auto mb-4 text-red-600" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Programación de Tutorías</h4>
                <p className="text-gray-600 text-sm">Sistema completo de solicitud y gestión de tutorías</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <FileText className="mx-auto mb-4 text-red-600" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Gestión de Archivos</h4>
                <p className="text-gray-600 text-sm">Subida y revisión de documentos PDF</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <BarChart3 className="mx-auto mb-4 text-red-600" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Seguimiento de Progreso</h4>
                <p className="text-gray-600 text-sm">Monitoreo completo del avance académico</p>
              </div>
            </div>
          </div>

          {/* Roles Section - Solo 3 roles visibles */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Roles del Sistema</h3>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <UserGraduate className="mx-auto mb-2 text-red-600" size={48} />
                  <h4 className="font-semibold text-gray-900">Estudiante</h4>
                  <p className="text-sm text-red-600 font-medium">@live.uleam.edu.ec</p>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Proponer tema de titulación</li>
                  <li>• Solicitar tutorías</li>
                  <li>• Subir archivos PDF</li>
                  <li>• Ver progreso académico</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <ChalkboardTeacher className="mx-auto mb-2 text-red-600" size={48} />
                  <h4 className="font-semibold text-gray-900">Tutor</h4>
                  <p className="text-sm text-red-600 font-medium">@uleam.edu.ec</p>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gestionar tutorías</li>
                  <li>• Calificar avances</li>
                  <li>• Revisar documentos</li>
                  <li>• Añadir observaciones</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <UserTie className="mx-auto mb-2 text-red-600" size={48} />
                  <h4 className="font-semibold text-gray-900">Coordinador</h4>
                  <p className="text-sm text-red-600 font-medium">@coordtit.uleam.edu.ec</p>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Asignar tutores</li>
                  <li>• Generar reportes</li>
                  <li>• Supervisar avances</li>
                  <li>• Gestionar facultad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Universidad Laica Eloy Alfaro de Manabí</p>
          <p className="text-gray-400">Sistema de Tutorías de Titulación</p>
        </div>
      </footer>
    </div>
  )
}
