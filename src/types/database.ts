export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "admin" | "manager" | "salesperson" | "viewer";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: "admin" | "manager" | "salesperson" | "viewer";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: "admin" | "manager" | "salesperson" | "viewer";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          postcode: string;
          country: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          postcode: string;
          country?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          postcode?: string;
          country?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          reference: string;
          customer_id: string;
          created_by: string;
          status: "draft" | "review_required" | "approved" | "published";
          template_id: string | null;
          expires_at: string | null;
          published_at: string | null;
          published_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          customer_id: string;
          created_by?: string;
          status?: "draft" | "review_required" | "approved" | "published";
          template_id?: string | null;
          expires_at?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          customer_id?: string;
          created_by?: string;
          status?: "draft" | "review_required" | "approved" | "published";
          template_id?: string | null;
          expires_at?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category: "panel" | "inverter" | "battery" | "ev_charger" | "other";
          manufacturer: string;
          model: string;
          description: string | null;
          capacity: number | null;
          unit: string | null;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: "panel" | "inverter" | "battery" | "ev_charger" | "other";
          manufacturer: string;
          model: string;
          description?: string | null;
          capacity?: number | null;
          unit?: string | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: "panel" | "inverter" | "battery" | "ev_charger" | "other";
          manufacturer?: string;
          model?: string;
          description?: string | null;
          capacity?: number | null;
          unit?: string | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
