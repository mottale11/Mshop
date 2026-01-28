import { NextResponse } from 'next/server';
import { initiateStkPush, LipiaParams } from '@/lib/lipia';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone_number, amount, order_id } = body;

        if (!phone_number || !amount) {
            return NextResponse.json(
                { success: false, message: 'Phone number and amount are required' },
                { status: 400 }
            );
        }

        // Construct payload
        const payload: LipiaParams = {
            phone_number,
            amount,
            external_reference: order_id || `order_${Date.now()}`,
            // Assuming your domain is configured, otherwise callback might fail or need ngrok
            // callback_url: "https://your-domain.com/api/payments/callback", 
            metadata: {
                order_id: order_id,
            }
        };

        const result = await initiateStkPush(payload);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('STK Push Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
