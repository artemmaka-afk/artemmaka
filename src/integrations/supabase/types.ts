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
      ai_tools: {
        Row: {
          category: string
          created_at: string
          id: string
          logo: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          logo: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          logo?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      calculator_config: {
        Row: {
          base_frame_price: number
          created_at: string
          deadline_10_multiplier: number
          deadline_20_multiplier: number
          hide_pricing: boolean
          id: string
          lipsync_price_per_30s: number
          music_price: number
          nda_full_multiplier: number | null
          nda_partial_multiplier: number | null
          revisions_4_price: number
          revisions_8_price: number
          scenario_price_per_min: number
          updated_at: string
          volume_discount_percent: number
        }
        Insert: {
          base_frame_price?: number
          created_at?: string
          deadline_10_multiplier?: number
          deadline_20_multiplier?: number
          hide_pricing?: boolean
          id?: string
          lipsync_price_per_30s?: number
          music_price?: number
          nda_full_multiplier?: number | null
          nda_partial_multiplier?: number | null
          revisions_4_price?: number
          revisions_8_price?: number
          scenario_price_per_min?: number
          updated_at?: string
          volume_discount_percent?: number
        }
        Update: {
          base_frame_price?: number
          created_at?: string
          deadline_10_multiplier?: number
          deadline_20_multiplier?: number
          hide_pricing?: boolean
          id?: string
          lipsync_price_per_30s?: number
          music_price?: number
          nda_full_multiplier?: number | null
          nda_partial_multiplier?: number | null
          revisions_4_price?: number
          revisions_8_price?: number
          scenario_price_per_min?: number
          updated_at?: string
          volume_discount_percent?: number
        }
        Relationships: []
      }
      hero_stats: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean | null
          label: string
          sort_order: number | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          attachments: string[] | null
          audio_options: string[] | null
          budget_estimate: number | null
          created_at: string
          deadline: string | null
          duration_seconds: number | null
          email: string | null
          id: string
          name: string
          pace: string | null
          phone: string | null
          project_description: string
          revisions: string | null
          status: string
          telegram: string | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          audio_options?: string[] | null
          budget_estimate?: number | null
          created_at?: string
          deadline?: string | null
          duration_seconds?: number | null
          email?: string | null
          id?: string
          name: string
          pace?: string | null
          phone?: string | null
          project_description: string
          revisions?: string | null
          status?: string
          telegram?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          audio_options?: string[] | null
          budget_estimate?: number | null
          created_at?: string
          deadline?: string | null
          duration_seconds?: number | null
          email?: string | null
          id?: string
          name?: string
          pace?: string | null
          phone?: string | null
          project_description?: string
          revisions?: string | null
          status?: string
          telegram?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          ai_tools: string[] | null
          content_blocks: Json | null
          created_at: string
          duration: string | null
          id: string
          is_published: boolean | null
          slug: string
          sort_order: number | null
          subtitle: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
          video_preview: string | null
          year: string | null
        }
        Insert: {
          ai_tools?: string[] | null
          content_blocks?: Json | null
          created_at?: string
          duration?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          video_preview?: string | null
          year?: string | null
        }
        Update: {
          ai_tools?: string[] | null
          content_blocks?: Json | null
          created_at?: string
          duration?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          video_preview?: string | null
          year?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          description: string | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_visible: boolean | null
          location: string
          name: string
          sort_order: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          is_visible?: boolean | null
          location?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_visible?: boolean | null
          location?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      typography_settings: {
        Row: {
          created_at: string
          description: string | null
          desktop_size: string
          id: string
          mobile_size: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          desktop_size?: string
          id: string
          mobile_size?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          desktop_size?: string
          id?: string
          mobile_size?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
