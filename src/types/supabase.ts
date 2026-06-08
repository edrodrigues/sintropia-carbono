export type Json
  = | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type UserRole = "user" | "moderator" | "admin" | "banned";

export interface Database {
  public: {
    Tables: {
      bans: {
        Row: {
          created_at: string | null;
          expires_at: string | null;
          id: string;
          moderator_id: string;
          reason: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          moderator_id: string;
          reason?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          moderator_id?: string;
          reason?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bans_moderator_id_fkey";
            columns: ["moderator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bans_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      carbon_credits: {
        Row: {
          created_at: string | null;
          id: number;
          project_id: string | null;
          quantity: number;
          retirement_account: string | null;
          retirement_beneficiary: string | null;
          retirement_beneficiary_harmonized: string | null;
          retirement_note: string | null;
          retirement_reason: string | null;
          transaction_date: string | null;
          transaction_type: string | null;
          vintage: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          project_id?: string | null;
          quantity: number;
          retirement_account?: string | null;
          retirement_beneficiary?: string | null;
          retirement_beneficiary_harmonized?: string | null;
          retirement_note?: string | null;
          retirement_reason?: string | null;
          transaction_date?: string | null;
          transaction_type?: string | null;
          vintage?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          project_id?: string | null;
          quantity?: number;
          retirement_account?: string | null;
          retirement_beneficiary?: string | null;
          retirement_beneficiary_harmonized?: string | null;
          retirement_note?: string | null;
          retirement_reason?: string | null;
          transaction_date?: string | null;
          transaction_type?: string | null;
          vintage?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "carbon_credits_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "carbon_projects";
            referencedColumns: ["project_id"];
          },
        ];
      };
      carbon_projects: {
        Row: {
          category: string | null;
          country: string;
          created_at: string | null;
          first_issuance_at: string | null;
          first_retirement_at: string | null;
          id: number;
          is_compliance: boolean | null;
          issued: number | null;
          listed_at: string | null;
          name: string;
          proponent: string | null;
          project_id: string;
          project_type: string | null;
          project_type_source: string | null;
          project_url: string | null;
          protocol: string | null;
          registry: string | null;
          retired: number | null;
          status: string | null;
        };
        Insert: {
          category?: string | null;
          country: string;
          created_at?: string | null;
          first_issuance_at?: string | null;
          first_retirement_at?: string | null;
          id?: number;
          is_compliance?: boolean | null;
          issued?: number | null;
          listed_at?: string | null;
          name: string;
          proponent?: string | null;
          project_id: string;
          project_type?: string | null;
          project_type_source?: string | null;
          project_url?: string | null;
          protocol?: string | null;
          registry?: string | null;
          retired?: number | null;
          status?: string | null;
        };
        Update: {
          category?: string | null;
          country?: string;
          created_at?: string | null;
          first_issuance_at?: string | null;
          first_retirement_at?: string | null;
          id?: number;
          is_compliance?: boolean | null;
          issued?: number | null;
          listed_at?: string | null;
          name?: string;
          proponent?: string | null;
          project_id?: string;
          project_type?: string | null;
          project_type_source?: string | null;
          project_url?: string | null;
          protocol?: string | null;
          registry?: string | null;
          retired?: number | null;
          status?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          author_id: string;
          content: string;
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          karma: number | null;
          parent_id: string | null;
          post_id: string;
          updated_at: string | null;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          karma?: number | null;
          parent_id?: string | null;
          post_id: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          karma?: number | null;
          parent_id?: string | null;
          post_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      karma_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          id: string;
          post_id: string | null;
          reason: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          id?: string;
          post_id?: string | null;
          reason: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          id?: string;
          post_id?: string | null;
          reason?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "karma_transactions_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "karma_transactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_deletions: {
        Row: {
          created_at: string | null;
          id: string;
          moderator_id: string;
          post_id: string;
          reason: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          moderator_id: string;
          post_id: string;
          reason?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          moderator_id?: string;
          post_id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "post_deletions_moderator_id_fkey";
            columns: ["moderator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_deletions_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          category: string;
          comment_count: number | null;
          content: string | null;
          created_at: string | null;
          id: string;
          is_deleted: boolean | null;
          is_locked: boolean | null;
          karma: number | null;
          keywords: string[] | null;
          title: string;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          author_id: string;
          category: string;
          comment_count?: number | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          is_locked?: boolean | null;
          karma?: number | null;
          keywords?: string[] | null;
          title: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          author_id?: string;
          category?: string;
          comment_count?: number | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          is_locked?: boolean | null;
          karma?: number | null;
          keywords?: string[] | null;
          title?: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          cargo: string | null;
          created_at: string | null;
          display_name: string | null;
          id: string;
          karma: number | null;
          linkedin_url: string | null;
          organization: string | null;
          role: UserRole | null;
          twitter_url: string | null;
          updated_at: string | null;
          user_type: string | null;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          cargo?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id: string;
          karma?: number | null;
          linkedin_url?: string | null;
          organization?: string | null;
          role?: UserRole | null;
          twitter_url?: string | null;
          updated_at?: string | null;
          user_type?: string | null;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          cargo?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          karma?: number | null;
          linkedin_url?: string | null;
          organization?: string | null;
          role?: UserRole | null;
          twitter_url?: string | null;
          updated_at?: string | null;
          user_type?: string | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string | null;
          id: string;
          reason: string;
          reporter_id: string;
          status: string | null;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          reason: string;
          reporter_id: string;
          status?: string | null;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string;
          status?: string | null;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          earned_at: string | null;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          earned_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          earned_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_streaks: {
        Row: {
          current_streak: number | null;
          last_activity_date: string | null;
          longest_streak: number | null;
          total_days_active: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          current_streak?: number | null;
          last_activity_date?: string | null;
          longest_streak?: number | null;
          total_days_active?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          current_streak?: number | null;
          last_activity_date?: string | null;
          longest_streak?: number | null;
          total_days_active?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: {
          created_at: string | null;
          id: string;
          target_id: string;
          target_type: string;
          user_id: string;
          vote_type: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          target_id: string;
          target_type: string;
          user_id: string;
          vote_type: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          target_id?: string;
          target_type?: string;
          user_id?: string;
          vote_type?: number;
        };
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      warnings: {
        Row: {
          created_at: string | null;
          id: string;
          moderator_id: string;
          reason: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          moderator_id: string;
          reason: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          moderator_id?: string;
          reason?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "warnings_moderator_id_fkey";
            columns: ["moderator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warnings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      irec_stakeholders: {
        Row: {
          id: string;
          ranking: number;
          region: string;
          empresa: string;
          setor: string | null;
          papel_mercado: string | null;
          volume_2024: number | null;
          volume_2025: number | null;
          volume_2026: number | null;
          delta_num: number | null;
          delta_pct: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          ranking: number;
          region: string;
          empresa: string;
          setor?: string | null;
          papel_mercado?: string | null;
          volume_2024?: number | null;
          volume_2025?: number | null;
          volume_2026?: number | null;
          delta_num?: number | null;
          delta_pct?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          ranking?: number;
          region?: string;
          empresa?: string;
          setor?: string | null;
          papel_mercado?: string | null;
          volume_2024?: number | null;
          volume_2025?: number | null;
          volume_2026?: number | null;
          delta_num?: number | null;
          delta_pct?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      carbon_stakeholders: {
        Row: {
          id: string;
          ranking: number;
          region: string;
          empresa: string;
          setor: string | null;
          volume_2024: number | null;
          volume_2025: number | null;
          volume_2026: number | null;
          delta_pct: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          ranking: number;
          region: string;
          empresa: string;
          setor?: string | null;
          volume_2024?: number | null;
          volume_2025?: number | null;
          volume_2026?: number | null;
          delta_pct?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          ranking?: number;
          region?: string;
          empresa?: string;
          setor?: string | null;
          volume_2024?: number | null;
          volume_2025?: number | null;
          volume_2026?: number | null;
          delta_pct?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      irec_prices: {
        Row: {
          id: string;
          category: string;
          country: string | null;
          technology: string | null;
          price_range: string | null;
          vintage: string | null;
          observation: string | null;
          trend: string | null;
          update_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          category: string;
          country?: string | null;
          technology?: string | null;
          price_range?: string | null;
          vintage?: string | null;
          observation?: string | null;
          trend?: string | null;
          update_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          category?: string;
          country?: string | null;
          technology?: string | null;
          price_range?: string | null;
          vintage?: string | null;
          observation?: string | null;
          trend?: string | null;
          update_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      carbon_prices: {
        Row: {
          id: string;
          market_type: string;
          market_name: string;
          region: string | null;
          price_range: string | null;
          currency: string | null;
          unit: string | null;
          observation: string | null;
          trend: string | null;
          update_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          market_type: string;
          market_name: string;
          region?: string | null;
          price_range?: string | null;
          currency?: string | null;
          unit?: string | null;
          observation?: string | null;
          trend?: string | null;
          update_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          market_type?: string;
          market_name?: string;
          region?: string | null;
          price_range?: string | null;
          currency?: string | null;
          unit?: string | null;
          observation?: string | null;
          trend?: string | null;
          update_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      drip_tracking: {
        Row: {
          id: string;
          user_id: string;
          email_type: string;
          email_sent_at: string;
          status: string;
          error_message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_type: string;
          email_sent_at?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_type?: string;
          email_sent_at?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      data_sources: {
        Row: {
          id: string;
          source_name: string;
          source_url: string | null;
          data_type: string;
          last_updated: string | null;
          refresh_frequency: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          source_name: string;
          source_url?: string | null;
          data_type: string;
          last_updated?: string | null;
          refresh_frequency?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          source_name?: string;
          source_url?: string | null;
          data_type?: string;
          last_updated?: string | null;
          refresh_frequency?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      v_carbon_dashboard: {
        Row: {
          region: string;
          total_stakeholders: number;
          total_volume_2024: number;
          total_volume_2025: number;
          crescimento_pct: number;
        };
        Relationships: [];
      };
      v_irec_dashboard: {
        Row: {
          region: string;
          total_stakeholders: number;
          total_volume_2024: number;
          total_volume_2025: number;
          total_volume_2026: number;
          crescimento_pct: number;
        };
        Relationships: [];
      };
      v_irec_by_setor: {
        Row: {
          setor: string;
          empresas: number;
          volume_2024: number;
          volume_2025: number;
          volume_2026: number;
          crescimento_medio: number;
        };
        Relationships: [];
      };
      v_irec_prices_summary: {
        Row: {
          category: string;
          entries: number;
          last_update: string;
        };
        Relationships: [];
      };
      v_irec_dashboard_corrected: {
        Row: {
          region: string;
          total_stakeholders: number;
          total_volume_2024: number;
          total_volume_2025: number;
          total_volume_2026: number;
          crescimento_pct: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      update_user_streak: {
        Args: { p_user_id: string };
        Returns: {
          current_streak: number;
          longest_streak: number;
          total_days: number;
          bonus_earned: number;
        };
      };
      check_and_award_achievements: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      generate_referral_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      claim_referral_reward: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      get_users_for_drip: {
        Args: Record<string, never>;
        Returns: Array<{ id: string; email: string; first_name: string; name: string; created_at: string }>;
      };
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"]
      & Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"]
    & Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"]
    & Database["public"]["Views"])
    ? (Database["public"]["Tables"]
      & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
