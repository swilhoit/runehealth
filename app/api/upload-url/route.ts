import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface LogContext {
  requestId: string
  timestamp: string
  operation: string
  details?: any
  error?: any
}

function createLogger(requestId: string) {
  return {
    info: (operation: string, details?: any) => {
      const context: LogContext = {
        requestId,
        timestamp: new Date().toISOString(),
        operation,
        details,
      }
      console.log(`[Upload URL API] [INFO] ${JSON.stringify(context, null, 2)}`)
    },
    error: (operation: string, error: any, details?: any) => {
      const context: LogContext = {
        requestId,
        timestamp: new Date().toISOString(),
        operation,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          cause: error.cause,
        },
        details,
      }
      console.error(`[Upload URL API] [ERROR] ${JSON.stringify(context, null, 2)}`)
    },
    debug: (operation: string, details?: any) => {
      const context: LogContext = {
        requestId,
        timestamp: new Date().toISOString(),
        operation,
        details,
      }
      console.debug(`[Upload URL API] [DEBUG] ${JSON.stringify(context, null, 2)}`)
    },
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const logger = createLogger(requestId)
  const startTime = Date.now()

  logger.info("Request received", {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
  })

  try {
    // Initialize Supabase client
    logger.debug("Initializing Supabase client")
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    logger.debug("Verifying authentication")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      logger.error("Authentication failed", authError)
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: authError.message,
          requestId,
        },
        { status: 401 },
      )
    }

    if (!user) {
      logger.error("No user found", null, { userId: null })
      return NextResponse.json(
        {
          error: "No user found",
          requestId,
        },
        { status: 401 },
      )
    }

    logger.info("User authenticated", { userId: user.id })

    // Get and validate file info
    const body = await request.json()
    logger.debug("Request body received", { body })

    if (!body.filename) {
      logger.error("Missing filename", null, { body })
      return NextResponse.json(
        {
          error: "Filename is required",
          requestId,
        },
        { status: 400 },
      )
    }

    // Create sanitized filename with user prefix
    const sanitizedName = body.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `temp/${user.id}/${Date.now()}-${sanitizedName}`

    logger.info("Generated file path", { filePath })

    // Check if bucket exists
    logger.debug("Checking bucket existence")
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket("labs")

    if (bucketError) {
      logger.debug("Bucket not found, attempting to create", { error: bucketError })

      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("labs", {
        public: false,
        allowedMimeTypes: ["application/pdf"],
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        logger.error("Failed to create bucket", createError)
        throw createError
      }

      logger.info("Bucket created successfully")
    }

    // Generate signed URL
    logger.debug("Generating signed URL", { filePath })
    const { data, error } = await supabase.storage.from("labs").createSignedUploadUrl(filePath)

    if (error) {
      logger.error("Failed to generate signed URL", error)
      throw error
    }

    if (!data || !data.signedUrl) {
      logger.error("No signed URL in response", null, { data })
      throw new Error("Failed to generate signed URL: No URL returned")
    }

    const response = {
      uploadUrl: data.signedUrl,
      filePath: data.path,
      requestId,
    }

    logger.info("Successfully generated signed URL", {
      path: data.path,
      requestId,
      duration: Date.now() - startTime,
    })

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Unhandled error in upload URL generation", error)

    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

