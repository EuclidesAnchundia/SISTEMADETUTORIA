"use client"

import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import StudentDashboard from "../components/dashboards/StudentDashboard"
import TutorDashboard from "../components/dashboards/TutorDashboard"
import CoordinatorDashboard from "../components/dashboards/CoordinatorDashboard"
import AdminDashboard from "../components/dashboards/AdminDashboard"
import LoadingSpinner from "../components/LoadingSpinner"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoadingSpinner />
  }

  switch (user.rol) {
    case "estudiante":
      return <StudentDashboard />
    case "tutor":
      return <TutorDashboard />
    case "coordinador":
      return <CoordinatorDashboard />
    case "administrador":
      return <AdminDashboard />
    default:
      return <div>Rol no reconocido</div>
  }
}
