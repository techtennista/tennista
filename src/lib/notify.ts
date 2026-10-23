import "server-only";

const inbox = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "tech@tennistafoundation.org";
const fromAddress =
  process.env.RESEND_FROM?.trim() || "Tennista Foundation <beth.t@example.com>";

function resendKey() {
  return process.env.RESEND_KEY?.trim() || process.env.RESEND_API_KEY?.trim() || "";
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = resendKey();
  if (!apiKey) return { skipped: true as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend send failed", response.status, detail);
    return { ok: false as const, status: response.status };
  }

  return { ok: true as const };
}

export async function notifyInbox({
  type,
  name,
  email,
  subject,
  message,
}: {
  type: string;
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
}) {
  try {
    await sendEmail({
      to: inbox,
      subject: `New ${type.replaceAll("_", " ")} — Tennista`,
      html: `
        <p>A new <strong>${type.replaceAll("_", " ")}</strong> submission arrived.</p>
        <p><strong>Name:</strong> ${name || "—"}<br/>
        <strong>Email:</strong> ${email || "—"}<br/>
        <strong>Subject:</strong> ${subject || "—"}</p>
        <p>${(message || "").replaceAll("<", "&lt;")}</p>
        <p>Review it in admin → Forms.</p>
      `,
    });
  } catch (error) {
    console.error("Unable to notify inbox", error);
  }
}

export async function sendAdminInvite({
  email,
  roleLabel,
  invitedBy,
  url,
}: {
  email: string;
  roleLabel: string;
  invitedBy: string;
  url: string;
}) {
  try {
    return await sendEmail({
      to: email,
      subject: "You're invited to Tennista Admin",
      html: `
        <p>Hi,</p>
        <p>${invitedBy} invited you to help maintain the Tennista Foundation website as a <strong>${roleLabel}</strong>.</p>
        <p>Set up your account here (the link expires in 7 days):</p>
        <p><a href="${url}">${url}</a></p>
        <p>You'll choose your name and password, then you can sign in at the admin desk.</p>
        <p>— Tennista Foundation</p>
      `,
    });
  } catch (error) {
    console.error("Unable to send admin invite", error);
    return { ok: false as const, status: 0 };
  }
}

export async function sendNewsletterWelcome({
  email,
  firstName,
}: {
  email: string;
  firstName?: string | null;
}) {
  try {
    await sendEmail({
      to: email,
      subject: "You're on the Tennista list",
      html: `
        <p>Hi ${firstName || "there"},</p>
        <p>Thanks for joining the Tennista Foundation newsletter. We'll send court stories, junior tennis news, and ways to get involved.</p>
        <p>— Tennista Foundation</p>
      `,
    });
  } catch (error) {
    console.error("Unable to send newsletter welcome", error);
  }
}
