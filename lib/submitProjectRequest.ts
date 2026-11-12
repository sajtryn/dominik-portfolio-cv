export type ProjectRequest = {
  service: string;
  timeline: string;
  name: string;
  email: string;
  details: string;
};

/**
 * Sends a project request from the Contact section.
 *
 * Currently a mock: waits 2 seconds and resolves. To go live, replace the body
 * with a real request and throw on failure — the form already shows a loading
 * state while this runs and an error message if it throws.
 *
 * Web3Forms example (key from https://web3forms.com, set in .env.local):
 *
 *   const res = await fetch("https://api.web3forms.com/submit", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", Accept: "application/json" },
 *     body: JSON.stringify({
 *       access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
 *       subject: `New project request: ${data.service}`,
 *       from_name: data.name,
 *       ...data,
 *     }),
 *   });
 *   const json = await res.json();
 *   if (!res.ok || !json.success) throw new Error(json.message ?? "Request failed");
 *
 * EmailJS works the same way: call emailjs.send(serviceId, templateId, data, publicKey)
 * here and let any error propagate.
 */
export async function submitProjectRequest(data: ProjectRequest): Promise<void> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
