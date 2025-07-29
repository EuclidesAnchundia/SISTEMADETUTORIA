"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        window.dispatchEvent(new CustomEvent(`localStorage-${key}`, { detail: valueToStore }))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      setStoredValue(e.detail)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(`localStorage-${key}` as any, handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(`localStorage-${key}` as any, handleCustomEvent)
    }
  }, [key])

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const item = window.localStorage.getItem(key)
      if (item && item !== "undefined") {
        const parsedItem = JSON.parse(item)
        if (JSON.stringify(parsedItem) !== JSON.stringify(storedValue)) {
          setStoredValue(parsedItem)
        }
      }
    } catch (error) {
      console.error(`Error syncing localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue] as const
}
