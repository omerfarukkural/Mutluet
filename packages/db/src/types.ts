export type Season = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kis'
export type EventStatus = 'taslak' | 'onay_bekliyor' | 'yayinda' | 'doldu' | 'suresi_doldu' | 'tamamlandi' | 'iptal'
export type UserRole = 'user' | 'volunteer' | 'member' | 'admin' | 'super_admin'
export type EventCategory = 'doga' | 'kamp' | 'hasta_ziyareti' | 'tanisma' | 'oyun' | 'sanat' | 'cevre' | 'egitim' | 'yemek' | 'spor' | 'kultur' | 'hackathon'
export type CompetitionType = 'bireysel' | 'takim' | 'sehir' | 'flash'
export type MembershipStatus = 'bekliyor' | 'aktif' | 'askida' | 'iptal'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          xp: number
          level: number
          streak_days: number
          bio: string | null
          city: string | null
          is_leader_willing: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          category: EventCategory
          skill_level: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_interests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_interests']['Insert']>
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          category: EventCategory
          status: EventStatus
          leader_id: string
          season: Season
          location_name: string | null
          location_lat: number | null
          location_lng: number | null
          city: string | null
          max_capacity: number
          current_participants: number
          event_date: string
          event_end_date: string | null
          xp_reward: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'current_participants' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'kayitli' | 'bekleme_listesi' | 'iptal' | 'tamamlandi'
          registered_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_registrations']['Row'], 'id' | 'registered_at'>
        Update: Partial<Database['public']['Tables']['event_registrations']['Insert']>
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          reference_id: string | null
          reference_type: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['xp_transactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      season_config: {
        Row: {
          id: string
          season_key: Season
          start_month: number
          start_day: number
          end_month: number
          end_day: number
          is_active: boolean
          admin_override: Season | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['season_config']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['season_config']['Insert']>
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          status: MembershipStatus
          member_number: string | null
          applied_at: string
          approved_at: string | null
          approved_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'applied_at'>
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: string
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
