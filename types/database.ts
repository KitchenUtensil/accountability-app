/**
 * TypeScript definitions for the Supabase database schema
 */

export interface Profile {
  id: number;
  created_at: string;
  display_name: string | null;
  user_id: string | null;
}

export interface Group {
  id: number;
  name: string;
  created_at: string | null;
  created_by: string | null;
}

export interface GroupMember {
  id: number;
  group_id: number;
  joined_at: string | null;
  user_id: string | null;
}

export interface Habit {
  id: number;
  group_id: number;
  user_id: number;
  name: string;
  created_at: string | null;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  user_id: number | null;
  date: string;
  completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at'>;
        Update: Partial<Omit<Group, 'id' | 'created_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: Omit<GroupMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<GroupMember, 'id' | 'joined_at'>>;
      };
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'created_at'>;
        Update: Partial<Omit<Habit, 'id' | 'created_at'>>;
      };
      habit_completions: {
        Row: HabitCompletion;
        Insert: Omit<HabitCompletion, 'id'>;
        Update: Partial<Omit<HabitCompletion, 'id'>>;
      };
    };
  };
} 