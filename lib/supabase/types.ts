export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      lab_results: {
        Row: {
          id: string
          created_at: string
          user_id: string
          biomarkers: Json
          insights: Json
          recommendations: Json
          pdf_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          biomarkers: Json
          insights: Json
          recommendations: Json
          pdf_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          biomarkers?: Json
          insights?: Json
          recommendations?: Json
          pdf_url?: string
        }
      }
      survey_results: {
        Row: {
          id: string
          created_at: string
          user_id: string
          survey_data: Json
          recommendations: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          survey_data: Json
          recommendations: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          survey_data?: Json
          recommendations?: Json
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          full_name: string
          date_of_birth?: string
          gender?: string
          height?: number
          weight?: number
          medical_conditions?: string[]
          medications?: string[]
          allergies?: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          full_name: string
          date_of_birth?: string
          gender?: string
          height?: number
          weight?: number
          medical_conditions?: string[]
          medications?: string[]
          allergies?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          full_name?: string
          date_of_birth?: string
          gender?: string
          height?: number
          weight?: number
          medical_conditions?: string[]
          medications?: string[]
          allergies?: string[]
        }
      }
    }
  }
}

