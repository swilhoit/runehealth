export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      lab_reports: {
        Row: {
          id: string
          user_id: string
          status: "pending" | "processing" | "completed" | "error"
          report_date: string
          error_message?: string | null
          raw_data?: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: "pending" | "processing" | "completed" | "error"
          report_date: string
          error_message?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "pending" | "processing" | "completed" | "error"
          report_date?: string
          error_message?: string | null
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      biomarker_results: {
        Row: {
          id: string
          report_id: string
          biomarker_id: string
          value: number
          unit: string
          status: "normal" | "low" | "high"
          reference_range_min: number
          reference_range_max: number
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          biomarker_id: string
          value: number
          unit: string
          status: "normal" | "low" | "high"
          reference_range_min: number
          reference_range_max: number
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          biomarker_id?: string
          value?: number
          unit?: string
          status?: "normal" | "low" | "high"
          reference_range_min?: number
          reference_range_max?: number
          created_at?: string
        }
      }
    }
  }
}

