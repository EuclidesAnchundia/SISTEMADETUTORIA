"use client"

import { useState, useEffect } from "react"
import { useSystem } from "../contexts/SystemContext"
import { useAuth } from "../contexts/AuthContext"

export function useNotifications() {
  const { user } = useAuth()
  const { getNotifications, markAsRead, markAllAsRead } = useSystem()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const userNotifications = getNotifications(user.email)
      setNotifications(userNotifications)
      setUnreadCount(userNotifications.filter((n) => !n.leida).length)
    }
  }, [user, getNotifications])

  const markNotificationAsRead = (id: string) => {
    markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllNotificationsAsRead = () => {
    if (user) {
      markAllAsRead(user.email)
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))
      setUnreadCount(0)
    }
  }

  return {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}
