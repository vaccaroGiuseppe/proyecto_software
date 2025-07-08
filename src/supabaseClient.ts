import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://uacjxlnkfsfgyugyggkh.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhY2p4bG5rZnNmZ3l1Z3lnZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTE4NDYsImV4cCI6MjA2NDM4Nzg0Nn0.gAGtzmgu8i3q5fvXfpUQcJwMF-F5R_pK9sJB43ZLU-I";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);