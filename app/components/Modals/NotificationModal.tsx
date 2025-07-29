"use client";

import { useState, useEffect, useRef } from "react";
import { useSystem } from "../../contexts/SystemContext";
import { useAuth } from "../../contexts/AuthContext";
import { X, Bell, Check, CheckCheck } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const { user } = useAuth();
  const { getNotifications, markAsRead, markAllAsRead } = useSystem();
  const [notifications, setNotifications] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      const userNotifications = getNotifications(user.email);
      setNotifications(
        userNotifications.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        ),
      );
    }
  }, [isOpen, user, getNotifications]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Hace unos minutos";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "NUEVA_SOLICITUD":
        return "📝";
      case "TUTORIA_ACEPTADA":
        return "✅";
      case "TUTORIA_RECHAZADA":
        return "❌";
      case "TUTORIA_COMPLETADA":
        return "🎉";
      case "TUTOR_ASIGNADO":
        return "👨‍🏫";
      case "ARCHIVO_SUBIDO":
        return "📎";
      default:
        return "🔔";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h2>
            {notifications.filter((n) => !n.leida).length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {notifications.filter((n) => !n.leida).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.filter((n) => !n.leida).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
              >
                <CheckCheck size={16} />
                Leer todo
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.leida
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!notification.leida ? "font-medium text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.fecha)}
                      </p>
                    </div>
                    {!notification.leida && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                        title="Marcar como leída"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
