const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpUser() {
    const email = 'mosesmwai100@gmail.com';
    const password = '@Moses26'; // Using the updated password

    console.log(`Creating user: ${email}...`);

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
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully!');
        console.log('User ID:', data.user ? data.user.id : 'unknown');
        console.log('IMPORTANT: Now re-run the "make_admin_user.sql" in Supabase SQL Editor to make this user an admin.');
    }
}

signUpUser();
