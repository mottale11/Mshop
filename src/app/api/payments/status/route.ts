import { NextResponse } from 'next/server';
import { checkTransactionStatus } from '@/lib/lipia';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.json(
            { success: false, message: 'Transaction reference is required' },
            { status: 400 }
        );
    }

    try {
        const result = await checkTransactionStatus(reference);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Payment Status Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to check status' },
            { status: 500 }
        );
    }
}
