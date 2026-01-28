import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpAdmin() {
    const email = 'mosesmwai100@gmail.com';
    const password = '$Moses26';

    console.log(`Attempting to sign up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: 'Admin',
                last_name: 'User',
            },
        },
    });

    if (error) {
        console.error('Error signing up:', error.message);
        // If user already exists, that's fine, we just want to ensure they exist.
        // However, with sign up, we can't force the password if they exist.
        // We'll assume if they exist, the user knows the password or can reset it.
    } else {
        console.log('Sign up successful (or confirmation email sent).');
        if (data.user) {
            console.log(`User ID: ${data.user.id}`);
        }
    }
}

signUpAdmin();
