import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== Resend Debug ===');
  
  const { data: audiences } = await resend.audiences.list();
  console.log('Audiences:', audiences?.data?.length);
  
  if (audiences?.data) {
    for (const audience of audiences.data) {
      console.log(`\nFetching contacts from ${audience.name} (${audience.id})...`);
      await sleep(1000);
      
      let contacts: any[] = [];
      let cursor: string | undefined;
      let hasMore = true;
      
      while (hasMore) {
        const listOptions: { audienceId: string; limit: number } = {
          audienceId: audience.id,
          limit: 100,
        };
        
        const { data, error } = await resend.contacts.list(listOptions);
        
        if (error) {
          console.log('Error:', error.message);
          hasMore = false;
          continue;
        }
        
        if (data?.data) {
          contacts = [...contacts, ...data.data];
        }
        
        cursor = (data as unknown as { next_cursor?: string })?.next_cursor;
        hasMore = !!cursor;
        
        if (cursor) {
          console.log('Getting more...');
          await sleep(600);
        }
      }
      
      console.log(`Found ${contacts.length} contacts`);
      if (contacts.length > 0) {
        console.log('First contact:', contacts[0].email);
      }
    }
  }
}

main().catch(console.error);
