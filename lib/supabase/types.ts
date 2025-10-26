export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          updated_at: string
          user_id: string
          week_start_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          name: string
          updated_at?: string
          user_id: string
          week_start_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          updated_at?: string
          user_id?: string
          week_start_date?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          color: string | null
          created_at: string
          day_index: number
          event_id: string | null
          id: string
          meal_type: string
          recipe_id: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          day_index: number
          event_id?: string | null
          id?: string
          meal_type: string
          recipe_id?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          color?: string | null
          created_at?: string
          day_index?: number
          event_id?: string | null
          id?: string
          meal_type?: string
          recipe_id?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          description: string
          id: string
          links: Json | null
          servings: number
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          links?: Json | null
          servings?: number
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          links?: Json | null
          servings?: number
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          breakfast_enabled: boolean
          created_at: string
          id: string
          multi_week_view: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          breakfast_enabled?: boolean
          created_at?: string
          id?: string
          multi_week_view?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          breakfast_enabled?: boolean
          created_at?: string
          id?: string
          multi_week_view?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          last_connected_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          last_connected_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_connected_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type MealPlan = Database['public']['Tables']['meal_plans']['Row'];
export type GroceryList = Database['public']['Tables']['grocery_lists']['Row'];

export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertRecipe = Database['public']['Tables']['recipes']['Insert'];
export type InsertEvent = Database['public']['Tables']['events']['Insert'];
export type InsertMealPlan = Database['public']['Tables']['meal_plans']['Insert'];
export type InsertGroceryList = Database['public']['Tables']['grocery_lists']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateRecipe = Database['public']['Tables']['recipes']['Update'];
export type UpdateEvent = Database['public']['Tables']['events']['Update'];
export type UpdateMealPlan = Database['public']['Tables']['meal_plans']['Update'];
export type UpdateGroceryList = Database['public']['Tables']['grocery_lists']['Update'];

// Additional helper types
export type MealType = 'lunch' | 'dinner' | 'breakfast';

export interface RecipeLink {
  url: string;
  title?: string;
}

export interface GroceryListItem {
  text: string;
  checked: boolean;
}

export interface GroceryListCategory {
  name: string;
  items: GroceryListItem[];
}
