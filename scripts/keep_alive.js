import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables if running locally
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function keepAlive() {
  console.log('📡 Sending Keep-Alive ping to Supabase...');

  try {
    // Perform a small write operation (INSERT) to ensure activity is recorded.
    // According to Supabase, write operations are more reliable for resetting the inactivity timer.
    const { error } = await supabase
      .from('search_logs')
      .insert([
        { query: 'heartbeat_ping', created_at: new Date().toISOString() }
      ]);

    if (error) {
      // If the table doesn't have data, it's still activity
      if (error.code === 'PGRST116') {
        console.log('✅ Ping successful (empty table, but activity recorded).');
      } else {
        console.error('❌ Database error during ping:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Ping successful! Project is active.');
    }
  } catch (err) {
    console.error('❌ Unexpected error during ping:', err);
    process.exit(1);
  }
}

keepAlive();
