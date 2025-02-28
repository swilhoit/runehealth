import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./types"

// TEMPORARY: Create a mock server Supabase client for local development
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({
    cookies,
  })

