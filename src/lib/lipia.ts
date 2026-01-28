export interface LipiaStkPushResponse {
    success: boolean;
    status: string;
    message: string;
    data: {
        TransactionReference: string;
        ResponseCode: number;
        ResponseDescription: string;
    };
}

export interface LipiaParams {
    phone_number: string;
    amount: number;
    external_reference?: string;
    callback_url?: string;
    metadata?: Record<string, any>;
}

export async function initiateStkPush(params: LipiaParams): Promise<LipiaStkPushResponse> {
    const apiKey = process.env.LIPIA_API_KEY;
    const baseUrl = process.env.LIPIA_BASE_URL;

    if (!apiKey || !baseUrl) {
        throw new Error("Missing Lipia Configuration");
    }

    const response = await fetch(`${baseUrl}/payments/stk-push`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText);
    }

    return response.json();
}

export async function checkTransactionStatus(reference: string) {
    const apiKey = process.env.LIPIA_API_KEY;
    const baseUrl = process.env.LIPIA_BASE_URL;

    if (!apiKey || !baseUrl) {
        throw new Error("Missing Lipia Configuration");
    }

    const response = await fetch(`${baseUrl}/payments/status?reference=${reference}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText);
    }

    return response.json();
}
