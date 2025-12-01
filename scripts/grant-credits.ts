
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TARGET_USER_ID = 'fc20fa92-7bad-4d1e-af9e-aac3bf47d107';
const CREDITS_TO_ADD = 100;

async function grantCredits() {
    console.log(`Granting ${CREDITS_TO_ADD} credits to user ${TARGET_USER_ID}...`);

    // 0. Fetch user email from Auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(TARGET_USER_ID);

    if (userError || !user) {
        console.error('Error fetching user from Auth:', userError);
        return;
    }

    const userEmail = user.email;
    console.log(`Found user email: ${userEmail}`);

    // 1. Check if user exists in user_credits
    const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', TARGET_USER_ID)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error('Error fetching current credits:', fetchError);
        return;
    }

    let newBalance = CREDITS_TO_ADD;
    let error;

    if (currentCredits) {
        newBalance = currentCredits.balance + CREDITS_TO_ADD;
        console.log(`Current balance: ${currentCredits.balance}. New balance will be: ${newBalance}`);

        const { error: updateError } = await supabase
            .from('user_credits')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('user_id', TARGET_USER_ID);
        error = updateError;
    } else {
        console.log(`User has no credit record. Creating new record with ${CREDITS_TO_ADD} credits.`);
        const { error: insertError } = await supabase
            .from('user_credits')
            .insert({
                user_id: TARGET_USER_ID,
                balance: newBalance,
                email: userEmail // Include email
            });
        error = insertError;
    }

    if (error) {
        console.error('Error updating/inserting credits:', error);
    } else {
        console.log(`Successfully granted ${CREDITS_TO_ADD} credits to ${TARGET_USER_ID} (${userEmail}).`);
    }
}

grantCredits();
