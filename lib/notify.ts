// Adviser notifications. Sends real email through Resend when
// RESEND_API_KEY is set (https://resend.com — free tier covers a
// practice this size); otherwise logs so nothing silently disappears.
//
// Env:
//   RESEND_API_KEY  — enables real email
//   NOTIFY_EMAIL    — recipient; falls back to ADVISER_EMAIL
//   NOTIFY_FROM     — sender; defaults to Resend's onboarding sender,
//                     which works before a domain is verified.

export async function notifyAdviser(subject: string, text: string): Promise<void> {
  const to = process.env.NOTIFY_EMAIL ?? process.env.ADVISER_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !to) {
    console.log(`[notify] ${subject} — ${text}` + (apiKey ? "" : " (email not configured)"));
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "BMK CRM <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[notify] email send failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("[notify] email send error:", e instanceof Error ? e.message : e);
  }
}
