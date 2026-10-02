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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          label: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string
          created_at: string
          customer_name: string
          delivery_fee: number
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_slot: string | null
          discount_total: number
          email: string
          items: Json
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          region: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          customer_name: string
          delivery_fee?: number
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_slot?: string | null
          discount_total?: number
          email: string
          items: Json
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          region: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          delivery_slot?: string | null
          discount_total?: number
          email?: string
          items?: Json
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone?: string
          region?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          alt: string
          category_slug: string
          created_at: string
          description: string | null
          dimensions: Json | null
          discount_percent: number
          featured: boolean
          id: string
          image: string
          images: Json
          is_new: boolean
          name: string
          original_price: number
          popularity: number
          rating: number
          sku: string | null
          stock_quantity: number
          subcategory_slug: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          alt: string
          category_slug: string
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percent?: number
          featured?: boolean
          id: string
          image: string
          images?: Json
          is_new?: boolean
          name: string
          original_price: number
          popularity?: number
          rating?: number
          sku?: string | null
          stock_quantity?: number
          subcategory_slug?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          alt?: string
          category_slug?: string
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percent?: number
          featured?: boolean
          id?: string
          image?: string
          images?: Json
          is_new?: boolean
          name?: string
          original_price?: number
          popularity?: number
          rating?: number
          sku?: string | null
          stock_quantity?: number
          subcategory_slug?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_category_slug_subcategory_slug_fkey"
            columns: ["category_slug", "subcategory_slug"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["category_slug", "slug"]
          },
        ]
      }
      reviews: {
        Row: {
          approved: boolean
          comment: string
          date: string
          id: string
          name: string
          product_id: string
          rating: number
        }
        Insert: {
          approved?: boolean
          comment: string
          date?: string
          id?: string
          name: string
          product_id: string
          rating: number
        }
        Update: {
          approved?: boolean
          comment?: string
          date?: string
          id?: string
          name?: string
          product_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_slug: string
          created_at: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          label: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      delivery_method: "pickup" | "delivery"
      order_status: "nouvelle" | "en_traitement" | "expédiée" | "terminée"
      payment_method: "cod" | "wave" | "bank-transfer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      delivery_method: ["pickup", "delivery"],
      order_status: ["nouvelle", "en_traitement", "expédiée", "terminée"],
      payment_method: ["cod", "wave", "bank-transfer"],
    },
  },
} as const
