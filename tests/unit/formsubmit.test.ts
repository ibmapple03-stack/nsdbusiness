import { afterEach, describe, expect, it, vi } from "vitest";

async function load(driver: string, extra: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("EMAIL_DRIVER", driver);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.nsdbusinessltd.com");
  for (const [k, v] of Object.entries(extra)) vi.stubEnv(k, v);
  return import("@/server/email");
}

const message = { to: "info@nsdbusinessltd.com", subject: "General enquiry from Ada", text: "Hello", replyTo: "ada@example.test", fields: { Name: "Ada", Message: "Hello" } };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("FormSubmit delivery", () => {
  it("posts the fields to FormSubmit's AJAX endpoint with the site as referer", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: "true" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendEmail } = await load("formsubmit");
    await sendEmail(message);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://formsubmit.co/ajax/info%40nsdbusinessltd.com");
    expect((init.headers as Record<string, string>).Referer).toBe("https://www.nsdbusinessltd.com/");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ Name: "Ada", Message: "Hello", _subject: "General enquiry from Ada", _replyto: "ada@example.test", _template: "table", _captcha: "false" });
  });

  it("uses the activation alias instead of the address when set", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: "true" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendEmail } = await load("formsubmit", { FORMSUBMIT_ALIAS: "a1b2c3d4e5" });
    await sendEmail(message);
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe("https://formsubmit.co/ajax/a1b2c3d4e5");
  });

  it("reports when the form still needs activating", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: "false", message: "This form needs Activation." }), { status: 200 })));
    const { sendEmail, EmailNotActivatedError } = await load("formsubmit");
    await expect(sendEmail(message)).rejects.toBeInstanceOf(EmailNotActivatedError);
  });

  it("is the default delivery method in production, with forms enabled and no settings", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("EMAIL_DRIVER", "");
    delete process.env.EMAIL_DRIVER;
    const { env } = await import("@/server/env");
    expect(env.EMAIL_DRIVER).toBe("formsubmit");
    expect(env.formsEnabled).toBe(true);
  });
});
