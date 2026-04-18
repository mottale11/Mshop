import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/payments/status?checkout_request_id=ws_CO_...
 *
 * Polls our own DB (updated by the Safaricom callback) so the frontend
 * can track payment status without calling Safaricom on every poll.
 *
 * Returns:
 *   { success: true,  status: 'PENDING' | 'SUCCESS' | 'FAILED', receipt?: string }
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkout_request_id');

    if (!checkoutRequestId) {
        return NextResponse.json(
            { success: false, message: 'checkout_request_id is required' },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabase
            .from('mpesa_transactions')
            .select('status, mpesa_receipt_number, result_desc, order_id')
            .eq('checkout_request_id', checkoutRequestId)
            .maybeSingle(); // returns null instead of error when row not found

        // Row not yet created (DB insert timing gap) — treat as PENDING
        if (!data) {
            return NextResponse.json({
                success: true,
                status: 'PENDING',
                receipt: null,
                resultDesc: 'Waiting for payment confirmation...',
                orderId: null,
            });
        }

        if (error) {
            console.error('[Payment Status] DB error:', error);
            return NextResponse.json(
                { success: false, message: 'Database error' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            status: data.status,              // PENDING | SUCCESS | FAILED
            receipt: data.mpesa_receipt_number,
            resultDesc: data.result_desc,
            orderId: data.order_id,
        });

    } catch (error: any) {
        console.error('[Payment Status Route] Error:', error);
        return NextResponse.json(
            { success: false, message: error.message ?? 'Failed to check status' },
            { status: 500 }
        );
    }
}
