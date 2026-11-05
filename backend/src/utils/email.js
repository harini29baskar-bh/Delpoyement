export async function sendLinkEmail({ to, subject, url }) {
  const scriptUrl = process.env.GMAIL_SCRIPT_URL;
  const secret = process.env.GMAIL_SCRIPT_SECRET;

  if (!scriptUrl || !secret) {
    throw new Error("Gmail Apps Script configuration is missing");
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret,
      to,
      subject,
      url
    }),
    redirect: "follow"
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(`Email failed: ${result.message || "Unknown error"}`);
  }

  console.log("Activation email sent successfully");
  return true;
}