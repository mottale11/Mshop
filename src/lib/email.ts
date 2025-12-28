import { NextResponse } from 'next/server';

interface EmailPayload {
    to: string;
    subject: string;
    htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: EmailPayload) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;

    console.log('--- Email Debug ---');
    console.log('BREVO_API_KEY exists:', !!apiKey);
    console.log('SENDER_EMAIL exists:', !!senderEmail);
    if (apiKey) console.log('BREVO_API_KEY length:', apiKey.length);
    console.log('SENDER_EMAIL value:', senderEmail);
    console.log('-------------------');

    if (!apiKey || !senderEmail) {
        throw new Error('Missing Brevo API Key or Sender Email');
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: senderEmail, name: 'M-Shop' },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Brevo API Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}
