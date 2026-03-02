import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xjaldbrcuocjthlxexbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYWxkYnJjdW9janRobHhleGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTk0NTAsImV4cCI6MjA4Nzk3NTQ1MH0.k3yr4RhlR_WqKFuU3c2omWEMvtADzGlAc0otj582Y1M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
