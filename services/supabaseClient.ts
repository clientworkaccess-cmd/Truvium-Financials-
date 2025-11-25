import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tbzzynprhvhwonlcaksg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRienp5bnByaHZod29ubGNha3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODEyMDksImV4cCI6MjA3OTU1NzIwOX0.LlwS4JkkA5cvVLLFMDWI4oOWDY30mW9LPKE1N2NT9N4';

export const supabase = createClient(supabaseUrl, supabaseKey);