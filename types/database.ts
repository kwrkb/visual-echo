/**
 * Database Types
 * Supabaseデータベーススキーマに対応する型定義
 *
 * この型定義により、Supabaseクライアントでの完全な型安全性が得られます
 */

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
      generations: {
        Row: {
          id: string;
          parent_id: string | null;
          image_url: string;
          prompt: string;
          created_at: string;
          status: Database["public"]["Enums"]["generation_status"];
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          image_url: string;
          prompt: string;
          created_at?: string;
          status?: Database["public"]["Enums"]["generation_status"];
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          image_url?: string;
          prompt?: string;
          created_at?: string;
          status?: Database["public"]["Enums"]["generation_status"];
        };
        Relationships: [
          {
            foreignKeyName: "generations_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      generation_status: "pending" | "completed" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 便利な型エイリアス
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationInsert = Database["public"]["Tables"]["generations"]["Insert"];
export type GenerationUpdate = Database["public"]["Tables"]["generations"]["Update"];
export type GenerationStatus = Database["public"]["Enums"]["generation_status"];
