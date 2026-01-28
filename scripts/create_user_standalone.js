const { createClient } = require('@supabase/supabase-js');

// HARDCODED KEYS to avoid dotenv issues
const supabaseUrl = 'https://brbgsvvwiglearaubhhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYmdzdnZ3aWdsZWFyYXViaGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDI4MzEsImV4cCI6MjA4MjI3ODgzMX0.SSYO67ZpTGWOo5immH_EAQm-48TsgvQ_K669DxoKTCo';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpUser() {
    const email = 'mosesmwai100@gmail.com';
    const password = '@Moses26';

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
        if (data.user) {
            console.log('User ID:', data.user.id);
        }
        console.log('IMPORTANT: Now re-run the "make_admin_user.sql" in Supabase SQL Editor.');
    }
}

signUpUser();
