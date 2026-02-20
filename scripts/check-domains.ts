import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const { data } = await resend.domains.list();
  console.log('Domains:', JSON.stringify(data, null, 2));
}
main().catch(console.error);
