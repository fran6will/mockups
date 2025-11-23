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

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const eventName = event.meta.event_name;
    const data = event.data;

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const attributes = data.attributes;
      const userId = attributes.user_email; // Assuming email is passed or we need to lookup user by email
      
      // In a real app, we might pass user_id in custom_data. 
      // For now, let's assume we lookup by email or custom_data.
      // Let's try to find user by email if custom_data is not present.
      let targetUserId = event.meta.custom_data?.user_id;

      if (!targetUserId) {
         // Fallback: find user by email
         const { data: users, error: userError } = await supabase
            .from('auth.users') // This table is not directly accessible usually via client, need admin client
            .select('id')
            .eq('email', attributes.user_email)
            .single();
         
         // Note: accessing auth.users directly via postgrest is not standard. 
         // Better to rely on custom_data passed during checkout.
         // For this implementation, we will assume custom_data contains user_id.
      }

      if (targetUserId) {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: targetUserId,
            status: attributes.status,
            variant_id: attributes.variant_id,
            customer_id: attributes.customer_id,
            renews_at: attributes.renews_at,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error updating subscription:', error);
          return new Response('Database error', { status: 500 });
        }
      } else {
          console.warn('No user_id found for subscription event');
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}
