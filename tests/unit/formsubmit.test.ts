import { afterEach, describe, expect, it, vi } from "vitest";

async function load(extra: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("EMAIL_DRIVER", "formsubmit");
  for (const [k, v] of Object.entries(extra)) vi.stubEnv(k, v);
  return import("@/server/email");
}

const message = { to: "info@nsdbusinessltd.com", subject: "General enquiry from Ada", text: "Hello", replyTo: "ada@example.test", fields: { Name: "Ada", Message: "Hello" } };

afterEach(() => vi.unstubAllEnvs());

describe("FormSubmit request (sent by the visitor's browser)", () => {
  it("targets FormSubmit's AJAX endpoint with the fields, subject and Reply-To", async () => {
    const { formSubmitRequest } = await load();
    const req = formSubmitRequest(message);
    expect(req.url).toBe("https://formsubmit.co/ajax/info%40nsdbusinessltd.com");
    expect(req.payload).toEqual({ Name: "Ada", Message: "Hello", _subject: "General enquiry from Ada", _replyto: "ada@example.test", _template: "table", _captcha: "false" });
  });

  it("uses the activation alias instead of the address when set", async () => {
    const { formSubmitRequest } = await load({ FORMSUBMIT_ALIAS: "a1b2c3d4e5" });
    expect(formSubmitRequest(message).url).toBe("https://formsubmit.co/ajax/a1b2c3d4e5");
  });

  it("is never sent from the server", async () => {
    const { sendEmail } = await load();
    await expect(sendEmail(message)).rejects.toThrow(/browser/);
  });

  it("is the default delivery method in production, with forms enabled and no settings", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.EMAIL_DRIVER;
    const { env } = await import("@/server/env");
    expect(env.EMAIL_DRIVER).toBe("formsubmit");
    expect(env.formsEnabled).toBe(true);
  });
});
