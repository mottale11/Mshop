/**
 * LIPA NA M-PESA (STK Push) – Safaricom Daraja API Integration
 * ----------------------------------------------------------------
 * All credentials are read from environment variables.
 *
 * Required env vars:
 *   MPESA_CONSUMER_KEY
 *   MPESA_CONSUMER_SECRET
 *   MPESA_SHORTCODE
 *   MPESA_PASSKEY
 *   NEXT_PUBLIC_APP_URL   (e.g. https://yourstore.com or ngrok URL for testing)
 *   MPESA_ENV             "sandbox" | "production"  (defaults to "sandbox")
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StkPushParams {
    phoneNumber: string;   // format: 2547XXXXXXXX
    amount: number;        // integer KES amount (min 1)
    orderId: string;       // your internal order ID
    description?: string;  // short description shown on phone
}

export interface StkPushResult {
    success: boolean;
    checkoutRequestId?: string;
    merchantRequestId?: string;
    customerMessage?: string;
    rawResponse?: Record<string, any>;
    error?: string;
}

// ─── Token Cache ──────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;       // Unix ms

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEnv(key: string): string {
    const val = process.env[key];
    if (!val) throw new Error(`Missing environment variable: ${key}`);
    return val;
}

function getBaseUrl(): string {
    const env = process.env.MPESA_ENV ?? 'sandbox';
    return env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
}

/**
 * MPESA_SHORTCODE_TYPE controls the transaction type.
 * Set to "till" for Buy Goods (Till) numbers → CustomerBuyGoodsOnline
 * Set to "paybill" (or leave unset) for Paybill numbers → CustomerPayBillOnline
 */
function getTransactionType(): string {
    const type = process.env.MPESA_SHORTCODE_TYPE ?? 'till';
    return type === 'paybill' ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline';
}

function generateTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate()),
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds()),
    ].join('');
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    const raw = shortcode + passkey + timestamp;
    return Buffer.from(raw).toString('base64');
}

function formatPhone(phone: string): string {
    // Normalise to 2547XXXXXXXX
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
    if (cleaned.startsWith('254')) return cleaned;
    return '254' + cleaned;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export async function getMpesaToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid (with 30s buffer)
    if (cachedToken && now < tokenExpiresAt - 30_000) {
        return cachedToken;
    }

    const consumerKey = getEnv('MPESA_CONSUMER_KEY');
    const consumerSecret = getEnv('MPESA_CONSUMER_SECRET');
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
        },
    });


    if (!response.ok) {
        const text = await response.text();
        console.error(`[M-Pesa] OAuth error ${response.status} from ${baseUrl}:`, text);
        throw new Error(`Daraja OAuth failed (${response.status}): ${text}`);
    }


    const data = await response.json();
    cachedToken = data.access_token;
    // expires_in is in seconds
    tokenExpiresAt = now + (parseInt(data.expires_in, 10) || 3600) * 1000;

    console.log('[M-Pesa] Access token refreshed, expires in', data.expires_in, 's');
    return cachedToken!;
}

// ─── STK Push ─────────────────────────────────────────────────────────────────

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
    const { phoneNumber, amount, orderId, description } = params;

    const shortcode = getEnv('MPESA_SHORTCODE');
    const passkey   = getEnv('MPESA_PASSKEY');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://yourdomain.com');

    const callbackUrl = `${appUrl}/api/mpesa/callback`;


    const timestamp = generateTimestamp();
    const password  = generatePassword(shortcode, passkey, timestamp);
    const phone     = formatPhone(phoneNumber);
    const baseUrl   = getBaseUrl();

    console.log('[M-Pesa] Initiating STK Push', { phone, amount, orderId, callbackUrl });

    try {
        const token = await getMpesaToken();

        const transactionType = getTransactionType();
        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: transactionType,
            Amount: Math.ceil(amount),       // Safaricom requires integer
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: callbackUrl,
            AccountReference: orderId,
            TransactionDesc: description ?? `Payment for order ${orderId}`,
        };

        console.log('[M-Pesa] TransactionType:', transactionType);

        const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('[M-Pesa] STK Push response:', data);

        if (!response.ok || data.ResponseCode !== '0') {
            return {
                success: false,
                error: data.errorMessage ?? data.ResponseDescription ?? 'STK Push failed',
                rawResponse: data,
            };
        }

        return {
            success: true,
            checkoutRequestId: data.CheckoutRequestID,
            merchantRequestId: data.MerchantRequestID,
            customerMessage: data.CustomerMessage,
            rawResponse: data,
        };
    } catch (err: any) {
        console.error('[M-Pesa] STK Push error:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

// ─── STK Query (Poll Status from Safaricom) ──────────────────────────────────

export async function queryStkPushStatus(checkoutRequestId: string) {
    const shortcode = getEnv('MPESA_SHORTCODE');
    const passkey   = getEnv('MPESA_PASSKEY');
    const baseUrl   = getBaseUrl();
    const timestamp = generateTimestamp();
    const password  = generatePassword(shortcode, passkey, timestamp);

    const token = await getMpesaToken();

    const response = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
        }),
    });

    const data = await response.json();
    console.log('[M-Pesa] STK Query response:', data);
    return data;
}
