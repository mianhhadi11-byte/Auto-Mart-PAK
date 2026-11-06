import 'server-only';
import { SITE } from './constants';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendWelcomeEmail(email: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { sent: false, reason: 'RESEND_API_KEY is not configured.' };
  const from = process.env.NEWSLETTER_FROM?.trim() || 'MIC TECH <newsletter@mictech.news>';
  const unsubscribe = `${SITE.url.replace(/\/$/, '')}/unsubscribe?email=${encodeURIComponent(email)}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'You are on the MIC TECH briefing list',
        html: `
          <div style="background:#090b0c;color:#f4f6f5;padding:40px;font-family:Arial,sans-serif">
            <p style="letter-spacing:3px;color:#c9f74a;font-size:12px">MIC TECH</p>
            <h1 style="font-size:28px;margin:16px 0">The signal in technology.</h1>
            <p style="color:#b9c1be;line-height:1.7">You are subscribed to the MIC TECH weekday briefing. One sharp email with the context behind the headline.</p>
            <p style="color:#b9c1be;line-height:1.7">No noise, no sponsored scores, no hot takes you did not ask for.</p>
            <p style="margin-top:32px"><a href="${SITE.url}" style="color:#c9f74a">Read the latest reporting →</a></p>
            <p style="margin-top:40px;font-size:12px;color:#6f7a76">You received this because ${escapeHtml(email)} subscribed at mictech.news. <a href="${unsubscribe}" style="color:#8f9a96">Unsubscribe</a>.</p>
          </div>
        `,
        text: `MIC TECH — The signal in technology.\n\nYou are subscribed to the MIC TECH weekday briefing.\n\nRead the latest: ${SITE.url}\n\nUnsubscribe: ${unsubscribe}`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { sent: false, reason: `Resend returned ${response.status}.` };
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : 'Email delivery failed.' };
  }
}
