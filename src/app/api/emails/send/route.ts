import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { generateOrderPlacedEmail, generateOrderStatusEmail } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, to, order, items, status } = body;

        if (!to || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let subject = '';
        let htmlContent = '';

        switch (type) {
            case 'ORDER_PLACED':
                subject = `Order Confirmation #${order.id.slice(0, 8).toUpperCase()}`;
                htmlContent = generateOrderPlacedEmail(order, items);
                break;
            case 'ORDER_STATUS_UPDATE':
                subject = `Order Update #${order.id.slice(0, 8).toUpperCase()}`;
                htmlContent = generateOrderStatusEmail(order, status);
                break;
            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        await sendEmail({ to, subject, htmlContent });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
