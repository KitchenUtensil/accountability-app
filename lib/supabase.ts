import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcwemdrlnkazvoiwfpii.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjd2VtZHJsbmthenZvaXdmcGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MjU2MDcsImV4cCI6MjA2MDAwMTYwN30.yrYMqv-P3Xhgo8MzbGWLckQZodfgY8QS9O-98JNuw-E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})