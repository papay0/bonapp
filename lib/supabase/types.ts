/**
 * Database types for Supabase
 * This file defines the TypeScript types for all database tables
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // Clerk user ID (TEXT)
          created_at: string;
          last_connected_at: string;
        };
        Insert: {
          id: string; // Clerk user ID (TEXT)
          created_at?: string;
          last_connected_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          last_connected_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          links: Json;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          links?: Json;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          links?: Json;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          day_index: number;
          meal_type: 'lunch' | 'dinner' | 'breakfast';
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          day_index: number;
          meal_type: 'lunch' | 'dinner' | 'breakfast';
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          day_index?: number;
          meal_type?: 'lunch' | 'dinner' | 'breakfast';
          recipe_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type MealPlan = Database['public']['Tables']['meal_plans']['Row'];

export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertRecipe = Database['public']['Tables']['recipes']['Insert'];
export type InsertMealPlan = Database['public']['Tables']['meal_plans']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateRecipe = Database['public']['Tables']['recipes']['Update'];
export type UpdateMealPlan = Database['public']['Tables']['meal_plans']['Update'];

// Additional helper types
export type MealType = 'lunch' | 'dinner' | 'breakfast';

export interface RecipeLink {
  url: string;
  title?: string;
}
