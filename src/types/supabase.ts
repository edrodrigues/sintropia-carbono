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
      alerts: {
        Row: {
          asset_id: string | null
          channel: string | null
          condition_type: string
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          threshold_value: number | null
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          channel?: string | null
          condition_type: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          threshold_value?: number | null
          user_id: string
        }
        Update: {
          asset_id?: string | null
          channel?: string | null
          condition_type?: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          threshold_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string
          cad_trust_project_id: string | null
          country: string | null
          created_at: string | null
          description: string | null
          external_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          methodology: string | null
          name: string
          project_category: string | null
          provider: string | null
          region: string | null
          registry: string | null
          slug: string
          technology: string | null
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          cad_trust_project_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name: string
          project_category?: string | null
          provider?: string | null
          region?: string | null
          registry?: string | null
          slug: string
          technology?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          cad_trust_project_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name?: string
          project_category?: string | null
          provider?: string | null
          region?: string | null
          registry?: string | null
          slug?: string
          technology?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      buyer_profiles: {
        Row: {
          annual_budget_range: string | null
          bought_br_credits_before: boolean | null
          buyer_country: string | null
          company_name: string | null
          created_at: string | null
          purchase_purpose: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_budget_range?: string | null
          bought_br_credits_before?: boolean | null
          buyer_country?: string | null
          company_name?: string | null
          created_at?: string | null
          purchase_purpose?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_budget_range?: string | null
          bought_br_credits_before?: boolean | null
          buyer_country?: string | null
          company_name?: string | null
          created_at?: string | null
          purchase_purpose?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_co_benefits: {
        Row: {
          cad_trust_project_id: string
          co_benefit_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          co_benefit_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          co_benefit_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_co_benefits_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_issuances: {
        Row: {
          cad_trust_project_id: string
          created_at: string | null
          id: string
          issuance_date: string | null
          issuance_id: string
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          created_at?: string | null
          id?: string
          issuance_date?: string | null
          issuance_id: string
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          created_at?: string | null
          id?: string
          issuance_date?: string | null
          issuance_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_issuances_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_labels: {
        Row: {
          cad_trust_project_id: string
          created_at: string | null
          id: string
          label_date: string | null
          label_link: string | null
          label_name: string
          label_type: string
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          created_at?: string | null
          id?: string
          label_date?: string | null
          label_link?: string | null
          label_name: string
          label_type: string
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          created_at?: string | null
          id?: string
          label_date?: string | null
          label_link?: string | null
          label_name?: string
          label_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_labels_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_locations: {
        Row: {
          cad_trust_project_id: string
          country: string
          created_at: string | null
          geographic_identifier: string | null
          id: string
          in_country_region: string | null
          map_file_link: string | null
          map_type: string | null
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          country: string
          created_at?: string | null
          geographic_identifier?: string | null
          id?: string
          in_country_region?: string | null
          map_file_link?: string | null
          map_type?: string | null
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          country?: string
          created_at?: string | null
          geographic_identifier?: string | null
          id?: string
          in_country_region?: string | null
          map_file_link?: string | null
          map_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_locations_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_methodologies: {
        Row: {
          created_at: string | null
          id: string
          methodology_code: string
          methodology_date: string | null
          methodology_link: string | null
          methodology_name: string
          methodology_type: string | null
          methodology_version: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          methodology_code: string
          methodology_date?: string | null
          methodology_link?: string | null
          methodology_name: string
          methodology_type?: string | null
          methodology_version?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          methodology_code?: string
          methodology_date?: string | null
          methodology_link?: string | null
          methodology_name?: string
          methodology_type?: string | null
          methodology_version?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cad_trust_programs: {
        Row: {
          created_at: string | null
          id: string
          program_description: string | null
          program_name: string
          program_registry: string
          program_registry_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          program_description?: string | null
          program_name: string
          program_registry: string
          program_registry_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          program_description?: string | null
          program_name?: string
          program_registry?: string
          program_registry_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cad_trust_project_methodologies: {
        Row: {
          cad_trust_methodology_id: string
          cad_trust_project_id: string
          created_at: string | null
          id: string
          project_methodology_date: string | null
          project_methodology_description: string | null
          updated_at: string | null
        }
        Insert: {
          cad_trust_methodology_id: string
          cad_trust_project_id: string
          created_at?: string | null
          id?: string
          project_methodology_date?: string | null
          project_methodology_description?: string | null
          updated_at?: string | null
        }
        Update: {
          cad_trust_methodology_id?: string
          cad_trust_project_id?: string
          created_at?: string | null
          id?: string
          project_methodology_date?: string | null
          project_methodology_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_project_methodologies_cad_trust_methodology_id_fkey"
            columns: ["cad_trust_methodology_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_methodologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cad_trust_project_methodologies_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_projects: {
        Row: {
          category: string | null
          created_at: string | null
          first_issuance_at: string | null
          first_retirement_at: string | null
          id: string
          is_compliance: boolean | null
          issued: number | null
          listed_at: string | null
          org_uid: string
          project_crediting_program: string | null
          project_description: string | null
          project_id: string
          project_link: string | null
          project_name: string
          project_registry_name: string
          project_sector: string | null
          project_status: string
          project_status_date: string | null
          project_subtype: string | null
          project_type: string | null
          project_type_source: string | null
          project_unit_metric: string | null
          proponent: string | null
          protocol: string | null
          retired: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          first_issuance_at?: string | null
          first_retirement_at?: string | null
          id?: string
          is_compliance?: boolean | null
          issued?: number | null
          listed_at?: string | null
          org_uid: string
          project_crediting_program?: string | null
          project_description?: string | null
          project_id: string
          project_link?: string | null
          project_name: string
          project_registry_name: string
          project_sector?: string | null
          project_status?: string
          project_status_date?: string | null
          project_subtype?: string | null
          project_type?: string | null
          project_type_source?: string | null
          project_unit_metric?: string | null
          proponent?: string | null
          protocol?: string | null
          retired?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          first_issuance_at?: string | null
          first_retirement_at?: string | null
          id?: string
          is_compliance?: boolean | null
          issued?: number | null
          listed_at?: string | null
          org_uid?: string
          project_crediting_program?: string | null
          project_description?: string | null
          project_id?: string
          project_link?: string | null
          project_name?: string
          project_registry_name?: string
          project_sector?: string | null
          project_status?: string
          project_status_date?: string | null
          project_subtype?: string | null
          project_type?: string | null
          project_type_source?: string | null
          project_unit_metric?: string | null
          proponent?: string | null
          protocol?: string | null
          retired?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cad_trust_ratings: {
        Row: {
          cad_trust_project_id: string
          created_at: string | null
          id: string
          rating_link: string | null
          rating_name: string
          rating_type: string | null
          rating_value: string
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          created_at?: string | null
          id?: string
          rating_link?: string | null
          rating_name: string
          rating_type?: string | null
          rating_value: string
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          created_at?: string | null
          id?: string
          rating_link?: string | null
          rating_name?: string
          rating_type?: string | null
          rating_value?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_ratings_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_stakeholders: {
        Row: {
          cad_trust_project_id: string
          created_at: string | null
          id: string
          stakeholder_link: string | null
          stakeholder_name: string
          stakeholder_type: string
          updated_at: string | null
        }
        Insert: {
          cad_trust_project_id: string
          created_at?: string | null
          id?: string
          stakeholder_link?: string | null
          stakeholder_name: string
          stakeholder_type: string
          updated_at?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          created_at?: string | null
          id?: string
          stakeholder_link?: string | null
          stakeholder_name?: string
          stakeholder_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_stakeholders_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_units: {
        Row: {
          cad_trust_issuance_id: string
          created_at: string | null
          id: string
          marketplace: string | null
          marketplace_identifier: string | null
          marketplace_link: string | null
          org_uid: string
          unit_count: number | null
          unit_current_owner: string | null
          unit_end_block: string | null
          unit_itmos_reference_id: string | null
          unit_link: string | null
          unit_metric: string | null
          unit_retirement_beneficiary: string | null
          unit_retirement_detail: string | null
          unit_serial_id: string
          unit_start_block: string | null
          unit_status: string | null
          unit_status_date: string | null
          unit_status_reason: string | null
          unit_type: string | null
          unit_vintage_year: number
          updated_at: string | null
        }
        Insert: {
          cad_trust_issuance_id: string
          created_at?: string | null
          id?: string
          marketplace?: string | null
          marketplace_identifier?: string | null
          marketplace_link?: string | null
          org_uid: string
          unit_count?: number | null
          unit_current_owner?: string | null
          unit_end_block?: string | null
          unit_itmos_reference_id?: string | null
          unit_link?: string | null
          unit_metric?: string | null
          unit_retirement_beneficiary?: string | null
          unit_retirement_detail?: string | null
          unit_serial_id: string
          unit_start_block?: string | null
          unit_status?: string | null
          unit_status_date?: string | null
          unit_status_reason?: string | null
          unit_type?: string | null
          unit_vintage_year: number
          updated_at?: string | null
        }
        Update: {
          cad_trust_issuance_id?: string
          created_at?: string | null
          id?: string
          marketplace?: string | null
          marketplace_identifier?: string | null
          marketplace_link?: string | null
          org_uid?: string
          unit_count?: number | null
          unit_current_owner?: string | null
          unit_end_block?: string | null
          unit_itmos_reference_id?: string | null
          unit_link?: string | null
          unit_metric?: string | null
          unit_retirement_beneficiary?: string | null
          unit_retirement_detail?: string | null
          unit_serial_id?: string
          unit_start_block?: string | null
          unit_status?: string | null
          unit_status_date?: string | null
          unit_status_reason?: string | null
          unit_type?: string | null
          unit_vintage_year?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_units_cad_trust_issuance_id_fkey"
            columns: ["cad_trust_issuance_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_issuances"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_validations: {
        Row: {
          cad_trust_project_id: string
          created_at: string | null
          crediting_period_end_date: string | null
          crediting_period_start_date: string | null
          id: string
          updated_at: string | null
          validation_body: string | null
          validation_date: string | null
          validation_id: string | null
          validation_type: string | null
        }
        Insert: {
          cad_trust_project_id: string
          created_at?: string | null
          crediting_period_end_date?: string | null
          crediting_period_start_date?: string | null
          id?: string
          updated_at?: string | null
          validation_body?: string | null
          validation_date?: string | null
          validation_id?: string | null
          validation_type?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          created_at?: string | null
          crediting_period_end_date?: string | null
          crediting_period_start_date?: string | null
          id?: string
          updated_at?: string | null
          validation_body?: string | null
          validation_date?: string | null
          validation_id?: string | null
          validation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_validations_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cad_trust_verifications: {
        Row: {
          cad_trust_project_id: string
          cad_trust_validation_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          verification_body: string
          verification_end_date: string | null
          verification_start_date: string | null
        }
        Insert: {
          cad_trust_project_id: string
          cad_trust_validation_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          verification_body: string
          verification_end_date?: string | null
          verification_start_date?: string | null
        }
        Update: {
          cad_trust_project_id?: string
          cad_trust_validation_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          verification_body?: string
          verification_end_date?: string | null
          verification_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_trust_verifications_cad_trust_project_id_fkey"
            columns: ["cad_trust_project_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cad_trust_verifications_cad_trust_validation_id_fkey"
            columns: ["cad_trust_validation_id"]
            isOneToOne: false
            referencedRelation: "cad_trust_validations"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_credits: {
        Row: {
          chain_tx_hash: string | null
          created_at: string | null
          id: number
          project_id: string | null
          quantity: number
          retirement_account: string | null
          retirement_beneficiary: string | null
          retirement_beneficiary_harmonized: string | null
          retirement_note: string | null
          retirement_reason: string | null
          source: string | null
          transaction_date: string | null
          transaction_type: string | null
          vintage: number | null
        }
        Insert: {
          chain_tx_hash?: string | null
          created_at?: string | null
          id?: number
          project_id?: string | null
          quantity: number
          retirement_account?: string | null
          retirement_beneficiary?: string | null
          retirement_beneficiary_harmonized?: string | null
          retirement_note?: string | null
          retirement_reason?: string | null
          source?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          vintage?: number | null
        }
        Update: {
          chain_tx_hash?: string | null
          created_at?: string | null
          id?: number
          project_id?: string | null
          quantity?: number
          retirement_account?: string | null
          retirement_beneficiary?: string | null
          retirement_beneficiary_harmonized?: string | null
          retirement_note?: string | null
          retirement_reason?: string | null
          source?: string | null
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
      fotos: {
        Row: {
          created_at: string | null
          id: string
          ordem: number
          presente_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordem: number
          presente_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ordem?: number
          presente_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_presente_id_fkey"
            columns: ["presente_id"]
            isOneToOne: false
            referencedRelation: "presentes"
            referencedColumns: ["id"]
          },
        ]
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
      market_listings: {
        Row: {
          asset_type: string
          author_id: string
          buyer_profile_id: string | null
          ccee_origem: string | null
          ccp_requirement: string | null
          ccp_status: string | null
          certifications: string[] | null
          co_benefit_prefs: string[] | null
          co_benefits: string[] | null
          completeness_score: number | null
          contract_type: string | null
          created_at: string | null
          delivery_term: string | null
          documentation: string[] | null
          evaluation_criteria: Json | null
          expires_at: string | null
          id: string
          media_urls: string[] | null
          methodologies: string[] | null
          methodology: string | null
          min_ratings: Json | null
          min_transaction_size: number | null
          needs_extra_dd: boolean | null
          notes: string | null
          offtake_until_year: number | null
          open_to_multi_year_offtake: boolean | null
          origin_country: string | null
          prefer_deal_room: boolean | null
          price_amount: number | null
          price_currency: string | null
          price_max: number | null
          price_min: number | null
          price_on_request: boolean | null
          project_name: string | null
          project_registry_id: string | null
          proposal_deadline: string | null
          ratings: Json | null
          regions: string[] | null
          registries: string[] | null
          registry: string | null
          response_format: string | null
          side: string
          status: string
          unit: string | null
          updated_at: string | null
          vintage: number | null
          vintage_from: number | null
          vintage_to: number | null
          volume: number | null
          volume_max: number | null
          volume_min: number | null
        }
        Insert: {
          asset_type: string
          author_id: string
          buyer_profile_id?: string | null
          ccee_origem?: string | null
          ccp_requirement?: string | null
          ccp_status?: string | null
          certifications?: string[] | null
          co_benefit_prefs?: string[] | null
          co_benefits?: string[] | null
          completeness_score?: number | null
          contract_type?: string | null
          created_at?: string | null
          delivery_term?: string | null
          documentation?: string[] | null
          evaluation_criteria?: Json | null
          expires_at?: string | null
          id?: string
          media_urls?: string[] | null
          methodologies?: string[] | null
          methodology?: string | null
          min_ratings?: Json | null
          min_transaction_size?: number | null
          needs_extra_dd?: boolean | null
          notes?: string | null
          offtake_until_year?: number | null
          open_to_multi_year_offtake?: boolean | null
          origin_country?: string | null
          prefer_deal_room?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          price_max?: number | null
          price_min?: number | null
          price_on_request?: boolean | null
          project_name?: string | null
          project_registry_id?: string | null
          proposal_deadline?: string | null
          ratings?: Json | null
          regions?: string[] | null
          registries?: string[] | null
          registry?: string | null
          response_format?: string | null
          side: string
          status?: string
          unit?: string | null
          updated_at?: string | null
          vintage?: number | null
          vintage_from?: number | null
          vintage_to?: number | null
          volume?: number | null
          volume_max?: number | null
          volume_min?: number | null
        }
        Update: {
          asset_type?: string
          author_id?: string
          buyer_profile_id?: string | null
          ccee_origem?: string | null
          ccp_requirement?: string | null
          ccp_status?: string | null
          certifications?: string[] | null
          co_benefit_prefs?: string[] | null
          co_benefits?: string[] | null
          completeness_score?: number | null
          contract_type?: string | null
          created_at?: string | null
          delivery_term?: string | null
          documentation?: string[] | null
          evaluation_criteria?: Json | null
          expires_at?: string | null
          id?: string
          media_urls?: string[] | null
          methodologies?: string[] | null
          methodology?: string | null
          min_ratings?: Json | null
          min_transaction_size?: number | null
          needs_extra_dd?: boolean | null
          notes?: string | null
          offtake_until_year?: number | null
          open_to_multi_year_offtake?: boolean | null
          origin_country?: string | null
          prefer_deal_room?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          price_max?: number | null
          price_min?: number | null
          price_on_request?: boolean | null
          project_name?: string | null
          project_registry_id?: string | null
          proposal_deadline?: string | null
          ratings?: Json | null
          regions?: string[] | null
          registries?: string[] | null
          registry?: string | null
          response_format?: string | null
          side?: string
          status?: string
          unit?: string | null
          updated_at?: string | null
          vintage?: number | null
          vintage_from?: number | null
          vintage_to?: number | null
          volume?: number | null
          volume_max?: number | null
          volume_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      musicas: {
        Row: {
          created_at: string | null
          id: string
          presente_id: string
          prompt: string | null
          status: string
          updated_at: string | null
          url_audio: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          presente_id: string
          prompt?: string | null
          status?: string
          updated_at?: string | null
          url_audio?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          presente_id?: string
          prompt?: string | null
          status?: string
          updated_at?: string | null
          url_audio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "musicas_presente_id_fkey"
            columns: ["presente_id"]
            isOneToOne: false
            referencedRelation: "presentes"
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
      onchain_retirements: {
        Row: {
          beneficiary: string | null
          certificate_id: string | null
          chain: string | null
          country: string | null
          created_at: string | null
          event_id: string | null
          id: string
          message: string | null
          methodology: string | null
          original_data: Json | null
          project_id: string | null
          provider: string
          quantity: number | null
          registry: string | null
          retired_at: string | null
          retiring_address: string | null
          retiring_entity: string | null
          subgraph_id: string
          token_address: string | null
          token_symbol: string | null
          tx_hash: string | null
          vintage: number | null
        }
        Insert: {
          beneficiary?: string | null
          certificate_id?: string | null
          chain?: string | null
          country?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          methodology?: string | null
          original_data?: Json | null
          project_id?: string | null
          provider: string
          quantity?: number | null
          registry?: string | null
          retired_at?: string | null
          retiring_address?: string | null
          retiring_entity?: string | null
          subgraph_id: string
          token_address?: string | null
          token_symbol?: string | null
          tx_hash?: string | null
          vintage?: number | null
        }
        Update: {
          beneficiary?: string | null
          certificate_id?: string | null
          chain?: string | null
          country?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          message?: string | null
          methodology?: string | null
          original_data?: Json | null
          project_id?: string | null
          provider?: string
          quantity?: number | null
          registry?: string | null
          retired_at?: string | null
          retiring_address?: string | null
          retiring_entity?: string | null
          subgraph_id?: string
          token_address?: string | null
          token_symbol?: string | null
          tx_hash?: string | null
          vintage?: number | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
      presentes: {
        Row: {
          created_at: string | null
          descricao_relacao: string | null
          estilo_musical: string | null
          expires_at: string | null
          id: string
          link: string | null
          nome_homenageado: string
          ocasiao: string
          slug: string
          status: string
          thumbnail_url: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          descricao_relacao?: string | null
          estilo_musical?: string | null
          expires_at?: string | null
          id?: string
          link?: string | null
          nome_homenageado: string
          ocasiao: string
          slug: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          descricao_relacao?: string | null
          estilo_musical?: string | null
          expires_at?: string | null
          id?: string
          link?: string | null
          nome_homenageado?: string
          ocasiao?: string
          slug?: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      price_references: {
        Row: {
          asset_id: string | null
          created_at: string | null
          currency: string | null
          data_source_id: string | null
          fetched_at: string | null
          id: string
          local_currency: string | null
          local_price: number | null
          original_data: Json | null
          price: number | null
          price_display: string | null
          price_high: number | null
          price_low: number | null
          reference_date: string | null
          reference_type: string
          source_identifier: string | null
          unit: string | null
          updated_at: string | null
          vintage_year: number | null
          volume: number | null
          volume_unit: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          currency?: string | null
          data_source_id?: string | null
          fetched_at?: string | null
          id?: string
          local_currency?: string | null
          local_price?: number | null
          original_data?: Json | null
          price?: number | null
          price_display?: string | null
          price_high?: number | null
          price_low?: number | null
          reference_date?: string | null
          reference_type: string
          source_identifier?: string | null
          unit?: string | null
          updated_at?: string | null
          vintage_year?: number | null
          volume?: number | null
          volume_unit?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          currency?: string | null
          data_source_id?: string | null
          fetched_at?: string | null
          id?: string
          local_currency?: string | null
          local_price?: number | null
          original_data?: Json | null
          price?: number | null
          price_display?: string | null
          price_high?: number | null
          price_low?: number | null
          reference_date?: string | null
          reference_type?: string
          source_identifier?: string | null
          unit?: string | null
          updated_at?: string | null
          vintage_year?: number | null
          volume?: number | null
          volume_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
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
          organization_id: string | null
          referral_code: string | null
          referral_reward_claimed: boolean | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          twitter_url: string | null
          updated_at: string | null
          user_type: string | null
          username: string
          wallet_address: string | null
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
          organization_id?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type?: string | null
          username: string
          wallet_address?: string | null
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
          organization_id?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_type?: string | null
          username?: string
          wallet_address?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
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
      watchlist_items: {
        Row: {
          asset_id: string
          created_at: string | null
          id: string
          watchlist_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          id?: string
          watchlist_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      price_series: {
        Row: {
          asset_id: string | null
          avg_price: number | null
          currency: string | null
          day: string | null
          max_price: number | null
          min_price: number | null
          reference_type: string | null
          sample_count: number | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
        ]
      }
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
      v_market_listings: {
        Row: {
          asset_type: string | null
          author_avatar_url: string | null
          author_display_name: string | null
          author_id: string | null
          author_karma: number | null
          author_role: Database["public"]["Enums"]["user_role"] | null
          author_user_type: string | null
          author_username: string | null
          buyer_profile_id: string | null
          ccee_origem: string | null
          ccp_requirement: string | null
          ccp_status: string | null
          certifications: string[] | null
          co_benefit_prefs: string[] | null
          co_benefits: string[] | null
          completeness_score: number | null
          contract_type: string | null
          created_at: string | null
          delivery_term: string | null
          documentation: string[] | null
          evaluation_criteria: Json | null
          expires_at: string | null
          id: string | null
          media_urls: string[] | null
          methodologies: string[] | null
          methodology: string | null
          min_ratings: Json | null
          min_transaction_size: number | null
          needs_extra_dd: boolean | null
          notes: string | null
          offtake_until_year: number | null
          open_to_multi_year_offtake: boolean | null
          origin_country: string | null
          prefer_deal_room: boolean | null
          price_amount: number | null
          price_currency: string | null
          price_max: number | null
          price_min: number | null
          price_on_request: boolean | null
          project_name: string | null
          project_registry_id: string | null
          proposal_deadline: string | null
          ratings: Json | null
          regions: string[] | null
          registries: string[] | null
          registry: string | null
          response_format: string | null
          side: string | null
          status: string | null
          unit: string | null
          updated_at: string | null
          vintage: number | null
          vintage_from: number | null
          vintage_to: number | null
          volume: number | null
          volume_max: number | null
          volume_min: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_market_snapshot: {
        Row: {
          asset_id: string | null
          asset_name: string | null
          asset_type: string | null
          cad_trust_location_country: string | null
          cad_trust_project_link: string | null
          cad_trust_project_status: string | null
          cad_trust_units_issued: number | null
          cad_trust_units_retired: number | null
          country: string | null
          currency: string | null
          fetched_at: string | null
          is_ccp_aligned: boolean | null
          price: number | null
          price_display: string | null
          price_high: number | null
          price_id: string | null
          price_low: number | null
          project_category: string | null
          rating_bezero: string | null
          rating_sylvera: string | null
          reference_date: string | null
          reference_type: string | null
          registry: string | null
          slug: string | null
          source_name: string | null
          source_url: string | null
          technology: string | null
          unit: string | null
          vintage_year: number | null
          volume: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      v_normalized_assets: {
        Row: {
          asset_type: string | null
          base_price_usd: number | null
          country_of_origin: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          fetched_at: string | null
          id: string | null
          is_active: boolean | null
          is_ccp_aligned: boolean | null
          last_updated: string | null
          legacy_country: string | null
          legacy_registry: string | null
          liquidity_available: number | null
          local_currency: string | null
          local_price: number | null
          methodology: string | null
          name: string | null
          price_display: string | null
          price_high: number | null
          price_low: number | null
          price_vintage_year: number | null
          project_category: string | null
          provider: string | null
          rating_bezero: string | null
          rating_sylvera: string | null
          reference_date: string | null
          reference_type: string | null
          registry: string | null
          slug: string | null
          source_name: string | null
          technology: string | null
          unit: string | null
          vintage: number | null
        }
        Relationships: []
      }
      v_price_changes: {
        Row: {
          asset_id: string | null
          asset_name: string | null
          asset_type: string | null
          change_pct: number | null
          country: string | null
          currency: string | null
          current_date: string | null
          current_price: number | null
          previous_date: string | null
          previous_price: number | null
          slug: string | null
          technology: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      v_price_references_latest: {
        Row: {
          asset_id: string | null
          asset_name: string | null
          asset_slug: string | null
          asset_type: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          data_source_id: string | null
          fetched_at: string | null
          id: string | null
          original_data: Json | null
          price: number | null
          price_display: string | null
          price_high: number | null
          price_low: number | null
          reference_date: string | null
          reference_type: string | null
          source_identifier: string | null
          source_name: string | null
          technology: string | null
          unit: string | null
          updated_at: string | null
          vintage_year: number | null
          volume: number | null
          volume_unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_normalized_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_references_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
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
      consume_rate_limit: {
        Args: {
          p_key: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          reset_in_seconds: number
        }[]
      }
      prune_rate_limits: {
        Args: { p_older_than_seconds?: number }
        Returns: number
      }
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
      prune_old_references: { Args: never; Returns: undefined }
      refresh_price_series: { Args: never; Returns: undefined }
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
