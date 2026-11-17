export type ProjectRequest = {
  service: string;
  timeline: string;
  name: string;
  email: string;
  details: string;
};

// Mock: resolves after 2s. Replace the body with a real request (Web3Forms,
// EmailJS, ...) and throw on failure; the form already handles the error state.
export async function submitProjectRequest(data: ProjectRequest): Promise<void> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
