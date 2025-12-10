
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetLimit() {
    // IP from the log: 108.214.43.11
    const ipToReset = '108.214.43.11';

    console.log(`Resetting limits for IP: ${ipToReset}`);

    const { error } = await supabaseAdmin
        .from('generations')
        .delete()
        .eq('ip_address', ipToReset);

    if (error) {
        console.error('Error resetting limit:', error);
    } else {
        console.log('Successfully deleted generation history for IP. Limit reset.');
    }
}

resetLimit();
