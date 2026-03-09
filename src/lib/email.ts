/**
 * Email utilities — notification helpers
 * Currently no external email provider. Auth uses direct magic link (no email needed).
 * To add email later: plug in any HTTP-based email API (Brevo, SendGrid, etc.) in sendNotification().
 */

interface SendNotificationParams {
  to: string;
  subject: string;
  html: string;
}

/** Send a notification email (no-op until email provider is configured) */
export async function sendNotification(
  { to, subject }: SendNotificationParams,
): Promise<{ success: boolean }> {
  console.log(`[email] Would send "${subject}" to ${to} — no email provider configured`);
  return { success: false };
}

/** Build notification email HTML */
export function buildNotificationEmail(
  heading: string,
  body: string,
  ctaUrl?: string,
  ctaText?: string,
): string {
  const ctaHtml = ctaUrl && ctaText
    ? `<div style="text-align: center; margin: 24px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background: #0077B6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">${ctaText}</a>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #0077B6; font-size: 24px; margin: 0;">${heading}</h1>
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6;">${body}</p>
  ${ctaHtml}
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
  <p style="color: #9CA3AF; font-size: 12px; text-align: center;">Žnjan Community — znjan.com</p>
</body>
</html>`;
}
