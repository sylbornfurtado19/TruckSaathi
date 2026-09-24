import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    envVars[key.trim()] = vals.join('=').trim();
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Auth with:');
console.log('URL:', supabaseUrl);
console.log('Anon Key Present:', Boolean(supabaseAnonKey));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerification() {
  console.log('\n--- Step 1: Testing Invalid Credentials ---');
  const { data: invalidData, error: invalidError } = await supabase.auth.signInWithPassword({
    email: 'nonexistent_user_99@trucksaathi.in',
    password: 'wrong_password_999'
  });

  if (invalidError) {
    console.log('SUCCESS: Invalid credentials correctly rejected:', invalidError.message);
  } else {
    console.error('FAILURE: Invalid credentials were not rejected!');
  }

  console.log('\n--- Step 2: Testing Valid Auth / Sign Up Flow ---');
  const testEmail = `test.driver.${Date.now()}@trucksaathi.in`;
  const testPassword = 'SecurePassword!123';

  console.log('Attempting signup with test user:', testEmail);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test Driver User',
        role: 'Driver'
      }
    }
  });

  if (signUpError) {
    console.log('Sign up notice (e.g., signup disabled or confirm required):', signUpError.message);
  } else if (signUpData?.user) {
    console.log('SUCCESS: Auth User created:', signUpData.user.id);
    console.log('User Email:', signUpData.user.email);
    console.log('User Metadata Role:', signUpData.user.user_metadata?.role);

    if (signUpData.session) {
      console.log('SUCCESS: Active session created immediately.');
      console.log('Access token acquired:', Boolean(signUpData.session.access_token));
    } else {
      console.log('Info: User created but email confirmation is enabled in project settings.');
    }
  }

  console.log('\n--- Step 3: Checking Table Schema for Password Storage ---');
  const schemaPath = path.resolve('src/lib/supabase/schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Verify that public.users does NOT contain password fields
  const usersTableMatch = schemaContent.match(/CREATE TABLE IF NOT EXISTS public\.users \(([\s\S]*?)\);/);
  if (usersTableMatch) {
    const tableBody = usersTableMatch[1];
    const hasPassword = /password/i.test(tableBody);
    if (!hasPassword) {
      console.log('SUCCESS: public.users has NO password column. Passwords are handled safely by auth.users.');
    } else {
      console.error('WARNING: Found password field in public.users!');
    }
  }

  console.log('\n--- Step 4: Testing Table Connection & RLS Policy for Users ---');
  const { data: tableCheck, error: tableError } = await supabase.from('users').select('*').limit(1);
  if (tableError) {
    console.log('Database table check notice:', tableError.message);
  } else {
    console.log('SUCCESS: public.users table is accessible via client.');
  }

  console.log('\n--- Step 5: Testing Sign Out ---');
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error('Sign out error:', signOutError.message);
  } else {
    console.log('SUCCESS: Supabase signOut executed cleanly.');
  }
}

runVerification().catch(console.error);
