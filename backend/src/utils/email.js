
export async function sendLinkEmail({ to, subject, url }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "V2 CodeZero <onboarding@resend.dev>",
      to: [to],
      subject,
      text: `Open this secure link: ${url}`
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Resend email failed: ${JSON.stringify(result)}`);
  }

  console.log("Email sent successfully:", result.id);
  return true;
}
