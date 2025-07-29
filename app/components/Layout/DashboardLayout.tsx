"use client"

import { type ReactNode, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNotifications } from "../../hooks/useNotifications"
import { Bell, Menu, X, LogOut } from "lucide-react"
import NotificationModal from "../Modals/NotificationModal"

interface DashboardLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  title: string
}

export default function DashboardLayout({ children, sidebar, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.rol === "estudiante" ? "E" : user?.rol === "tutor" ? "T" : user?.rol === "coordinador" ? "C" : "A"}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">ULEAM</h2>
              <p className="text-xs text-gray-500 capitalize">Panel {user?.rol}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4">{sidebar}</nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500 rounded-md"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Notifications Modal */}
      <NotificationModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  )
}
