/**
 * Database types generated from Supabase schema
 *
 * To regenerate these types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref your-project-ref
 * 4. Generate types: supabase gen types typescript --linked > src/lib/types/database.ts
 *
 * For now, this is a placeholder. We'll generate real types after creating the database schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlist'
export type VisitSlotStatus = 'open' | 'closed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          address: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          address?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          address?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visit_slots: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          max_participants: number
          current_participants: number
          location: string | null
          status: VisitSlotStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          max_participants: number
          current_participants?: number
          location?: string | null
          status?: VisitSlotStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          max_participants?: number
          current_participants?: number
          location?: string | null
          status?: VisitSlotStatus
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          visit_slot_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          school: string
          grade_level: string
          motivation_message: string
          cv_url: string | null
          status: ApplicationStatus
          exported_to_airtable: boolean
          airtable_record_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visit_slot_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          school: string
          grade_level: string
          motivation_message: string
          cv_url?: string | null
          status?: ApplicationStatus
          exported_to_airtable?: boolean
          airtable_record_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visit_slot_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          school?: string
          grade_level?: string
          motivation_message?: string
          cv_url?: string | null
          status?: ApplicationStatus
          exported_to_airtable?: boolean
          airtable_record_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      status_change_history: {
        Row: {
          id: string
          application_id: string
          old_status: ApplicationStatus | null
          new_status: ApplicationStatus
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          application_id: string
          old_status?: ApplicationStatus | null
          new_status: ApplicationStatus
          changed_by?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          old_status?: ApplicationStatus | null
          new_status?: ApplicationStatus
          changed_by?: string | null
          changed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: ApplicationStatus
      visit_slot_status: VisitSlotStatus
    }
  }
}
