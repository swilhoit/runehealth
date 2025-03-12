import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Create a server Supabase client
// Note: Server clients don't support passing options in the same way as client component clients
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({
    cookies
  })

