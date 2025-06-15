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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
<<<<<<< HEAD
      text_categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "text_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      image_categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "image_categories"
            referencedColumns: ["id"]
          },
        ]
      }
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      cities: {
        Row: {
          country_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          country_id: number
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          country_id?: number
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          artist: string | null
          audio_url: string | null
          created_at: string
          id: string
          lyrics: string | null
          status: string | null
          title: string | null
          video_url: string
        }
        Insert: {
          artist?: string | null
          audio_url?: string | null
          created_at?: string
          id?: string
          lyrics?: string | null
          status?: string | null
          title?: string | null
          video_url: string
        }
        Update: {
          artist?: string | null
          audio_url?: string | null
          created_at?: string
          id?: string
          lyrics?: string | null
          status?: string | null
          title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          description: string | null
          id: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          url?: string
        }
        Relationships: []
      }
      lyrics: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      music_requests: {
        Row: {
          avoid_elements: string | null
          created_at: string
          desired_delivery_date: string
          email: string
          family_names: string
          full_name: string
          honored_people: string
          id: string
          mandatory_phrases: string
          music_tone: string
          notes: string | null
          occasion: string
          other_occasion: string | null
          phone: string
          relationship_with_honored: string
          special_details: string | null
          special_moment: string | null
          status: string
          story_context: string
        }
        Insert: {
          avoid_elements?: string | null
          created_at?: string
          desired_delivery_date: string
          email: string
          family_names: string
          full_name: string
          honored_people: string
          id?: string
          mandatory_phrases: string
          music_tone: string
          notes?: string | null
          occasion: string
          other_occasion?: string | null
          phone: string
          relationship_with_honored: string
          special_details?: string | null
          special_moment?: string | null
          status?: string
          story_context: string
        }
        Update: {
          avoid_elements?: string | null
          created_at?: string
          desired_delivery_date?: string
          email?: string
          family_names?: string
          full_name?: string
          honored_people?: string
          id?: string
          mandatory_phrases?: string
          music_tone?: string
          notes?: string | null
          occasion?: string
          other_occasion?: string | null
          phone?: string
          relationship_with_honored?: string
          special_details?: string | null
          special_moment?: string | null
          status?: string
          story_context?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_ratings: {
        Row: {
          created_at: string | null
          id: string
          prompt_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_ratings_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_usage: {
        Row: {
          id: string
          prompt_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          prompt_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          prompt_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_usage_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          background_color: string | null
          category_id: string
          copy_count: number | null
          created_at: string
          id: string
          rating: number
          rating_average: number | null
          rating_count: number | null
          simple_id: string | null
          tags: string[] | null
          text: string
        }
        Insert: {
          background_color?: string | null
          category_id: string
          copy_count?: number | null
          created_at?: string
          id?: string
          rating?: number
          rating_average?: number | null
          rating_count?: number | null
          simple_id?: string | null
          tags?: string[] | null
          text: string
        }
        Update: {
          background_color?: string | null
          category_id?: string
          copy_count?: number | null
          created_at?: string
          id?: string
          rating?: number
          rating_average?: number | null
          rating_count?: number | null
          simple_id?: string | null
          tags?: string[] | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          created_at: string
          description: string | null
          effect: string | null
          id: string
          name: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          effect?: string | null
          id?: string
          name: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          effect?: string | null
          id?: string
          name?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_items: {
        Row: {
          created_at: string
          id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_prompt_rating_average: {
        Args: { prompt_uuid: string }
        Returns: undefined
      }
      increment_copy_count: {
        Args: { prompt_uuid: string }
        Returns: undefined
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
