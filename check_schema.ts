
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking subscriptions table schema...');

    // 1. Check column
    const { data: colData, error: colError } = await supabase
        .from('subscriptions')
        .select('lemon_squeezy_id')
        .limit(1);

    if (colError) {
        console.error('❌ Column Check Failed:', colError.message);
    } else {
        console.log('✅ Column Check Passed: "lemon_squeezy_id" exists.');
    }

    // 2. Check for duplicates for the specific user
    const userId = 'fcff10b6-5a13-4fd0-93a8-1b0167ac9006';
    const { data: subs, error: subError } = await supabase
        .from('subscriptions')
        .select('id, user_id, updated_at')
        .eq('user_id', userId);

    if (subError) {
        console.error('❌ Subscription Fetch Failed:', subError.message);
    } else {
        console.log(`ℹ️ Found ${subs?.length} subscription(s) for user ${userId}`);
        if (subs && subs.length > 1) {
            console.error('❌ DUPLICATES FOUND! You have multiple subscriptions for this user.');
            console.error('👉 This prevents the UNIQUE constraint from being created.');
            console.error('👉 ACTION: Run the cleanup script provided earlier.');
        } else if (subs && subs.length === 1) {
            console.log('✅ No duplicates found for this user.');
        }
    }

    // 3. Simulate Webhook Upsert
    console.log('Simulating Webhook Upsert...');

    const payload = {
        lemon_squeezy_id: "1666736",
        user_id: "fcff10b6-5a13-4fd0-93a8-1b0167ac9006",
        status: "active",
        variant_id: "1105373",
        customer_id: "7202910",
        renews_at: "2025-12-25T02:37:50.000000Z",
        ends_at: null,
        customer_portal_url: "https://copiecolle.lemonsqueezy.com/billing?expires=1764059878&test_mode=1&user=6000749&signature=881544dee1ee55356dd73ee1e2a49bc852d3895b93259c120792569ef9c2169d",
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('subscriptions')
        .upsert(payload, { onConflict: 'user_id' })
        .select();

    if (error) {
        console.error('❌ Webhook Upsert Failed:', error);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('✅ Webhook Upsert Succeeded!');
        console.log('Data:', data);
    }
}

checkSchema();
