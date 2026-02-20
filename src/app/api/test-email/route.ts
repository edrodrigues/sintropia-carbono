import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET() {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'Sintropia <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello from Sintropia',
      html: '<h1>Hello world</h1>',
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
