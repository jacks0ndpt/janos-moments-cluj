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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alt_templates: {
        Row: {
          body: string
          category_id: string | null
          created_at: string
          id: string
          key: string
          label: string
          language: string
          updated_at: string
        }
        Insert: {
          body: string
          category_id?: string | null
          created_at?: string
          id?: string
          key: string
          label: string
          language: string
          updated_at?: string
        }
        Update: {
          body?: string
          category_id?: string | null
          created_at?: string
          id?: string
          key?: string
          label?: string
          language?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alt_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_page: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_enabled: boolean
          seo: Json
          singleton: boolean
          slots: Json
          teaser_enabled: boolean
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          seo?: Json
          singleton?: boolean
          slots?: Json
          teaser_enabled?: boolean
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          seo?: Json
          singleton?: boolean
          slots?: Json
          teaser_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          name_en: string
          name_ro: string
          position: number
          slug: string
          status: Database["public"]["Enums"]["gallery_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          name_en: string
          name_ro: string
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["gallery_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          name_en?: string
          name_ro?: string
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["gallery_status"]
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_en: string | null
          alt_ro: string | null
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          is_favorite: boolean
          mime_type: string | null
          orientation: Database["public"]["Enums"]["image_orientation"] | null
          original_filename: string | null
          position: number
          status: Database["public"]["Enums"]["gallery_status"]
          storage_path: string
          story_id: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_en?: string | null
          alt_ro?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean
          mime_type?: string | null
          orientation?: Database["public"]["Enums"]["image_orientation"] | null
          original_filename?: string | null
          position?: number
          status?: Database["public"]["Enums"]["gallery_status"]
          storage_path: string
          story_id: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_en?: string | null
          alt_ro?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean
          mime_type?: string | null
          orientation?: Database["public"]["Enums"]["image_orientation"] | null
          original_filename?: string | null
          position?: number
          status?: Database["public"]["Enums"]["gallery_status"]
          storage_path?: string
          story_id?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "gallery_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_stories: {
        Row: {
          category_id: string
          cover_image_id: string | null
          created_at: string
          event_date: string | null
          id: string
          is_featured: boolean
          is_system: boolean
          location: string | null
          position: number
          slug: string
          status: Database["public"]["Enums"]["gallery_status"]
          title_en: string
          title_ro: string
          updated_at: string
        }
        Insert: {
          category_id: string
          cover_image_id?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          is_featured?: boolean
          is_system?: boolean
          location?: string | null
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["gallery_status"]
          title_en: string
          title_ro: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          cover_image_id?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          is_featured?: boolean
          is_system?: boolean
          location?: string | null
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["gallery_status"]
          title_en?: string
          title_ro?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_stories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_stories_cover_image_fk"
            columns: ["cover_image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_featured: {
        Row: {
          created_at: string
          id: string
          image_id: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          position?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "homepage_featured_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: true
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      same_day_preview_images: {
        Row: {
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          orientation: Database["public"]["Enums"]["image_orientation"] | null
          original_filename: string | null
          position: number
          preview_id: string
          storage_path: string
          width: number | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          orientation?: Database["public"]["Enums"]["image_orientation"] | null
          original_filename?: string | null
          position?: number
          preview_id: string
          storage_path: string
          width?: number | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          orientation?: Database["public"]["Enums"]["image_orientation"] | null
          original_filename?: string | null
          position?: number
          preview_id?: string
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "same_day_preview_images_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "same_day_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      same_day_previews: {
        Row: {
          couple_names: string
          cover_image_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          message: string | null
          slug: string
          updated_at: string
          wedding_date: string
        }
        Insert: {
          couple_names: string
          cover_image_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          message?: string | null
          slug: string
          updated_at?: string
          wedding_date: string
        }
        Update: {
          couple_names?: string
          cover_image_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          message?: string | null
          slug?: string
          updated_at?: string
          wedding_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "same_day_previews_cover_image_fk"
            columns: ["cover_image_id"]
            isOneToOne: false
            referencedRelation: "same_day_preview_images"
            referencedColumns: ["id"]
          },
        ]
      }
      services_page: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_enabled: boolean
          media: Json
          section_order: Json
          seo: Json
          singleton: boolean
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          media?: Json
          section_order?: Json
          seo?: Json
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          media?: Json
          section_order?: Json
          seo?: Json
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_default_story: { Args: { _category_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_image: {
        Args: { _image_id: string; _new_position: number }
        Returns: undefined
      }
      set_image_positions: {
        Args: { _ids: string[]; _positions: number[] }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      gallery_status: "draft" | "published" | "archived"
      image_orientation: "landscape" | "portrait" | "square"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      gallery_status: ["draft", "published", "archived"],
      image_orientation: ["landscape", "portrait", "square"],
    },
  },
} as const
