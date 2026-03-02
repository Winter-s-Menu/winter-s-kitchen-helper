import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjaldbrcuocjthlxexbz.supabase.co';
const supabaseAnonKey = 'sb_publishable_vJ-WrCrC2n3tP3TG7Vcvvw_l-MttXRH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
