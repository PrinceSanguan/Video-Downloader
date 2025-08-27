import { usePage } from "@inertiajs/react"
import { useEffect, useState, useRef, useCallback, createContext, useContext } from "react"
import { AnimatePresence, motion, TargetAndTransition, VariantLabels } from "framer-motion"
import { CheckCircle, X, AlertCircle, Info, Bell } from "lucide-react"
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

// You can extend this interface to include other flash message types
interface PageProps extends Record<string, unknown> {
  flash?: {
    success?: string
    error?: string
    warning?: string
    info?: string
    [key: string]: unknown
  }
}

export type ToastType = "success" | "error" | "warning" | "info"
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: "default" | "outline" | "link"
}

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  actions?: ToastAction[]
  onDismiss?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (
    message: string,
    type: ToastType,
    options?: {
      duration?: number
      actions?: ToastAction[]
      onDismiss?: () => void
    },
  ) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  position: ToastPosition
  setPosition: (position: ToastPosition) => void
  playSound: boolean
  setPlaySound: (play: boolean) => void
  maxToasts: number
  setMaxToasts: (max: number) => void
}

// Animation variants interface
interface AnimationVariants {
  initial: TargetAndTransition | VariantLabels
  animate: TargetAndTransition | VariantLabels
  exit: TargetAndTransition | VariantLabels
}

// Create context for global access
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Default durations for each toast type
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  info: 5000,
  warning: 5000,
  error: 7000,
}

// Sound effects for toasts
const TOAST_SOUNDS: Record<ToastType, string> = {
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  warning: "/sounds/warning.mp3",
  info: "/sounds/info.mp3",
}

const ToastProvider = ToastPrimitives.Provider

export function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [position, setPosition] = useState<ToastPosition>("top-right")
  const [playSound, setPlaySound] = useState<boolean>(false)
  const [maxToasts, setMaxToasts] = useState<number>(5)

  // Use a map with an initial value to store processed messages
  const [processedMessages] = useState<Set<string>>(new Set())

  // Create a ref to store page props
  const pagePropsRef = useRef<PageProps["flash"] | undefined>(undefined)

  let pageProps: PageProps["flash"] | undefined
  try {
    const inertiaPage = usePage<PageProps>()
    pageProps = inertiaPage.props.flash
    pagePropsRef.current = pageProps
  } catch {
    // Silence the error
  }

  // Audio elements for sound effects
  const audioRefs = useRef<Record<ToastType, HTMLAudioElement | null>>({
    success: null,
    error: null,
    warning: null,
    info: null,
  })

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentAudioRefs: Record<ToastType, HTMLAudioElement | null> = {
        success: null,
        error: null,
        warning: null,
        info: null,
      }

      Object.keys(TOAST_SOUNDS).forEach((type) => {
        const audioElement = new Audio(TOAST_SOUNDS[type as ToastType])
        audioElement.preload = "auto"
        currentAudioRefs[type as ToastType] = audioElement
      })

      audioRefs.current = currentAudioRefs

      // Use the local variable in cleanup function
      return () => {
        Object.values(currentAudioRefs).forEach((audio) => {
          if (audio) {
            audio.pause()
            audio.src = ""
          }
        })
      }
    }
  }, [])

  // Play sound effect
  const playToastSound = useCallback(
    (type: ToastType) => {
      if (playSound && audioRefs.current[type]) {
        audioRefs.current[type]?.play().catch(() => {
          // Ignore errors - user might not have interacted with the page yet
        })
      }
    },
    [playSound],
  )

  // Add toast function
  const addToast = useCallback(
    (
      message: string,
      type: ToastType,
      options?: {
        duration?: number
        actions?: ToastAction[]
        onDismiss?: () => void
      },
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const duration = options?.duration ?? DEFAULT_DURATIONS[type]

      // Create a unique key for the message + type combination
      const messageKey = `${type}:${message}`

      // Skip if this exact message was already processed
      if (processedMessages.has(messageKey)) {
        return ""
      }

      // Mark message as processed
      processedMessages.add(messageKey)

      // Play sound effect
      playToastSound(type)

      setToasts((prev) => {
        // Limit the number of toasts
        const updatedToasts = [
          ...prev,
          { id, message, type, duration, actions: options?.actions, onDismiss: options?.onDismiss },
        ]
        return updatedToasts.slice(-maxToasts)
      })

      return id
    },
    [maxToasts, playToastSound, processedMessages],
  )

  // Remove toast function
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id)
      if (toast?.onDismiss) {
        toast.onDismiss()
      }
      return prev.filter((toast) => toast.id !== id)
    })
  }, [])

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Handle flash messages
  const handleFlashMessages = useCallback((flash: PageProps["flash"] | undefined) => {
    if (!flash) return

    // Helper function to process a specific flash type
    const processFlash = (message: string | undefined, type: ToastType) => {
      if (!message) return

      // Add the toast - duplicates are already handled in addToast
      addToast(message, type)
    }

    processFlash(flash.success as string, "success")
    processFlash(flash.error as string, "error")
    processFlash(flash.warning as string, "warning")
    processFlash(flash.info as string, "info")
  }, [addToast])

  // Check for flash messages from Inertia
  useEffect(() => {
    // Use the value from props directly, not the ref
    handleFlashMessages(pageProps)
  }, [pageProps, handleFlashMessages])

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    position,
    setPosition,
    playSound,
    setPlaySound,
    maxToasts,
    setMaxToasts,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Progress bar component
