export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "user" | "moderator" | "admin" | "banned";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bans: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          moderator_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bans_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_credits: {
        Row: {
          created_at: string | null
          id: number
          project_id: string | null
          quantity: number
          retirement_account: string | null
          retirement_beneficiary: string | null
          retirement_beneficiary_harmonized: string | null
          retirement_note: string | null
          retirement_reason: string | null
          transaction_date: string | null
          transaction_type: string | null
          vintage: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          project_id?: string | null
          quantity: number
          retirement_account?: string | null
          retirement_beneficiary?: string | null
          retirement_beneficiary_harmonized?: string | null
          retirement_note?: string | null
          retirement_reason?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          vintage?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          project_id?: string | null
          quantity?: number
          retirement_account?: string | null
          retirement_beneficiary?: string | null
          retirement_beneficiary_harmonized?: string | null
          retirement_note?: string | null
          retirement_reason?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          vintage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_credits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      carbon_projects: {
        Row: {
          category: string | null
          country: string
          created_at: string | null
          first_issuance_at: string | null
          first_retirement_at: string | null
          id: number
          is_compliance: boolean | null
          issued: number | null
          listed_at: string | null
          name: string
          project_id: string
          project_type: string | null
          project_type_source: string | null
          project_url: string | null
          proponent: string | null
          protocol: string | null
          registry: string | null
          retired: number | null
          status: string | null
        }
        Insert: {
          category?: string | null
          country: string
          created_at?: string | null
          first_issuance_at?: string | null
          first_retirement_at?: string | null
          id?: number
          is_compliance?: boolean | null
          issued?: number | null
          listed_at?: string | null
          name: string
          project_id: string
          project_type?: string | null
          project_type_source?: string | null
          project_url?: string | null
          proponent?: string | null
          protocol?: string | null
          registry?: string | null
          retired?: number | null
          status?: string | null
        }
        Update: {
          category?: string | null
          country?: string
          created_at?: string | null
          first_issuance_at?: string | null
          first_retirement_at?: string | null
          id?: number
          is_compliance?: boolean | null
          issued?: number | null
          listed_at?: string | null
          name?: string
          project_id?: string
          project_type?: string | null
          project_type_source?: string | null
          project_url?: string | null
          proponent?: string | null
          protocol?: string | null
          registry?: string | null
          retired?: number | null
          status?: string | null
        }
        Relationships: []
      }
      carbon_prices: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          market_name: string
          market_type: string
          observation: string | null
          price_range: string | null
          region: string | null
          trend: string | null
          unit: string | null
          update_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          market_name: string
          market_type: string
          observation?: string | null
          price_range?: string | null
          region?: string | null
          trend?: string | null
          unit?: string | null
          update_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          market_name?: string
          market_type?: string
          observation?: string | null
          price_range?: string | null
          region?: string | null
          trend?: string | null
          unit?: string | null
          update_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      carbon_stakeholders: {
        Row: {
          created_at: string | null
          delta_num: number | null
          delta_pct: number | null
          empresa: string
          id: string
          ranking: number
          region: string
          setor: string | null
          updated_at: string | null
          volume_2024: number | null
          volume_2025: number | null
          volume_2026: number | null
        }
        Insert: {
          created_at?: string | null
          delta_num?: number | null
          delta_pct?: number | null
          empresa: string
          id?: string
          ranking: number
          region?: string
          setor?: string | null
          updated_at?: string | null
          volume_2024?: number | null
          volume_2025?: number | null
          volume_2026?: number | null
        }
        Update: {
          created_at?: string | null
          delta_num?: number | null
          delta_pct?: number | null
          empresa?: string
          id?: string
          ranking?: number
          region?: string
          setor?: string | null
          updated_at?: string | null
          volume_2024?: number | null
          volume_2025?: number | null
          volume_2026?: number | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          author_id: string
          category: string
          comment_count: number | null
          context: string
          created_at: string | null
          expected_result: string
          id: string
          images: string[] | null
          is_deleted: boolean | null
          reward: string
          sector: string | null
          solution_comment_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category: string
          comment_count?: number | null
          context: string
          created_at?: string | null
          expected_result: string
          id?: string
          images?: string[] | null
          is_deleted?: boolean | null
          reward: string
          sector?: string | null
          solution_comment_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          comment_count?: number | null
          context?: string
          created_at?: string | null
          expected_result?: string
          id?: string
          images?: string[] | null
          is_deleted?: boolean | null
          reward?: string
          sector?: string | null
          solution_comment_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          challenge_id: string | null
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          karma: number | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          challenge_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          karma?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          challenge_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          karma?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          created_at: string | null
          data_type: string
          id: string
          last_updated: string | null
          refresh_frequency: string | null
          source_name: string
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          id?: string
          last_updated?: string | null
          refresh_frequency?: string | null
          source_name: string
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: string
          last_updated?: string | null
          refresh_frequency?: string | null
          source_name?: string
          source_url?: string | null
        }
        Relationships: []
      }
      irec_prices: {
        Row: {
          category: string
          country: string | null
          created_at: string | null
          id: string
          observation: string | null
          price_range: string | null
          technology: string | null
          trend: string | null
          update_date: string | null
          updated_at: string | null
          vintage: string | null
        }
        Insert: {
          category: string
          country?: string | null
          created_at?: string | null
          id?: string
          observation?: string | null
          price_range?: string | null
          technology?: string | null
          trend?: string | null
          update_date?: string | null
          updated_at?: string | null
          vintage?: string | null
        }
        Update: {
          category?: string
          country?: string | null
          created_at?: string | null
          id?: string
          observation?: string | null
          price_range?: string | null
          technology?: string | null
          trend?: string | null
          update_date?: string | null
          updated_at?: string | null
          vintage?: string | null
        }
        Relationships: []
      }
      irec_stakeholders: {
        Row: {
          created_at: string | null
          delta_num: number | null
          delta_pct: number | null
          empresa: string
          id: string
          papel_mercado: string | null
          ranking: number
          region: string
          setor: string | null
          updated_at: string | null
          volume_2024: number | null
          volume_2025: number | null
          volume_2026: number | null
        }
        Insert: {
          created_at?: string | null
          delta_num?: number | null
          delta_pct?: number | null
          empresa: string
          id?: string
          papel_mercado?: string | null
          ranking: number
          region?: string
          setor?: string | null
          updated_at?: string | null
          volume_2024?: number | null
          volume_2025?: number | null
          volume_2026?: number | null
        }
        Update: {
          created_at?: string | null
          delta_num?: number | null
          delta_pct?: number | null
          empresa?: string
          id?: string
          papel_mercado?: string | null
          ranking?: number
          region?: string
          setor?: string | null
          updated_at?: string | null
          volume_2024?: number | null
          volume_2025?: number | null
          volume_2026?: number | null
        }
        Relationships: []
      }
      karma_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          post_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "karma_transactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "karma_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_deletions: {
        Row: {
          created_at: string | null
          id: string
          moderator_id: string
          post_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          moderator_id: string
          post_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          moderator_id?: string
          post_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_deletions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_deletions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: string
          comment_count: number | null
          content: string | null
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_locked: boolean | null
          karma: number | null
          keywords: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author_id: string
          category: string
          comment_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_locked?: boolean | null
          karma?: number | null
          keywords?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          comment_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_locked?: boolean | null
          karma?: number | null
          keywords?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_for_consulting: boolean | null
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          certifications: string[] | null
          company_cnpj: string | null
          company_founded_year: number | null
          company_geo_presence: string | null
          company_sector: string | null
          company_size: string | null
          company_tagline: string | null
          company_website: string | null
          created_at: string | null
          display_name: string | null
          expertise_areas: string[] | null
          headline: string | null
          id: string
          karma: number | null
          linkedin_url: string | null
          organization: string | null
          referral_code: string | null
          referral_reward_claimed: boolean | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          twitter_url: string | null
          updated_at: string | null
          user_type: string | null
          username: string
          years_of_experience: number | null
        }
        Insert: {
          available_for_consulting?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          certifications?: string[] | null
          company_cnpj?: string | null
          company_founded_year?: number | null
          company_geo_presence?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_tagline?: string | null
          company_website?: string | null
          created_at?: string | null
          display_name?: string | null
          expertise_areas?: string[] | null
          headline?: string | null
          id: string
          karma?: number | null
          linkedin_url?: string | null
          organization?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type?: string | null
          username: string
          years_of_experience?: number | null
        }
        Update: {
          available_for_consulting?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          certifications?: string[] | null
          company_cnpj?: string | null
          company_founded_year?: number | null
          company_geo_presence?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_tagline?: string | null
          company_website?: string | null
          created_at?: string | null
          display_name?: string | null
          expertise_areas?: string[] | null
          headline?: string | null
          id?: string
          karma?: number | null
          linkedin_url?: string | null
          organization?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type?: string | null
          username?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warnings: {
        Row: {
          created_at: string | null
          id: string
          moderator_id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          moderator_id: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warnings_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_carbon_dashboard: {
        Row: {
          crescimento_medio: number | null
          crescimento_pct: number | null
          region: string | null
          total_stakeholders: number | null
          total_volume_2024: number | null
          total_volume_2025: number | null
          total_volume_2026: number | null
        }
        Relationships: []
      }
      v_irec_by_setor: {
        Row: {
          crescimento_medio: number | null
          empresas: number | null
          setor: string | null
          volume_2024: number | null
          volume_2025: number | null
          volume_2026: number | null
        }
        Relationships: []
      }
      v_irec_dashboard: {
        Row: {
          crescimento_medio: number | null
          crescimento_pct: number | null
          region: string | null
          total_stakeholders: number | null
          total_volume_2024: number | null
          total_volume_2025: number | null
          total_volume_2026: number | null
        }
        Relationships: []
      }
      v_irec_dashboard_corrected: {
        Row: {
          crescimento_pct: number | null
          region: string | null
          total_stakeholders: number | null
          total_volume_2024: number | null
          total_volume_2025: number | null
          total_volume_2026: number | null
        }
        Relationships: []
      }
      v_irec_prices_summary: {
        Row: {
          category: string | null
          entries: number | null
          last_update: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_karma_transaction: {
        Args: {
          p_amount: number
          p_post_id?: string
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      award_achievement_if_missing: {
        Args: { p_achievement_id: string; p_user_id: string }
        Returns: undefined
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: Json
      }
      clean_old_notifications: { Args: never; Returns: undefined }
      delete_post: { Args: { post_id: string }; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      get_users_for_drip: {
        Args: never
        Returns: {
          created_at: string
          email: string
        }[]
      }
      get_users_for_resend: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          user_type: string
        }[]
      }
      reverse_post_karma: { Args: { p_post_id: string }; Returns: undefined }
    }
    Enums: {
      user_role: "user" | "moderator" | "admin" | "banned"
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
      user_role: ["user", "moderator", "admin", "banned"],
    },
  },
} as const
