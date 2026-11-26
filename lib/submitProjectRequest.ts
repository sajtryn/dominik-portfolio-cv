export type ProjectRequest = {
  service: string;
  timeline: string;
  name: string;
  email: string;
  details: string;
};

const ENDPOINT = "https://api.web3forms.com/submit";

// Web3Forms access keys are public by design (they only identify the inbox), so
// shipping one in the client bundle is expected. Submissions must come from the
// browser: server-side calls need a paid plan. Next inlines this at build time,
// so changing it requires a redeploy.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

// Throws on any failure so the form shows its error state instead of a false
// success.
export async function submitProjectRequest(data: ProjectRequest): Promise<void> {
  if (!ACCESS_KEY) throw new Error("NEXT_PUBLIC_WEB3FORMS_KEY is not set");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `Portfolio request: ${data.service} (${data.name})`,
      from_name: "domrod.eu contact form",
      name: data.name,
      email: data.email, // used by Web3Forms as the reply-to address
      topic: data.service,
      timeline: data.timeline,
      message: data.details,
    }),
    signal: AbortSignal.timeout(15000),
  });

  const result: { success?: boolean } = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(`Web3Forms request failed (${response.status})`);
  }
}