function ToastProgressBar({
  duration,
  paused,
}: {
  duration: number
  paused: boolean
}) {
  return (
    <div className="h-1 w-full bg-black/10 dark:bg-white/10 mt-1 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-current opacity-30"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{
          duration: duration / 1000,
          ease: "linear",
          paused,
        }}
      />
    </div>
  )
}

// Toast container component
function ToastContainer() {
  const { toasts, removeToast, position } = useToast()

  // Get position styles
  const getPositionStyles = (): string => {
    switch (position) {
      case "top-left":
        return "top-4 left-4 items-start"
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2 items-center"
      case "top-right":
        return "top-4 right-4 items-end"
      case "bottom-left":
        return "bottom-4 left-4 items-start"
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2 items-center"
      case "bottom-right":
        return "bottom-4 right-4 items-end"
      default:
        return "top-4 right-4 items-end"
    }
  }

  // Get animation variants based on position
  const getAnimationVariants = (): AnimationVariants => {
    if (position.includes("top")) {
      return {
        initial: { opacity: 0, y: -20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.9 },
      }
    } else {
      return {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.9 },
      }
    }
  }

  return (
    <div
      className={`fixed z-[9999] flex flex-col gap-2 max-w-md ${getPositionStyles()}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
            animationVariants={getAnimationVariants()}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual toast item
function ToastItem({
  toast,
  onDismiss,
  animationVariants,
}: {
  toast: Toast
  onDismiss: () => void
  animationVariants: AnimationVariants
}) {
  const [isPaused, setIsPaused] = useState(false)
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set up auto-dismiss
  useEffect(() => {
    if (!isPaused && toast.duration !== Number.POSITIVE_INFINITY) {
      dismissTimeoutRef.current = setTimeout(() => {
        onDismiss()
      }, toast.duration)
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current)
      }
    }
  }, [toast.duration, isPaused, onDismiss])

  // Helper function to get the appropriate styles based on toast type
  const getToastStyles = (type: ToastType): string => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/70 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
      case "error":
        return "bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100"
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
      case "info":
        return "bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
    }
  }

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={animationVariants.initial}
      animate={animationVariants.animate}
      exit={animationVariants.exit}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`flex flex-col rounded-lg shadow-lg backdrop-blur-md border ${getToastStyles(toast.type)}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0">
          {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          {toast.type === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
        </div>
        <div className="flex-1 pr-3">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close notification"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Actions */}
      {toast.actions && toast.actions.length > 0 && (
        <div className="px-4 pb-3 flex gap-2 justify-end">
          {toast.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick()
                onDismiss()
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                action.variant === "outline"
                  ? "border border-current hover:bg-black/5 dark:hover:bg-white/10"
                  : action.variant === "link"
                    ? "underline hover:no-underline"
                    : "bg-current text-white hover:opacity-90"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {toast.duration !== Number.POSITIVE_INFINITY && (
        <ToastProgressBar duration={toast.duration || 5000} paused={isPaused} />
      )}
    </motion.div>
  )
}

// Toast settings button component
export function ToastSettingsButton() {
  const { position, setPosition, playSound, setPlaySound, maxToasts, setMaxToasts } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toast settings"
      >
        <Bell className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <h3 className="font-medium mb-3">Notification Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as ToastPosition)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1 text-sm"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Play Sound</label>
              <button
                onClick={() => setPlaySound(!playSound)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  playSound ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    playSound ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm mb-1">Max Notifications</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxToasts}
                onChange={(e) => setMaxToasts(Math.max(1, Math.min(10, Number.parseInt(e.target.value))))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export only what's needed
export { ToastProvider }
