import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';


/**
 * POST /api/mpesa/callback
 * Safaricom Daraja STK Push callback handler.
 *
 * Safaricom sends a JSON body of this shape:
 * {
 *   "Body": {
 *     "stkCallback": {
 *       "MerchantRequestID": "...",
 *       "CheckoutRequestID": "ws_CO_...",
 *       "ResultCode": 0,
 *       "ResultDesc": "The service request is processed successfully.",
 *       "CallbackMetadata": {
 *         "Item": [
 *           { "Name": "Amount",             "Value": 1 },
 *           { "Name": "MpesaReceiptNumber", "Value": "QFB12KL5RT" },
 *           { "Name": "Balance" },
 *           { "Name": "TransactionDate",    "Value": 20191219102115 },
 *           { "Name": "PhoneNumber",        "Value": 254712345678 }
 *         ]
 *       }
 *     }
 *   }
 * }
 *
 * On failure ResultCode is non-zero and CallbackMetadata is absent.
 */

function getMetadataItem(items: any[], name: string): any {
    const item = items?.find((i: any) => i.Name === name);
    return item?.Value ?? null;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Always log the full raw payload for debugging
        console.log('[M-Pesa Callback] Payload:', JSON.stringify(body, null, 2));

        const stkCallback = body?.Body?.stkCallback;

        if (!stkCallback) {
            console.error('[M-Pesa Callback] Invalid payload – missing Body.stkCallback');
            // Still return 200 so Safaricom stops retrying
            return new NextResponse('OK', { status: 200 });
        }

        const {
            CheckoutRequestID,
            MerchantRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata,
        } = stkCallback;

        const items: any[] = CallbackMetadata?.Item ?? [];

        const isSuccess = ResultCode === 0;
        const receiptNumber  = getMetadataItem(items, 'MpesaReceiptNumber');
        const amount         = getMetadataItem(items, 'Amount');
        const phoneNumber    = getMetadataItem(items, 'PhoneNumber');
        const transactionDate = getMetadataItem(items, 'TransactionDate');

        console.log('[M-Pesa Callback] Parsed:', {
            CheckoutRequestID,
            isSuccess,
            ResultCode,
            ResultDesc,
            receiptNumber,
            amount,
            phoneNumber,
        });

        // 1. Update the mpesa_transactions row
        const transactionUpdate: Record<string, any> = {
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            result_code: ResultCode,
            result_desc: ResultDesc,
            raw_callback: body,
            updated_at: new Date().toISOString(),
        };

        if (isSuccess) {
            transactionUpdate.mpesa_receipt_number = receiptNumber;
        }

        const adminClient = createAdminClient();
        const { data: txn, error: txnError } = await adminClient
            .from('mpesa_transactions')
            .update(transactionUpdate)
            .eq('checkout_request_id', CheckoutRequestID)
            .select('order_id')
            .single();

        if (txnError) {
            console.error('[M-Pesa Callback] Failed to update transaction:', txnError);
        }

        // 2. If successful, mark the linked order as Paid
        if (isSuccess && txn?.order_id) {
            const { error: orderError } = await adminClient
                .from('orders')
                .update({
                    status: 'Paid',
                    payment_reference: receiptNumber,
                })
                .eq('id', txn.order_id);

            if (orderError) {
                console.error('[M-Pesa Callback] Failed to update order:', orderError);
            } else {
                console.log(`[M-Pesa Callback] Order ${txn.order_id} marked as Paid ✓`);
            }
        }

        // Safaricom expects a plain 200 acknowledgement
        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('[M-Pesa Callback] Unhandled error:', error);
        // Return 200 anyway so Safaricom doesn't hammer us with retries
        return new NextResponse('OK', { status: 200 });
    }
}
