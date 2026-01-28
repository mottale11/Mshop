import { NextResponse } from 'next/server';
import { initiatePayHeroCardPayment } from '@/lib/payhero';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, reference, customer } = body;

        console.log('Initiating PayHero Card Payment:', { amount, reference });

        const result = await initiatePayHeroCardPayment({
            amount,
            reference,
            customer,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders` // Redirect here on success?
        });

        console.log('PayHero Response:', result);

        if (result.status === true || result.success === true) {
            return NextResponse.json({ success: true, data: result });
        } else {
            return NextResponse.json({ success: false, message: result.message || 'Payment initiation failed' });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
