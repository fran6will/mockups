import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // 1. Select all 'batch-generated' products
        const { data: products, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('id, title')
            .contains('tags', ['batch-generated']);

        if (fetchError) throw fetchError;

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No batch products found to update.' });
        }

        const ids = products.map(p => p.id);

        // 2. Update them to be Public and Active
        const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({ is_public: true, status: 'approved' })
            .in('id', ids);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: `Successfully published ${products.length} batch products.`,
            updated_ids: ids
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
