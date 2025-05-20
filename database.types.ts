export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          start_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          start_date: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          start_date?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
        }
        Insert: {
          item_id: string
          tag_id: string
        }
        Update: {
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category_id: string | null
          created_at: string | null
          deposit: number | null
          description: string | null
          fts: unknown | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price_per_day: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          fts?: unknown | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price_per_day: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          fts?: unknown | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price_per_day?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          tag: string
        }
        Insert: {
          id?: string
          tag: string
        }
        Update: {
          id?: string
          tag?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      available_items: {
        Args: { start_date: string; end_date: string; search_query?: string }
        Returns: {
          id: string
          name: string
          description: string
          image_url: string
          price_per_day: number
          deposit: number
        }[]
      }
      create_booking_if_available: {
        Args: {
          p_user_id: string
          p_item_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          start_date: string
          status: string | null
          user_id: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
