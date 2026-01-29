export const initiatePayHeroCardPayment = async ({
    amount,
    currency = 'KES',
    reference,
    customer,
    redirectUrl
}: {
    amount: number;
    currency?: string;
    reference: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip?: string;
        country: string;
    };
    redirectUrl: string;
}) => {
    const username = process.env.PAYHERO_API_USERNAME;
    const password = process.env.PAYHERO_API_PASSWORD;
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    const payload = {
        request_type: "payment",
        provider: "pesapal", // Defaulting to Pesapal for cards
        amount,
        currency,
        country: customer.country || "KE",
        reference,
        description: `Payment for Order ${reference}`,
        customer: {
            first_name: customer.firstName,
            last_name: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: {
                street: customer.address,
                city: customer.city,
                state: customer.state,
                zip: customer.zip || "00100",
                country: customer.country || "KE"
            }
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/payhero/callback`,
        return_url: redirectUrl // Some providers look for this
    };

    try {
        const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            try {
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || `PayHero API Error: ${response.status} ${response.statusText}`);
            } catch (e) {
                // If parsing fails, it's likely HTML or text
                throw new Error(`PayHero API Error (${response.status}): ${text.slice(0, 200)}...`);
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('PayHero Payment Error:', error);
        throw error;
    }
};
