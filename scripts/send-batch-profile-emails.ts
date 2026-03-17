import { sendProfileCompletionEmail } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const emails = [
  "sondra@heartstonepictures.com",
  "amba.mali.ouaga@fasonet.bf",
  "kevinmundt@hotmail.com",
  "g.agerobin.son4.8.4@gmail.com",
  "consmali@intenet.ne",
  "hr.de.u.s@gmail.com",
  "toddnc@icloud.com",
  "estanislau18@hotmail.com",
  "co.ns.u.lat.m.alia.bi.djan@gmail.com",
  "ja.mal.j.oeca.rt.e.r@gmail.com",
  "maureen.lang@brookstonecm.com",
  "marcel@korper.nl",
  "benjamin@korper.nl",
  "jenhotlanta@yahoo.com",
  "n.y.a.eg.e.r44.1@gmail.com",
  "cfabian@egtax.com",
  "support@korper.nl",
  "ksnelling@trammellcrow.com",
  "brendgen@dacon.eu",
  "elianesanches@pe.senac.br",
  "admin@shalomcenterinc.org",
  "d.k.ennedy1.98.7@gmail.com",
  "a.m.m.al.i.5.2.7@gmail.com",
  "lichtplanung@gesa-gatzke.de",
  "j.en.ia.h.49@gmail.com",
  "rdu_96@hotmail.com",
  "pwherber@yahoo.com",
  "x.e.bi.cam.a563@gmail.com",
  "heidip5@aol.com",
  "k.am.ekum.a.0.05@gmail.com",
  "wh.i.t.esop@gmail.com",
  "a.b.ey.ta.d.ad.4.1@gmail.com",
  "wyldhoneyimports@yahoo.com",
  "dboswell@joshuasrci.com",
  "1.3.r.o.wla.n.c@gmail.com",
  "laurencassidy@ymail.com",
  "deanl47@yahoo.com",
  "bkbblb2@hotmail.com",
  "fer.e.b.au.er@gmail.com",
  "info@everysecurity.nl",
  "finance@telus.com",
  "j.e.ss.b.e.tt.y14@gmail.com",
  "hs0.1.167.2.4@gmail.com"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log(`Starting batch send of profile completion email to ${emails.length} users...`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const email of emails) {
    try {
      console.log(`Sending to ${email}...`);
      const result = await sendProfileCompletionEmail(email, 'Membro da Comunidade');
      
      if (result.success) {
        successCount++;
        console.log(`✅ Success for ${email}`);
      } else {
        failureCount++;
        console.error(`❌ Failed for ${email}:`, result.error);
      }
    } catch (error) {
      failureCount++;
      console.error(`💥 Error sending to ${email}:`, error);
    }
    
    // Sleep for 200ms to avoid rate limiting
    await sleep(200);
  }

  console.log('--- BATCH COMPLETE ---');
  console.log(`Total Emails Processed: ${emails.length}`);
  console.log(`Successfully Sent: ${successCount}`);
  console.log(`Failed to Send: ${failureCount}`);
}

main();
