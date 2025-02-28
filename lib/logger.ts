// Edge-compatible logger (no Node.js specific features)
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  requestId: string
  timestamp: string
  userId?: string
  route?: string
  duration?: number
  input?: any
  error?: any
  metadata?: Record<string, any>
}

interface ErrorDetails {
  name?: string
  message: string
  stack?: string
  code?: string
  cause?: any
  metadata?: Record<string, any>
}

export class Logger {
  readonly requestId: string
  private startTime: number
  private route: string
  private userId?: string

  constructor(route: string, requestId = crypto.randomUUID()) {
    this.requestId = requestId
    this.startTime = Date.now()
    this.route = route
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private formatError(error: any): ErrorDetails {
    // Handle Supabase PostgrestError
    if (typeof error === "object" && error !== null && "code" in error && "message" in error && "details" in error) {
      return {
        type: "PostgrestError",
        code: error.code,
        message: error.message,
        details: error.details,
        hint: (error as any).hint,
      }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return {
        type: "Error",
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      }
    }

    // Handle objects
    if (typeof error === "object" && error !== null) {
      try {
        // Create a safe copy of the error object without circular references
        const safeError = JSON.parse(
          JSON.stringify(error, (key, value) => {
            if (key === "toJSON" || key === "toString") return undefined
            return value
          }),
        )

        return {
          type: "Object",
          ...safeError,
        }
      } catch (e) {
        // If JSON stringification fails, return a basic error object
        return {
          type: "UnserializableObject",
          message: String(error),
          error: "Object could not be serialized",
        }
      }
    }

    // Handle primitive values
    return {
      type: "Unknown",
      message: String(error),
      value: error,
    }
  }

  private createLogEntry(level: LogLevel, message: string, details?: any, error?: any): LogContext {
    const duration = Date.now() - this.startTime

    const logEntry: LogContext = {
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      route: this.route,
      duration,
    }

    if (details) {
      try {
        // Safely stringify details
        logEntry.metadata = JSON.parse(
          JSON.stringify(details, (key, value) => {
            if (key === "toJSON" || key === "toString") return undefined
            return value
          }),
        )
      } catch (e) {
        logEntry.metadata = { error: "Details could not be serialized", summary: String(details) }
      }
    }

    if (error) {
      logEntry.error = this.formatError(error)
    }

    return logEntry
  }

  private log(level: LogLevel, message: string, details?: any, error?: any) {
    const entry = this.createLogEntry(level, message, details, error)
    const formattedMessage = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.route}] [${this.requestId}] ${message}`

    // Use console methods that work in both Edge and Node environments
    switch (level) {
      case "debug":
        console.debug(formattedMessage, entry)
        break
      case "info":
        console.log(formattedMessage, entry)
        break
      case "warn":
        console.warn(formattedMessage, entry)
        break
      case "error":
        console.error(formattedMessage, entry)
        break
    }
  }

  debug(message: string, details?: any) {
    this.log("debug", message, details)
  }

  info(message: string, details?: any) {
    this.log("info", message, details)
  }

  warn(message: string, details?: any) {
    this.log("warn", message, details)
  }

  error(message: string, error: any, details?: any) {
    this.log("error", message, details, error)
  }

  startOperation(operation: string) {
    const operationStart = Date.now()
    this.debug(`Starting operation: ${operation}`)

    return {
      end: (details?: any) => {
        const duration = Date.now() - operationStart
        this.info(`Completed operation: ${operation}`, {
          ...details,
          duration,
          operation,
        })
        return duration
      },
      fail: (error: any) => {
        const duration = Date.now() - operationStart
        this.error(`Failed operation: ${operation}`, error, {
          duration,
          operation,
        })
        return duration
      },
    }
  }
}

