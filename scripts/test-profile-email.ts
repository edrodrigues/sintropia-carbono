import { sendProfileCompletionEmail } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const testEmail = 'ed.ufpe@gmail.com';
  const testName = 'Edmilson Rodrigues';

  console.log(`Sending test profile completion email to ${testEmail}...`);
  
  try {
    const result = await sendProfileCompletionEmail(testEmail, testName);
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Data:', result.data);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('💥 Error in test script:', error);
  }
}

main();
