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
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string
          email: string
          avatar_url?: string
          first_name?: string
          last_name?: string
          updated_at?: string
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string
          email?: string
          avatar_url?: string
          first_name?: string
          last_name?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          email?: string
          avatar_url?: string
          first_name?: string
          last_name?: string
          updated_at?: string
        }
      }
    }
  }
}

