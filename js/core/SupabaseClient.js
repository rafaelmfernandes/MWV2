const SUPABASE_URL = 'https://ctoyotiewdtxxrrewrpo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cojBPOYTXDb35Ob5i5qsYw_6AdbVMK2';

const supabaseClient = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;