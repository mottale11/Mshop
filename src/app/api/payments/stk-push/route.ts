import { NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { createAdminClient } from '@/lib/supabase-admin';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone_number, amount, order_id } = body;

        if (!phone_number || !amount || !order_id) {
            return NextResponse.json(
                { success: false, message: 'phone_number, amount and order_id are required' },
                { status: 400 }
            );
        }

        // Initiate STK Push via Safaricom Daraja
        const result = await initiateStkPush({
            phoneNumber: phone_number,
            amount: Math.ceil(Number(amount)),
            orderId: order_id,
            description: `Mshop order ${order_id}`,
        });

        if (!result.success || !result.checkoutRequestId) {
            return NextResponse.json(
                { success: false, message: result.error ?? 'STK Push failed' },
                { status: 502 }
            );
        }

        // Persist a PENDING transaction row in the database
        const adminClient = createAdminClient();
        const { error: dbError } = await adminClient
            .from('mpesa_transactions')
            .insert({
                order_id,
                checkout_request_id: result.checkoutRequestId,
                merchant_request_id: result.merchantRequestId,
                phone_number,
                amount: Math.ceil(Number(amount)),
                status: 'PENDING',
            });

        if (dbError) {
            // Log but don't block – STK was already sent
            console.error('[M-Pesa] Failed to persist transaction:', dbError);
        }


        return NextResponse.json({
            success: true,
            checkoutRequestId: result.checkoutRequestId,
            customerMessage: result.customerMessage,
        });

    } catch (error: any) {
        console.error('[STK Push Route] Error:', error);
        return NextResponse.json(
            { success: false, message: error.message ?? 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
