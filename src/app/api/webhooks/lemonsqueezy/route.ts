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
          }, { onConflict: 'lemon_squeezy_id' });

        if (error) {
          console.error('Error updating subscription:', error);
          return new Response('Database error', { status: 500 });
        }
      } else {
        console.warn('No user_id found for subscription event');
      }
    } else if (eventName === 'order_created') {
      const attributes = data.attributes;
      const productId = attributes.first_order_item.product_id;
      const creditPackProductId = '703323'; // 50 Credits Pack Product ID

      // Check if this order is for the 50 Credits Pack
      if (String(productId) === String(creditPackProductId)) {
        const userEmail = attributes.user_email;
        let targetUserId = event.meta.custom_data?.user_id;

        // Find user if not in custom_data
        if (!targetUserId) {
          const { data: userData } = await supabase.auth.admin.listUsers();
          const foundUser = userData?.users.find(u => u.email === userEmail);
          if (foundUser) targetUserId = foundUser.id;
        }

        if (targetUserId) {
          // 1. Get current credits
          const { data: currentCredits } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

          let newBalance = 50;

          if (currentCredits) {
            newBalance = (currentCredits.balance || 0) + 50;

            const { error: updateError } = await supabase
              .from('user_credits')
              .update({
                balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', targetUserId);

            if (updateError) {
              console.error('Error updating user credits:', updateError);
              return new Response('Error updating user credits', { status: 500 });
            }
          } else {
            // Create new credit record
            const { error: insertError } = await supabase
              .from('user_credits')
              .insert({
                user_id: targetUserId,
                email: userEmail,
                balance: 50,
                total_used: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error inserting user credits:', insertError);
              return new Response('Error inserting user credits', { status: 500 });
            }
          }

          // Log Transaction
          await supabase
            .from('transactions')
            .insert([{
              user_id: targetUserId,
              amount: 50,
              type: 'credit',
              description: 'Purchased 50 Credits Pack',
              metadata: { order_id: data.id, product_id: productId }
            }]);

          console.log(`Added 50 credits to user ${targetUserId}`);
        } else {
          console.warn(`User not found for credit purchase: ${userEmail}`);
        }
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}
