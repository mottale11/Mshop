import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Important: Use server-side secure client if possible, but for now using lib

export async function POST(request: Request) {
    try {
        // Parse the callback data
        const body = await request.json();
        console.log('Payment Callback Received:', JSON.stringify(body, null, 2));

        const paymentData = body.response; // Structure based on doc
        const success = body.status;

        // Optionally: Update order status in database directly here
        // if (success) {
        //     await supabase.from('orders').update({ payment_status: 'paid' }).eq(...)
        // }

        // Always acknowledge with 200 OK
        return new NextResponse('ok', { status: 200 });

    } catch (error) {
        console.error('Callback Error:', error);
        return new NextResponse('error', { status: 500 });
    }
}
