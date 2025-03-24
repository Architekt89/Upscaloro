// Script to update a user's subscription tier
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - hardcoded for this script
const supabaseUrl = 'https://vzlzfapqipfcuoefpudf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bHpmYXBxaXBmY3VvZWZwdWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE0MDk5NTAsImV4cCI6MjAyNzAwNTk1MH0.hFjzJU2CQdOdw8-LiQHBnYzJlS1UBF1AEVrUgL7M1aY';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get email and new tier from command line arguments
const email = process.argv[2];
const newTier = process.argv[3];

if (!email || !newTier) {
  console.error('Usage: node update_subscription.js <email> <tier>');
  console.error('Example: node update_subscription.js user@example.com enterprise');
  process.exit(1);
}

async function updateSubscription() {
  try {
    console.log(`Updating subscription for ${email} to ${newTier}...`);
    
    // First check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, subscription_tier')
      .eq('email', email);
    
    if (userError) {
      console.error('Error finding user:', userError);
      process.exit(1);
    }
    
    if (!userData || userData.length === 0) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log('Current user data:', userData[0]);
    
    // Update the user's subscription tier
    const { data, error } = await supabase
      .from('users')
      .update({ subscription_tier: newTier })
      .eq('email', email);
    
    if (error) {
      console.error('Error updating subscription:', error);
      process.exit(1);
    }
    
    console.log(`Successfully updated ${email}'s subscription to ${newTier}`);
    
    // Verify the update
    const { data: updatedData, error: verifyError } = await supabase
      .from('users')
      .select('email, subscription_tier')
      .eq('email', email);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Updated user data:', updatedData[0]);
    }
  } catch (error) {
    console.error('Exception occurred:', error);
  }
}

updateSubscription(); 