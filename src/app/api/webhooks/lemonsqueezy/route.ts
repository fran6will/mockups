import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone();
    const event = await req.json();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set');
      return new Response('Server configuration error', { status: 500 });
    }

    // Verify signature
    const requestBody = await clonedReq.text();
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(requestBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const eventName = event.meta.event_name;
    const data = event.data;

    // Skip Philia products — they are handled by the Philia webhook
    const PHILIA_VARIANTS = new Set(['1303530', '1303612']);
    const eventVariantId = String(
      data.attributes?.variant_id ||
      data.attributes?.first_order_item?.variant_id ||
      ''
    );
    if (eventVariantId && PHILIA_VARIANTS.has(eventVariantId)) {
      console.log('Skipping Philia product event, variant:', eventVariantId);
      return new Response('Skipped (Philia product)', { status: 200 });
    }

    if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      const attributes = data.attributes;
      const userId = attributes.user_email; // Assuming email is passed or we need to lookup user by email

      // In a real app, we might pass user_id in custom_data. 
      // For now, let's assume we lookup by email or custom_data.
      // Let's try to find user by email if custom_data is not present.
      let targetUserId = event.meta.custom_data?.user_id;

      if (!targetUserId) {
        // Fallback: find user by email using Admin Auth API
        // Note: listUsers defaults to 50 users. We increase limit to 1000 to ensure we find the user.
        // In a production app with >1000 users, you should strictly rely on custom_data or implement pagination.
        const { data, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

        if (data?.users) {
          const foundUser = data.users.find(u => u.email?.toLowerCase() === attributes.user_email.toLowerCase());
          if (foundUser) {
            targetUserId = foundUser.id;
          }
        }

        if (userError || !targetUserId) {
          console.warn(`Could not find user for email ${attributes.user_email}:`, userError);
        }
      }

      if (targetUserId) {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            lemon_squeezy_id: data.id, // Use Lemon Squeezy ID as unique key
            user_id: targetUserId,
            status: attributes.status,
            variant_id: String(attributes.variant_id), // Ensure string format
            customer_id: String(attributes.customer_id),
            renews_at: attributes.renews_at,
            ends_at: attributes.ends_at,
            customer_portal_url: attributes.urls?.customer_portal,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error updating subscription:', error);
          return new Response('Database error', { status: 500 });
        }
      } else {
        console.warn('No user_id found for subscription event');
      }
    } else if (eventName === 'order_created') {
      const attributes = data.attributes;
      const { user_email, first_order_item } = attributes;
      const variantName = first_order_item?.variant_name || '';
      const productName = first_order_item?.product_name || '';
      const nameToCheck = (variantName + ' ' + productName).toLowerCase();

      let creditsToAdd = 0;
      if (nameToCheck.includes('starter')) creditsToAdd = 100;
      else if (nameToCheck.includes('creator')) creditsToAdd = 500;
      else if (nameToCheck.includes('agency')) creditsToAdd = 1000;
      // Legacy support or fallback
      else if (nameToCheck.includes('50 credits')) creditsToAdd = 50;

      if (creditsToAdd > 0) {
        let targetUserId = event.meta.custom_data?.user_id;

        // Find user if not in custom_data
        if (!targetUserId) {
          const { data: userData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const foundUser = userData?.users.find(u => u.email?.toLowerCase() === user_email.toLowerCase());
          if (foundUser) targetUserId = foundUser.id;
        }

        if (targetUserId) {
          await addCredits(supabase, targetUserId, user_email, creditsToAdd, `Purchased ${creditsToAdd} Credits`);
          console.log(`Added ${creditsToAdd} credits to user ${targetUserId}`);
        } else {
          console.warn(`User not found for credit purchase: ${user_email}`);
        }
      }
    } else if (eventName === 'subscription_payment_success') {
      // Grant monthly credits for Pro subscription
      const attributes = data.attributes;
      const userEmail = attributes.user_email;
      let targetUserId = event.meta.custom_data?.user_id;

      if (!targetUserId) {
        const { data: userData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const foundUser = userData?.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());
        if (foundUser) targetUserId = foundUser.id;
      }

      if (targetUserId) {
        // Grant 100 bonus credits
        await addCredits(supabase, targetUserId, userEmail, 100, 'Pro Membership Monthly Bonus');
        console.log(`Added 100 bonus credits to user ${targetUserId}`);
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

async function addCredits(supabase: any, userId: string, email: string, amount: number, description: string) {
  // 1. Get current credits
  const { data: currentCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  let newBalance = amount;

  if (currentCredits) {
    newBalance = (currentCredits.balance || 0) + amount;

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  } else {
    // Create new credit record
    const { error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        email: email,
        balance: amount,
        total_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) throw insertError;
  }

  // Log Transaction
  await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      amount: amount,
      type: 'credit',
      description: description,
      metadata: { timestamp: new Date().toISOString() }
    }]);
}
